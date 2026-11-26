import { VbaFormControl, VirtualSheetData } from '../types';
import {
  VbaExpr,
  VbaProgram,
  VbaRunOptions,
  VbaRunResult,
  VbaStmt,
  VbaTraceStep,
  VbaVarType
} from './types';
import { parseVbaProgram } from './parser';

const COLOR_CONSTANTS: Record<string, string> = {
  VBRED: '#dc2626',
  VBGREEN: '#16a34a',
  VBBLUE: '#2563eb',
  VBYELLOW: '#eab308',
  VBWHITE: '#ffffff',
  VBBLACK: '#0f172a',
  VBGRAY: '#64748b',
  XLUP: '__XLUP__'
};

type RuntimeVal =
  | string
  | number
  | boolean
  | { __kind: 'WorksheetRef'; name: string }
  | { __kind: 'CellsRef'; sheetName: string; row: number; col: number }
  | { __kind: 'RowsRef'; sheetName: string };

class RuntimeException extends Error {
  line: number;
  isUnsupported: boolean;
  isLimitExceeded: boolean;
  constructor(
    message: string,
    line: number,
    isUnsupported = false,
    isLimitExceeded = false
  ) {
    super(message);
    this.line = line;
    this.isUnsupported = isUnsupported;
    this.isLimitExceeded = isLimitExceeded;
  }
}

class ExitSubSignal {}

interface VarSlot {
  value: RuntimeVal;
  varType: VbaVarType;
  isConst: boolean;
}

function defaultForType(t: VbaVarType): RuntimeVal {
  if (t === 'String') return '';
  if (t === 'Long' || t === 'Double') return 0;
  if (t === 'Boolean') return false;
  return '';
}

function toVbaString(v: RuntimeVal): string {
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return v;
  return '';
}

function toVbaNumber(v: RuntimeVal, line: number): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? -1 : 0;
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed === '') {
      throw new RuntimeException(
        `Satır ${line}: Boş metin sayıya dönüştürülemedi.`,
        line
      );
    }
    const normalized = trimmed.replace(',', '.');
    const n = Number(normalized);
    if (!Number.isFinite(n)) {
      throw new RuntimeException(
        `Satır ${line}: "${v}" değeri geçerli bir sayı değil.`,
        line
      );
    }
    return n;
  }
  throw new RuntimeException(`Satır ${line}: Geçersiz sayısal ifade.`, line);
}

function isVbaNumeric(v: RuntimeVal): boolean {
  if (typeof v === 'number') return Number.isFinite(v);
  if (typeof v === 'boolean') return false;
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed === '') return false;
    const normalized = trimmed.replace(',', '.');
    return Number.isFinite(Number(normalized));
  }
  return false;
}

function toVbaBoolean(v: RuntimeVal): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const u = v.trim().toUpperCase();
    if (u === 'TRUE') return true;
    if (u === 'FALSE' || u === '') return false;
    const n = Number(u);
    if (Number.isFinite(n)) return n !== 0;
    return true;
  }
  return false;
}

function vbaRoundHalfToEven(n: number): number {
  const floor = Math.floor(n);
  const diff = n - floor;
  if (diff > 0.5) return floor + 1;
  if (diff < 0.5) return floor;
  return floor % 2 === 0 ? floor : floor + 1;
}

export function runVbaSimulation(options: VbaRunOptions): VbaRunResult {
  const maxSteps = options.maxSteps ?? 5000;
  const maxLoopIterations = options.maxLoopIterations ?? 1000;
  const maxTimeMs = options.maxTimeMs ?? 1500;
  const maxOutputs = options.maxOutputs ?? 200;
  const captureTrace = options.captureTrace ?? true;

  const controls: VbaFormControl[] = options.controls.map((c) => ({
    ...c,
    items: c.items ? [...c.items] : undefined
  }));

  if (options.listSelections) {
    for (const [name, idx] of Object.entries(options.listSelections)) {
      const ctrl = controls.find(
        (c) => c.name.toUpperCase() === name.toUpperCase()
      );
      if (ctrl) ctrl.listIndex = idx;
    }
  }

  const sheet: VirtualSheetData | undefined = options.sheet
    ? {
        ...options.sheet,
        columns: [...options.sheet.columns],
        cells: { ...options.sheet.cells }
      }
    : undefined;

  const parsed = parseVbaProgram(options.code);
  if (parsed.error || !parsed.program) {
    return {
      ok: false,
      error: parsed.error || { line: 1, message: 'Kod ayrıştırılamadı.' },
      msgBoxes: [],
      controls,
      sheet,
      readCells: [],
      writtenCells: [],
      trace: [],
      stepsExecuted: 0
    };
  }

  const program = parsed.program;
  const lines = options.code.replace(/\r\n/g, '\n').split('\n');
  const startTime = Date.now();
  let stepsExecuted = 0;
  const msgBoxes: string[] = [];
  const readCells = new Set<string>();
  const writtenCells = new Set<string>();
  const trace: VbaTraceStep[] = [];
  const loopCounters: Record<string, number> = {};
  const vars = new Map<string, VarSlot>();

  const findControl = (name: string): VbaFormControl | undefined =>
    controls.find((c) => c.name.toUpperCase() === name.toUpperCase());

  const snapshotVars = (): Record<string, string | number | boolean> => {
    const out: Record<string, string | number | boolean> = {};
    for (const [k, slot] of vars.entries()) {
      if (typeof slot.value === 'object') {
        out[k] = `[${slot.value.__kind}]`;
      } else {
        out[k] = slot.value;
      }
    }
    return out;
  };

  const recordTrace = (line: number, note: string) => {
    if (!captureTrace || trace.length >= 500) return;
    trace.push({
      stepIndex: trace.length + 1,
      line,
      code: (lines[line - 1] || '').trim(),
      variables: snapshotVars(),
      loopCounters: { ...loopCounters },
      note
    });
  };

  const tickStep = (line: number) => {
    stepsExecuted++;
    if (stepsExecuted > maxSteps) {
      throw new RuntimeException(
        `Güvenlik sınırı: Maksimum adım sayısı (${maxSteps}) aşıldı. Sonsuz döngü olabilir.`,
        line,
        false,
        true
      );
    }
    if (Date.now() - startTime > maxTimeMs) {
      throw new RuntimeException(
        `Zaman sınırı: Kod çalışması ${maxTimeMs} ms sınırını aştı.`,
        line,
        false,
        true
      );
    }
  };

  const getCellVal = (row: number, col: number, line: number): RuntimeVal => {
    if (!sheet) {
      throw new RuntimeException(
        `Satır ${line}: Bu etkinlikte sanal çalışma sayfası tanımlı değil.`,
        line
      );
    }
    if (row < 1 || col < 1) {
      throw new RuntimeException(
        `Satır ${line}: Hücre satır ve sütun numaraları en az 1 olmalıdır.`,
        line
      );
    }
    const key = `${row},${col}`;
    readCells.add(key);
    const val = sheet.cells[key];
    return val === undefined ? '' : val;
  };

  const setCellVal = (row: number, col: number, val: RuntimeVal, line: number) => {
    if (!sheet) {
      throw new RuntimeException(
        `Satır ${line}: Bu etkinlikte sanal çalışma sayfası tanımlı değil.`,
        line
      );
    }
    if (row < 1 || col < 1) {
      throw new RuntimeException(
        `Satır ${line}: Hücre satır ve sütun numaraları en az 1 olmalıdır.`,
        line
      );
    }
    const key = `${row},${col}`;
    writtenCells.add(key);
    if (typeof val === 'object') {
      sheet.cells[key] = '';
    } else {
      sheet.cells[key] = val;
    }
  };

  const findLastUsedRowInCol = (col: number): number => {
    if (!sheet) return 1;
    let maxRow = 1;
    for (const [key, val] of Object.entries(sheet.cells)) {
      if (val === '' || val === undefined || val === null) continue;
      const [rStr, cStr] = key.split(',');
      if (Number(cStr) === col) {
        const r = Number(rStr);
        if (r > maxRow) maxRow = r;
      }
    }
    return maxRow;
  };

  const getControlProp = (
    ctrl: VbaFormControl,
    prop: string,
    line: number
  ): RuntimeVal => {
    const p = prop.toUpperCase();
    if (p === 'CAPTION') return ctrl.caption ?? '';
    if (p === 'VALUE' || p === 'TEXT') {
      if (ctrl.type === 'CheckBox' || ctrl.type === 'OptionButton') {
        return Boolean(ctrl.value);
      }
      return ctrl.value !== undefined ? String(ctrl.value) : '';
    }
    if (p === 'BACKCOLOR') return ctrl.backColor ?? '#ffffff';
    if (p === 'FORECOLOR') return ctrl.foreColor ?? '#0f172a';
    if (p === 'WIDTH') return ctrl.width ?? 100;
    if (p === 'HEIGHT') return ctrl.height ?? 32;
    if (p === 'LISTINDEX') {
      if (ctrl.type !== 'ListBox') {
        throw new RuntimeException(
          `Satır ${line}: ListIndex yalnızca ListBox bileşeninde kullanılır.`,
          line
        );
      }
      return ctrl.listIndex ?? -1;
    }
    if (p === 'LISTCOUNT') {
      if (ctrl.type !== 'ListBox') {
        throw new RuntimeException(
          `Satır ${line}: ListCount yalnızca ListBox bileşeninde kullanılır.`,
          line
        );
      }
      return ctrl.items?.length ?? 0;
    }
    throw new RuntimeException(
      `Satır ${line}: '${ctrl.name}.${prop}' özelliği bu simülatörde desteklenmiyor.`,
      line,
      true
    );
  };

  const setControlProp = (
    ctrl: VbaFormControl,
    prop: string,
    val: RuntimeVal,
    line: number
  ) => {
    const p = prop.toUpperCase();
    if (p === 'CAPTION') {
      ctrl.caption = toVbaString(val);
      return;
    }
    if (p === 'VALUE' || p === 'TEXT') {
      if (ctrl.type === 'CheckBox' || ctrl.type === 'OptionButton') {
        ctrl.value = toVbaBoolean(val);
      } else {
        ctrl.value = toVbaString(val);
      }
      return;
    }
    if (p === 'BACKCOLOR') {
      ctrl.backColor = toVbaString(val);
      return;
    }
    if (p === 'FORECOLOR') {
      ctrl.foreColor = toVbaString(val);
      return;
    }
    if (p === 'WIDTH') {
      ctrl.width = toVbaNumber(val, line);
      return;
    }
    if (p === 'HEIGHT') {
      ctrl.height = toVbaNumber(val, line);
      return;
    }
    if (p === 'LISTINDEX') {
      ctrl.listIndex = Math.trunc(toVbaNumber(val, line));
      return;
    }
    throw new RuntimeException(
      `Satır ${line}: '${ctrl.name}.${prop}' özelliği atama için desteklenmiyor.`,
      line,
      true
    );
  };

  const evalExpr = (expr: VbaExpr): RuntimeVal => {
    switch (expr.kind) {
      case 'NumberLiteral':
        return expr.value;
      case 'StringLiteral':
        return expr.value;
      case 'BooleanLiteral':
        return expr.value;
      case 'Identifier': {
        const upper = expr.name.toUpperCase();
        if (COLOR_CONSTANTS[upper]) return COLOR_CONSTANTS[upper];
        if (upper === 'ROWS') {
          return { __kind: 'RowsRef', sheetName: sheet?.name || 'Sayfa1' };
        }
        const ctrl = findControl(expr.name);
        if (ctrl) {
          // Default property in VBA for TextBox is Value, Label is Caption
          if (ctrl.type === 'TextBox') return ctrl.value !== undefined ? String(ctrl.value) : '';
          if (ctrl.type === 'CheckBox' || ctrl.type === 'OptionButton') return Boolean(ctrl.value);
          return ctrl.caption ?? '';
        }
        const slot = vars.get(upper);
        if (slot) return slot.value;
        if (program.optionExplicit) {
          throw new RuntimeException(
            `Satır ${expr.line}: Option Explicit etkin: '${expr.name}' değişkeni Dim ile tanımlanmamış.`,
            expr.line
          );
        }
        return '';
      }
      case 'MemberAccess': {
        // Handle ctrl.Font.Size
        if (
          expr.object.kind === 'MemberAccess' &&
          expr.object.property.toUpperCase() === 'FONT' &&
          expr.property.toUpperCase() === 'SIZE' &&
          expr.object.object.kind === 'Identifier'
        ) {
          const ctrl = findControl(expr.object.object.name);
          if (ctrl) return ctrl.fontSize ?? 12;
        }

        // Handle Cells(...).End(xlUp).Row
        if (
          expr.property.toUpperCase() === 'ROW' &&
          expr.object.kind === 'CallExpr' &&
          expr.object.callee.kind === 'MemberAccess' &&
          expr.object.callee.property.toUpperCase() === 'END'
        ) {
          const cellsCall = expr.object.callee.object;
          if (cellsCall.kind === 'CallExpr' && cellsCall.args.length >= 2) {
            const colNum = Math.trunc(toVbaNumber(evalExpr(cellsCall.args[1]), expr.line));
            return findLastUsedRowInCol(colNum);
          }
        }

        // Handle ws.Rows.Count or Rows.Count
        if (expr.property.toUpperCase() === 'COUNT') {
          const objVal = evalExpr(expr.object);
          if (typeof objVal === 'object' && objVal.__kind === 'RowsRef') {
            return sheet?.rows ?? 20;
          }
        }
        if (expr.property.toUpperCase() === 'ROWS') {
          const objVal = evalExpr(expr.object);
          if (typeof objVal === 'object' && objVal.__kind === 'WorksheetRef') {
            return { __kind: 'RowsRef', sheetName: objVal.name };
          }
        }

        // Handle Cells(r, c).Value
        if (
          expr.object.kind === 'CallExpr' &&
          ((expr.object.callee.kind === 'Identifier' &&
            expr.object.callee.name.toUpperCase() === 'CELLS') ||
            (expr.object.callee.kind === 'MemberAccess' &&
              expr.object.callee.property.toUpperCase() === 'CELLS'))
        ) {
          const args = expr.object.args;
          if (args.length < 2) {
            throw new RuntimeException(
              `Satır ${expr.line}: Cells(satır, sütun) için iki parametre gerekir.`,
              expr.line
            );
          }
          const r = Math.trunc(toVbaNumber(evalExpr(args[0]), expr.line));
          const c = Math.trunc(toVbaNumber(evalExpr(args[1]), expr.line));
          if (expr.property.toUpperCase() === 'VALUE') {
            return getCellVal(r, c, expr.line);
          }
        }

        if (expr.object.kind === 'Identifier') {
          const ctrl = findControl(expr.object.name);
          if (ctrl) {
            return getControlProp(ctrl, expr.property, expr.line);
          }
        }

        throw new RuntimeException(
          `Satır ${expr.line}: '.${expr.property}' erişimi çözümlenemedi.`,
          expr.line
        );
      }
      case 'CallExpr': {
        // Built-in functions
        if (expr.callee.kind === 'Identifier') {
          const fn = expr.callee.name.toUpperCase();
          if (fn === 'TRIM') {
            const v = expr.args[0] ? evalExpr(expr.args[0]) : '';
            return toVbaString(v).trim();
          }
          if (fn === 'LEN') {
            const v = expr.args[0] ? evalExpr(expr.args[0]) : '';
            return toVbaString(v).length;
          }
          if (fn === 'UCASE') {
            const v = expr.args[0] ? evalExpr(expr.args[0]) : '';
            return toVbaString(v).toLocaleUpperCase('tr-TR');
          }
          if (fn === 'LCASE') {
            const v = expr.args[0] ? evalExpr(expr.args[0]) : '';
            return toVbaString(v).toLocaleLowerCase('tr-TR');
          }
          if (fn === 'ISNUMERIC') {
            const v = expr.args[0] ? evalExpr(expr.args[0]) : '';
            return isVbaNumeric(v);
          }
          if (fn === 'CLNG') {
            const v = expr.args[0] ? evalExpr(expr.args[0]) : 0;
            return vbaRoundHalfToEven(toVbaNumber(v, expr.line));
          }
          if (fn === 'CDBL') {
            const v = expr.args[0] ? evalExpr(expr.args[0]) : 0;
            return toVbaNumber(v, expr.line);
          }
          if (fn === 'CSTR') {
            const v = expr.args[0] ? evalExpr(expr.args[0]) : '';
            return toVbaString(v);
          }
          if (fn === 'VAL') {
            const v = expr.args[0] ? evalExpr(expr.args[0]) : '';
            const n = parseFloat(toVbaString(v).trim());
            return Number.isFinite(n) ? n : 0;
          }
          if (fn === 'WORKSHEETS' || fn === 'SHEETS') {
            const nameVal = expr.args[0] ? toVbaString(evalExpr(expr.args[0])) : sheet?.name || 'Sayfa1';
            return { __kind: 'WorksheetRef', name: nameVal };
          }
          if (fn === 'CELLS') {
            if (expr.args.length < 2) {
              throw new RuntimeException(
                `Satır ${expr.line}: Cells(satır, sütun) için iki parametre gerekir.`,
                expr.line
              );
            }
            const r = Math.trunc(toVbaNumber(evalExpr(expr.args[0]), expr.line));
            const c = Math.trunc(toVbaNumber(evalExpr(expr.args[1]), expr.line));
            return getCellVal(r, c, expr.line);
          }
        }

        // ws.Cells(r, c) or ctrl.List(idx)
        if (expr.callee.kind === 'MemberAccess') {
          const prop = expr.callee.property.toUpperCase();
          if (prop === 'CELLS') {
            if (expr.args.length < 2) {
              throw new RuntimeException(
                `Satır ${expr.line}: Cells(satır, sütun) için iki parametre gerekir.`,
                expr.line
              );
            }
            const r = Math.trunc(toVbaNumber(evalExpr(expr.args[0]), expr.line));
            const c = Math.trunc(toVbaNumber(evalExpr(expr.args[1]), expr.line));
            return getCellVal(r, c, expr.line);
          }
          if (prop === 'LIST' && expr.callee.object.kind === 'Identifier') {
            const ctrl = findControl(expr.callee.object.name);
            if (ctrl && ctrl.type === 'ListBox') {
              const idx = Math.trunc(toVbaNumber(evalExpr(expr.args[0]), expr.line));
              const items = ctrl.items || [];
              if (idx < 0 || idx >= items.length) {
                throw new RuntimeException(
                  `Satır ${expr.line}: ListBox indeksi (${idx}) sınır dışında.`,
                  expr.line
                );
              }
              return items[idx];
            }
          }
        }

        throw new RuntimeException(
          `Satır ${expr.line}: Bu fonksiyon veya çağrı simülatörde desteklenmiyor.`,
          expr.line,
          true
        );
      }
      case 'UnaryOp': {
        const val = evalExpr(expr.expr);
        if (expr.op === '-') return -toVbaNumber(val, expr.line);
        if (expr.op === '+') return toVbaNumber(val, expr.line);
        if (expr.op === 'NOT') return !toVbaBoolean(val);
        return val;
      }
      case 'BinaryOp': {
        const op = expr.op;
        if (op === 'AND') {
          return toVbaBoolean(evalExpr(expr.left)) && toVbaBoolean(evalExpr(expr.right));
        }
        if (op === 'OR') {
          return toVbaBoolean(evalExpr(expr.left)) || toVbaBoolean(evalExpr(expr.right));
        }
        const left = evalExpr(expr.left);
        const right = evalExpr(expr.right);

        if (op === '&') {
          return toVbaString(left) + toVbaString(right);
        }
        if (op === '+') {
          return toVbaNumber(left, expr.line) + toVbaNumber(right, expr.line);
        }
        if (op === '-') {
          return toVbaNumber(left, expr.line) - toVbaNumber(right, expr.line);
        }
        if (op === '*') {
          return toVbaNumber(left, expr.line) * toVbaNumber(right, expr.line);
        }
        if (op === '/') {
          const denom = toVbaNumber(right, expr.line);
          if (denom === 0) {
            throw new RuntimeException(`Satır ${expr.line}: Sıfıra bölme hatası.`, expr.line);
          }
          return toVbaNumber(left, expr.line) / denom;
        }
        if (op === 'MOD') {
          const denom = toVbaNumber(right, expr.line);
          if (denom === 0) {
            throw new RuntimeException(`Satır ${expr.line}: Sıfıra Mod hatası.`, expr.line);
          }
          return toVbaNumber(left, expr.line) % denom;
        }
        // Comparisons
        if (['=', '<>', '<', '>', '<=', '>='].includes(op)) {
          const bothNum = typeof left === 'number' && typeof right === 'number';
          const bothBool = typeof left === 'boolean' && typeof right === 'boolean';
          let cmp = 0;
          if (bothNum) {
            cmp = (left as number) - (right as number);
          } else if (bothBool) {
            cmp = Number(left) - Number(right);
          } else if (
            (typeof left === 'number' && typeof right === 'string' && isVbaNumeric(right)) ||
            (typeof right === 'number' && typeof left === 'string' && isVbaNumeric(left))
          ) {
            cmp = toVbaNumber(left, expr.line) - toVbaNumber(right, expr.line);
          } else {
            const ls = toVbaString(left);
            const rs = toVbaString(right);
            cmp = ls === rs ? 0 : ls < rs ? -1 : 1;
          }
          if (op === '=') return cmp === 0;
          if (op === '<>') return cmp !== 0;
          if (op === '<') return cmp < 0;
          if (op === '>') return cmp > 0;
          if (op === '<=') return cmp <= 0;
          if (op === '>=') return cmp >= 0;
        }
        return false;
      }
    }
  };

  const assignTarget = (target: VbaExpr, value: RuntimeVal, line: number) => {
    if (target.kind === 'Identifier') {
      const upper = target.name.toUpperCase();
      const ctrl = findControl(target.name);
      if (ctrl) {
        setControlProp(ctrl, ctrl.type === 'TextBox' ? 'Value' : 'Caption', value, line);
        return;
      }
      const existing = vars.get(upper);
      if (existing) {
        if (existing.isConst) {
          throw new RuntimeException(
            `Satır ${line}: Const olarak tanımlanan '${target.name}' sabiti değiştirilemez.`,
            line
          );
        }
        if (existing.varType === 'Long') {
          existing.value = vbaRoundHalfToEven(toVbaNumber(value, line));
        } else if (existing.varType === 'Double') {
          existing.value = toVbaNumber(value, line);
        } else if (existing.varType === 'String') {
          existing.value = toVbaString(value);
        } else if (existing.varType === 'Boolean') {
          existing.value = toVbaBoolean(value);
        } else {
          existing.value = value;
        }
        return;
      }
      if (program.optionExplicit) {
        throw new RuntimeException(
          `Satır ${line}: Option Explicit etkin: '${target.name}' değişkeni Dim ile tanımlanmamış.`,
          line
        );
      }
      vars.set(upper, { value, varType: 'Variant', isConst: false });
      return;
    }

    if (target.kind === 'MemberAccess') {
      // ctrl.Font.Size = 14
      if (
        target.object.kind === 'MemberAccess' &&
        target.object.property.toUpperCase() === 'FONT' &&
        target.property.toUpperCase() === 'SIZE' &&
        target.object.object.kind === 'Identifier'
      ) {
        const ctrl = findControl(target.object.object.name);
        if (ctrl) {
          ctrl.fontSize = toVbaNumber(value, line);
          return;
        }
      }

      // Cells(r, c).Value = ... or ws.Cells(r, c).Value = ...
      if (
        target.property.toUpperCase() === 'VALUE' &&
        target.object.kind === 'CallExpr' &&
        ((target.object.callee.kind === 'Identifier' &&
          target.object.callee.name.toUpperCase() === 'CELLS') ||
          (target.object.callee.kind === 'MemberAccess' &&
            target.object.callee.property.toUpperCase() === 'CELLS'))
      ) {
        const args = target.object.args;
        const r = Math.trunc(toVbaNumber(evalExpr(args[0]), line));
        const c = Math.trunc(toVbaNumber(evalExpr(args[1]), line));
        setCellVal(r, c, value, line);
        return;
      }

      if (target.object.kind === 'Identifier') {
        const ctrl = findControl(target.object.name);
        if (ctrl) {
          setControlProp(ctrl, target.property, value, line);
          return;
        }
      }
    }

    if (
      target.kind === 'CallExpr' &&
      ((target.callee.kind === 'Identifier' &&
        target.callee.name.toUpperCase() === 'CELLS') ||
        (target.callee.kind === 'MemberAccess' &&
          target.callee.property.toUpperCase() === 'CELLS'))
    ) {
      const r = Math.trunc(toVbaNumber(evalExpr(target.args[0]), line));
      const c = Math.trunc(toVbaNumber(evalExpr(target.args[1]), line));
      setCellVal(r, c, value, line);
      return;
    }

    throw new RuntimeException(
      `Satır ${line}: Bu hedefe atama yapılamaz.`,
      line
    );
  };

  const execStmt = (stmt: VbaStmt) => {
    tickStep(stmt.line);

    switch (stmt.kind) {
      case 'OptionExplicit':
        return;
      case 'DimStmt': {
        for (const decl of stmt.declarations) {
          vars.set(decl.name.toUpperCase(), {
            value: defaultForType(decl.varType),
            varType: decl.varType,
            isConst: false
          });
        }
        recordTrace(stmt.line, 'Değişken tanımlandı');
        return;
      }
      case 'ConstStmt': {
        const val = evalExpr(stmt.value);
        vars.set(stmt.name.toUpperCase(), {
          value: val,
          varType: stmt.varType,
          isConst: true
        });
        recordTrace(stmt.line, `Sabit tanımlandı: ${stmt.name}`);
        return;
      }
      case 'AssignStmt': {
        const val = evalExpr(stmt.value);
        assignTarget(stmt.target, val, stmt.line);
        recordTrace(stmt.line, 'Atama yapıldı');
        return;
      }
      case 'MsgBoxStmt': {
        if (msgBoxes.length >= maxOutputs) {
          throw new RuntimeException(
            `Çıktı sınırı: En fazla ${maxOutputs} MsgBox gösterilebilir.`,
            stmt.line,
            false,
            true
          );
        }
        const text = stmt.args.length > 0 ? toVbaString(evalExpr(stmt.args[0])) : '';
        msgBoxes.push(text);
        recordTrace(stmt.line, `MsgBox: "${text}"`);
        return;
      }
      case 'ExitSubStmt': {
        recordTrace(stmt.line, 'Exit Sub ile alt yordamdan çıkıldı');
        throw new ExitSubSignal();
      }
      case 'IfStmt': {
        let matched = false;
        for (const br of stmt.branches) {
          const condVal = toVbaBoolean(evalExpr(br.cond));
          recordTrace(br.line, `Koşul değerlendirildi: ${condVal ? 'Doğru' : 'Yanlış'}`);
          if (condVal) {
            matched = true;
            for (const s of br.body) execStmt(s);
            break;
          }
        }
        if (!matched && stmt.elseBody.length > 0) {
          for (const s of stmt.elseBody) execStmt(s);
        }
        return;
      }
      case 'ForStmt': {
        const startVal = toVbaNumber(evalExpr(stmt.start), stmt.line);
        const endVal = toVbaNumber(evalExpr(stmt.end), stmt.line);
        const stepVal = stmt.step ? toVbaNumber(evalExpr(stmt.step), stmt.line) : 1;
        if (stepVal === 0) {
          throw new RuntimeException(
            `Satır ${stmt.line}: For döngüsünde Step değeri 0 olamaz.`,
            stmt.line
          );
        }

        const key = stmt.varName.toUpperCase();
        if (!vars.has(key)) {
          if (program.optionExplicit) {
            throw new RuntimeException(
              `Satır ${stmt.line}: Option Explicit etkin: '${stmt.varName}' döngü sayacı Dim ile tanımlanmamış.`,
              stmt.line
            );
          }
          vars.set(key, { value: startVal, varType: 'Long', isConst: false });
        }

        let iterCount = 0;
        let current = startVal;
        while (stepVal > 0 ? current <= endVal : current >= endVal) {
          iterCount++;
          if (iterCount > maxLoopIterations) {
            throw new RuntimeException(
              `Döngü sınırı: For döngüsü ${maxLoopIterations} yinelemeyi aştı.`,
              stmt.line,
              false,
              true
            );
          }
          vars.get(key)!.value = current;
          loopCounters[stmt.varName] = current;
          recordTrace(stmt.line, `For adımı: ${stmt.varName} = ${current}`);

          for (const s of stmt.body) {
            execStmt(s);
          }

          current = Number((vars.get(key)!.value as number) + stepVal);
        }
        return;
      }
      case 'DoWhileStmt': {
        let iterCount = 0;
        while (toVbaBoolean(evalExpr(stmt.cond))) {
          iterCount++;
          if (iterCount > maxLoopIterations) {
            throw new RuntimeException(
              `Döngü sınırı: Do While döngüsü ${maxLoopIterations} yinelemeyi aştı.`,
              stmt.line,
              false,
              true
            );
          }
          loopCounters[`DoWhile_L${stmt.line}`] = iterCount;
          recordTrace(stmt.line, `Do While yinelemesi #${iterCount}`);
          for (const s of stmt.body) {
            execStmt(s);
          }
        }
        return;
      }
      case 'CallStmt': {
        // Handle ListBox.AddItem, ListBox.RemoveItem, ListBox.Clear
        let targetExpr = stmt.expr;
        let callArgs = stmt.args;
        if (targetExpr.kind === 'CallExpr' && callArgs.length === 0) {
          callArgs = targetExpr.args;
          targetExpr = targetExpr.callee;
        }

        if (
          targetExpr.kind === 'MemberAccess' &&
          targetExpr.object.kind === 'Identifier'
        ) {
          const ctrl = findControl(targetExpr.object.name);
          const method = targetExpr.property.toUpperCase();
          if (ctrl && ctrl.type === 'ListBox') {
            if (!ctrl.items) ctrl.items = [];
            if (method === 'ADDITEM') {
              const itemText = callArgs[0] ? toVbaString(evalExpr(callArgs[0])) : '';
              ctrl.items.push(itemText);
              recordTrace(stmt.line, `${ctrl.name}.AddItem "${itemText}"`);
              return;
            }
            if (method === 'REMOVEITEM') {
              const idx = callArgs[0] ? Math.trunc(toVbaNumber(evalExpr(callArgs[0]), stmt.line)) : -1;
              if (idx < 0 || idx >= ctrl.items.length) {
                throw new RuntimeException(
                  `Satır ${stmt.line}: Listeden öğe kaldırmadan önce geçerli bir öğe seçmelisin (ListIndex = ${idx}).`,
                  stmt.line
                );
              }
              ctrl.items.splice(idx, 1);
              ctrl.listIndex = -1;
              recordTrace(stmt.line, `${ctrl.name}.RemoveItem ${idx}`);
              return;
            }
            if (method === 'CLEAR') {
              ctrl.items = [];
              ctrl.listIndex = -1;
              recordTrace(stmt.line, `${ctrl.name}.Clear`);
              return;
            }
          }
        }

        throw new RuntimeException(
          `Satır ${stmt.line}: Bu komut bu eğitim simülatöründe desteklenmiyor. Bu bölümü Excel VBA’da deneyebilirsin.`,
          stmt.line,
          true
        );
      }
    }
  };

  try {
    let targetSub = options.eventSubName
      ? program.subs.find(
          (s) => s.name.toUpperCase() === options.eventSubName!.toUpperCase()
        )
      : undefined;

    if (!targetSub && program.subs.length > 0 && !options.eventSubName) {
      targetSub = program.subs[0];
    }

    if (options.eventSubName && !targetSub && program.topLevelStmts.length === 0) {
      return {
        ok: false,
        error: {
          line: 1,
          message: `'${options.eventSubName}' olay alt yordamı (Sub) kodda bulunamadı.`
        },
        msgBoxes,
        controls,
        sheet,
        readCells: Array.from(readCells),
        writtenCells: Array.from(writtenCells),
        trace,
        stepsExecuted
      };
    }

    const stmtsToRun = targetSub ? targetSub.body : program.topLevelStmts;
    try {
      for (const s of stmtsToRun) {
        execStmt(s);
      }
    } catch (sig) {
      if (!(sig instanceof ExitSubSignal)) throw sig;
    }

    return {
      ok: true,
      msgBoxes,
      controls,
      sheet,
      readCells: Array.from(readCells),
      writtenCells: Array.from(writtenCells),
      trace,
      stepsExecuted,
      executedSub: targetSub?.name
    };
  } catch (err) {
    if (err instanceof RuntimeException) {
      return {
        ok: false,
        error: {
          line: err.line,
          message: err.message,
          isUnsupported: err.isUnsupported,
          isLimitExceeded: err.isLimitExceeded
        },
        msgBoxes,
        controls,
        sheet,
        readCells: Array.from(readCells),
        writtenCells: Array.from(writtenCells),
        trace,
        stepsExecuted
      };
    }
    return {
      ok: false,
      error: {
        line: 1,
        message: 'Kod çalıştırılırken beklenmeyen bir hata oluştu.'
      },
      msgBoxes,
      controls,
      sheet,
      readCells: Array.from(readCells),
      writtenCells: Array.from(writtenCells),
      trace,
      stepsExecuted
    };
  }
}

function walkStmts(stmts: VbaStmt[], predicate: (s: VbaStmt) => boolean): boolean {
  for (const s of stmts) {
    if (predicate(s)) return true;
    if (s.kind === 'IfStmt') {
      for (const b of s.branches) {
        if (walkStmts(b.body, predicate)) return true;
      }
      if (walkStmts(s.elseBody, predicate)) return true;
    } else if (s.kind === 'ForStmt' || s.kind === 'DoWhileStmt') {
      if (walkStmts(s.body, predicate)) return true;
    }
  }
  return false;
}

export function hasLoopInVbaAst(program: VbaProgram): boolean {
  if (walkStmts(program.topLevelStmts, (s) => s.kind === 'ForStmt' || s.kind === 'DoWhileStmt')) {
    return true;
  }
  return program.subs.some((sub) =>
    walkStmts(sub.body, (s) => s.kind === 'ForStmt' || s.kind === 'DoWhileStmt')
  );
}

export function hasConditionInVbaAst(program: VbaProgram): boolean {
  if (walkStmts(program.topLevelStmts, (s) => s.kind === 'IfStmt')) {
    return true;
  }
  return program.subs.some((sub) =>
    walkStmts(sub.body, (s) => s.kind === 'IfStmt')
  );
}
