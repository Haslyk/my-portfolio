import {
  VbaExpr,
  VbaProgram,
  VbaSimError,
  VbaStmt,
  VbaSubDecl,
  VbaToken,
  VbaVarType
} from './types';
import { isUnsupportedKeyword, tokenizeVba } from './tokenizer';

class ParseException extends Error {
  line: number;
  isUnsupported: boolean;
  constructor(message: string, line: number, isUnsupported = false) {
    super(message);
    this.line = line;
    this.isUnsupported = isUnsupported;
  }
}

const UNSUPPORTED_MSG =
  'Bu komut bu eğitim simülatöründe desteklenmiyor. Bu bölümü Excel VBA’da deneyebilirsin.';

function parseVarType(raw: string): VbaVarType {
  const u = raw.toUpperCase();
  if (u === 'STRING') return 'String';
  if (u === 'LONG' || u === 'INTEGER') return 'Long';
  if (u === 'DOUBLE' || u === 'SINGLE') return 'Double';
  if (u === 'BOOLEAN') return 'Boolean';
  if (u === 'WORKSHEET') return 'Worksheet';
  return 'Variant';
}

class VbaParser {
  private tokens: VbaToken[];
  private pos = 0;

  constructor(tokens: VbaToken[]) {
    this.tokens = tokens;
  }

  private peek(offset = 0): VbaToken {
    const idx = this.pos + offset;
    if (idx >= this.tokens.length) return this.tokens[this.tokens.length - 1];
    return this.tokens[idx];
  }

  private advance(): VbaToken {
    const tok = this.peek();
    if (tok.type !== 'EOF') this.pos++;
    return tok;
  }

  private isKeyword(kw: string, offset = 0): boolean {
    const t = this.peek(offset);
    return t.type === 'KEYWORD' && t.value === kw;
  }

  private isAtLineEnd(): boolean {
    const t = this.peek();
    return t.type === 'NEWLINE' || t.type === 'EOF';
  }

  private skipNewlines(): void {
    while (this.peek().type === 'NEWLINE') {
      this.advance();
    }
  }

  private expectNewlineOrEof(): void {
    if (this.peek().type === 'EOF') return;
    if (this.peek().type === 'NEWLINE') {
      this.skipNewlines();
      return;
    }
    const t = this.peek();
    throw new ParseException(
      `Satır ${t.line}: Beklenmeyen ifade '${t.value}'. Satır sonu bekleniyordu.`,
      t.line
    );
  }

  private expectKeyword(kw: string): VbaToken {
    if (!this.isKeyword(kw)) {
      const t = this.peek();
      throw new ParseException(
        `Satır ${t.line}: '${kw}' bekleniyordu, '${t.value || 'satır sonu'}' bulundu.`,
        t.line
      );
    }
    return this.advance();
  }

  parseProgram(): VbaProgram {
    let optionExplicit = false;
    const subs: VbaSubDecl[] = [];
    const topLevelStmts: VbaStmt[] = [];

    this.skipNewlines();

    while (this.peek().type !== 'EOF') {
      if (this.isKeyword('OPTION')) {
        const line = this.peek().line;
        this.advance();
        this.expectKeyword('EXPLICIT');
        optionExplicit = true;
        topLevelStmts.push({ kind: 'OptionExplicit', line });
        this.expectNewlineOrEof();
        continue;
      }

      if (
        this.isKeyword('PRIVATE') ||
        this.isKeyword('PUBLIC') ||
        this.isKeyword('SUB')
      ) {
        subs.push(this.parseSubDecl());
        this.skipNewlines();
        continue;
      }

      topLevelStmts.push(this.parseStatement());
      this.skipNewlines();
    }

    return { optionExplicit, subs, topLevelStmts };
  }

  private parseSubDecl(): VbaSubDecl {
    const startLine = this.peek().line;
    let isPrivate = false;
    if (this.isKeyword('PRIVATE')) {
      isPrivate = true;
      this.advance();
    } else if (this.isKeyword('PUBLIC')) {
      this.advance();
    }

    if (this.peek().type === 'IDENT' && isUnsupportedKeyword(this.peek().value)) {
      throw new ParseException(
        `Satır ${this.peek().line}: ${UNSUPPORTED_MSG}`,
        this.peek().line,
        true
      );
    }

    this.expectKeyword('SUB');
    const nameTok = this.peek();
    if (nameTok.type !== 'IDENT') {
      throw new ParseException(
        `Satır ${nameTok.line}: Sub adı bekleniyordu.`,
        nameTok.line
      );
    }
    this.advance();

    const params: string[] = [];
    if (this.peek().type === 'LPAREN') {
      this.advance();
      while (this.peek().type !== 'RPAREN' && !this.isAtLineEnd()) {
        if (this.peek().type === 'IDENT') {
          params.push(this.advance().value);
          // Optional ByVal/ByRef or As Type inside params
          while (
            this.peek().type !== 'COMMA' &&
            this.peek().type !== 'RPAREN' &&
            !this.isAtLineEnd()
          ) {
            this.advance();
          }
        }
        if (this.peek().type === 'COMMA') this.advance();
        else break;
      }
      if (this.peek().type !== 'RPAREN') {
        throw new ParseException(
          `Satır ${startLine}: Sub parametre parantezi kapatılmamış.`,
          startLine
        );
      }
      this.advance();
    }

    this.expectNewlineOrEof();

    const body: VbaStmt[] = [];
    while (
      this.peek().type !== 'EOF' &&
      !(this.isKeyword('END') && this.isKeyword('SUB', 1))
    ) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    if (this.peek().type === 'EOF') {
      throw new ParseException(
        `Satır ${startLine}: '${nameTok.value}' için 'End Sub' eksik.`,
        startLine
      );
    }

    this.expectKeyword('END');
    const endSubTok = this.expectKeyword('SUB');
    this.expectNewlineOrEof();

    return {
      name: nameTok.value,
      isPrivate,
      params,
      body,
      startLine,
      endLine: endSubTok.line
    };
  }

  private parseStatement(): VbaStmt {
    this.skipNewlines();
    const t = this.peek();

    if (t.type === 'IDENT' && isUnsupportedKeyword(t.value)) {
      throw new ParseException(
        `Satır ${t.line}: ${UNSUPPORTED_MSG}`,
        t.line,
        true
      );
    }

    if (this.isKeyword('DIM')) return this.parseDimStmt();
    if (this.isKeyword('CONST')) return this.parseConstStmt();
    if (this.isKeyword('IF')) return this.parseIfStmt();
    if (this.isKeyword('FOR')) return this.parseForStmt();
    if (this.isKeyword('DO')) return this.parseDoWhileStmt();
    if (this.isKeyword('EXIT')) {
      const line = t.line;
      this.advance();
      if (!this.isKeyword('SUB')) {
        throw new ParseException(
          `Satır ${line}: ${UNSUPPORTED_MSG}`,
          line,
          true
        );
      }
      this.advance();
      this.expectNewlineOrEof();
      return { kind: 'ExitSubStmt', line };
    }
    if (this.isKeyword('MSGBOX')) return this.parseMsgBoxStmt();
    if (this.isKeyword('SET')) return this.parseSetStmt();
    if (this.isKeyword('CALL')) {
      this.advance();
      const expr = this.parsePostfix();
      this.expectNewlineOrEof();
      return { kind: 'CallStmt', expr, args: [], line: t.line };
    }

    // Assignment or Call statement
    const target = this.parsePostfix();
    if (this.peek().type === 'OP' && this.peek().value === '=') {
      this.advance();
      const value = this.parseExpr();
      this.expectNewlineOrEof();
      return { kind: 'AssignStmt', target, value, isSet: false, line: t.line };
    }

    // Method call without parentheses: e.g. lstSepet.AddItem "Kalem"
    const args: VbaExpr[] = [];
    if (!this.isAtLineEnd()) {
      args.push(this.parseExpr());
      while (this.peek().type === 'COMMA') {
        this.advance();
        args.push(this.parseExpr());
      }
    }
    this.expectNewlineOrEof();
    return { kind: 'CallStmt', expr: target, args, line: t.line };
  }

  private parseDimStmt(): VbaStmt {
    const line = this.advance().line; // DIM
    const declarations: { name: string; varType: VbaVarType }[] = [];

    while (true) {
      const nameTok = this.peek();
      if (nameTok.type !== 'IDENT') {
        throw new ParseException(
          `Satır ${nameTok.line}: Dim sonrasında değişken adı bekleniyordu.`,
          nameTok.line
        );
      }
      this.advance();

      let varType: VbaVarType = 'Variant';
      if (this.isKeyword('AS')) {
        this.advance();
        const typeTok = this.peek();
        if (typeTok.type !== 'IDENT' && typeTok.type !== 'KEYWORD') {
          throw new ParseException(
            `Satır ${typeTok.line}: 'As' sonrasında veri türü (String, Long, Double, Boolean) bekleniyordu.`,
            typeTok.line
          );
        }
        this.advance();
        varType = parseVarType(typeTok.value);
      }

      declarations.push({ name: nameTok.value, varType });

      if (this.peek().type === 'COMMA') {
        this.advance();
        continue;
      }
      break;
    }

    this.expectNewlineOrEof();
    return { kind: 'DimStmt', declarations, line };
  }

  private parseConstStmt(): VbaStmt {
    const line = this.advance().line; // CONST
    const nameTok = this.peek();
    if (nameTok.type !== 'IDENT') {
      throw new ParseException(
        `Satır ${nameTok.line}: Const sonrasında sabit adı bekleniyordu.`,
        nameTok.line
      );
    }
    this.advance();

    let varType: VbaVarType = 'Variant';
    if (this.isKeyword('AS')) {
      this.advance();
      const typeTok = this.advance();
      varType = parseVarType(typeTok.value);
    }

    if (this.peek().type !== 'OP' || this.peek().value !== '=') {
      throw new ParseException(
        `Satır ${line}: Const tanımında '=' bekleniyordu.`,
        line
      );
    }
    this.advance();
    const value = this.parseExpr();
    this.expectNewlineOrEof();
    return { kind: 'ConstStmt', name: nameTok.value, varType, value, line };
  }

  private parseSetStmt(): VbaStmt {
    const line = this.advance().line; // SET
    const target = this.parsePostfix();
    if (this.peek().type !== 'OP' || this.peek().value !== '=') {
      throw new ParseException(
        `Satır ${line}: Set atamasında '=' bekleniyordu.`,
        line
      );
    }
    this.advance();
    const value = this.parseExpr();
    this.expectNewlineOrEof();
    return { kind: 'AssignStmt', target, value, isSet: true, line };
  }

  private parseMsgBoxStmt(): VbaStmt {
    const line = this.advance().line; // MSGBOX
    const args: VbaExpr[] = [];
    if (!this.isAtLineEnd()) {
      args.push(this.parseExpr());
      while (this.peek().type === 'COMMA') {
        this.advance();
        if (!this.isAtLineEnd() && this.peek().type !== 'COMMA') {
          args.push(this.parseExpr());
        }
      }
    }
    this.expectNewlineOrEof();
    return { kind: 'MsgBoxStmt', args, line };
  }

  private parseIfStmt(): VbaStmt {
    const startLine = this.advance().line; // IF
    const branches: { cond: VbaExpr; body: VbaStmt[]; line: number }[] = [];
    let elseBody: VbaStmt[] = [];

    const firstCond = this.parseExpr();
    this.expectKeyword('THEN');

    // Single-line If: If x > 0 Then MsgBox "Ok"
    if (!this.isAtLineEnd()) {
      const singleStmt = this.parseStatement();
      branches.push({ cond: firstCond, body: [singleStmt], line: startLine });
      return { kind: 'IfStmt', branches, elseBody, line: startLine };
    }

    this.expectNewlineOrEof();

    const parseBlockUntil = (): VbaStmt[] => {
      const stmts: VbaStmt[] = [];
      while (
        this.peek().type !== 'EOF' &&
        !this.isKeyword('ELSEIF') &&
        !this.isKeyword('ELSE') &&
        !(this.isKeyword('END') && this.isKeyword('IF', 1))
      ) {
        stmts.push(this.parseStatement());
        this.skipNewlines();
      }
      return stmts;
    };

    branches.push({ cond: firstCond, body: parseBlockUntil(), line: startLine });

    while (this.isKeyword('ELSEIF')) {
      const branchLine = this.advance().line;
      const cond = this.parseExpr();
      this.expectKeyword('THEN');
      this.expectNewlineOrEof();
      branches.push({ cond, body: parseBlockUntil(), line: branchLine });
    }

    if (this.isKeyword('ELSE')) {
      this.advance();
      this.expectNewlineOrEof();
      elseBody = parseBlockUntil();
    }

    if (this.peek().type === 'EOF') {
      throw new ParseException(
        `Satır ${startLine}: 'If' bloğu için 'End If' eksik.`,
        startLine
      );
    }

    this.expectKeyword('END');
    this.expectKeyword('IF');
    this.expectNewlineOrEof();

    return { kind: 'IfStmt', branches, elseBody, line: startLine };
  }

  private parseForStmt(): VbaStmt {
    const line = this.advance().line; // FOR
    const varTok = this.peek();
    if (varTok.type !== 'IDENT') {
      throw new ParseException(
        `Satır ${line}: For döngüsünde sayaç değişkeni bekleniyordu.`,
        line
      );
    }
    this.advance();

    if (this.peek().type !== 'OP' || this.peek().value !== '=') {
      throw new ParseException(
        `Satır ${line}: For döngüsünde '=' bekleniyordu.`,
        line
      );
    }
    this.advance();

    const start = this.parseExpr();
    this.expectKeyword('TO');
    const end = this.parseExpr();

    let step: VbaExpr | undefined;
    if (this.isKeyword('STEP')) {
      this.advance();
      step = this.parseExpr();
    }
    this.expectNewlineOrEof();

    const body: VbaStmt[] = [];
    while (this.peek().type !== 'EOF' && !this.isKeyword('NEXT')) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    if (this.peek().type === 'EOF') {
      throw new ParseException(
        `Satır ${line}: For döngüsü için 'Next' eksik.`,
        line
      );
    }

    this.expectKeyword('NEXT');
    // Optional loop variable after Next
    if (this.peek().type === 'IDENT') {
      this.advance();
    }
    this.expectNewlineOrEof();

    return { kind: 'ForStmt', varName: varTok.value, start, end, step, body, line };
  }

  private parseDoWhileStmt(): VbaStmt {
    const line = this.advance().line; // DO
    if (!this.isKeyword('WHILE')) {
      throw new ParseException(
        `Satır ${line}: ${UNSUPPORTED_MSG}`,
        line,
        true
      );
    }
    this.advance();
    const cond = this.parseExpr();
    this.expectNewlineOrEof();

    const body: VbaStmt[] = [];
    while (this.peek().type !== 'EOF' && !this.isKeyword('LOOP')) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    if (this.peek().type === 'EOF') {
      throw new ParseException(
        `Satır ${line}: 'Do While' döngüsü için 'Loop' eksik.`,
        line
      );
    }

    this.expectKeyword('LOOP');
    this.expectNewlineOrEof();

    return { kind: 'DoWhileStmt', cond, body, line };
  }

  // Expression precedence: Or -> And -> Not -> Comparison -> Concat(&) -> Add/Sub -> Mul/Div/Mod -> Unary -> Postfix -> Primary
  private parseExpr(): VbaExpr {
    return this.parseOr();
  }

  private parseOr(): VbaExpr {
    let left = this.parseAnd();
    while (this.isKeyword('OR')) {
      const op = this.advance();
      const right = this.parseAnd();
      left = { kind: 'BinaryOp', op: 'OR', left, right, line: op.line };
    }
    return left;
  }

  private parseAnd(): VbaExpr {
    let left = this.parseNot();
    while (this.isKeyword('AND')) {
      const op = this.advance();
      const right = this.parseNot();
      left = { kind: 'BinaryOp', op: 'AND', left, right, line: op.line };
    }
    return left;
  }

  private parseNot(): VbaExpr {
    if (this.isKeyword('NOT')) {
      const op = this.advance();
      const expr = this.parseNot();
      return { kind: 'UnaryOp', op: 'NOT', expr, line: op.line };
    }
    return this.parseComparison();
  }

  private parseComparison(): VbaExpr {
    let left = this.parseConcat();
    while (
      this.peek().type === 'OP' &&
      ['=', '<>', '<', '>', '<=', '>='].includes(this.peek().value)
    ) {
      const op = this.advance();
      const right = this.parseConcat();
      left = { kind: 'BinaryOp', op: op.value, left, right, line: op.line };
    }
    return left;
  }

  private parseConcat(): VbaExpr {
    let left = this.parseAddSub();
    while (this.peek().type === 'OP' && this.peek().value === '&') {
      const op = this.advance();
      const right = this.parseAddSub();
      left = { kind: 'BinaryOp', op: '&', left, right, line: op.line };
    }
    return left;
  }

  private parseAddSub(): VbaExpr {
    let left = this.parseMulDiv();
    while (
      this.peek().type === 'OP' &&
      (this.peek().value === '+' || this.peek().value === '-')
    ) {
      const op = this.advance();
      const right = this.parseMulDiv();
      left = { kind: 'BinaryOp', op: op.value, left, right, line: op.line };
    }
    return left;
  }

  private parseMulDiv(): VbaExpr {
    let left = this.parseUnary();
    while (
      (this.peek().type === 'OP' &&
        (this.peek().value === '*' || this.peek().value === '/')) ||
      this.isKeyword('MOD')
    ) {
      const op = this.advance();
      const right = this.parseUnary();
      left = { kind: 'BinaryOp', op: op.value.toUpperCase(), left, right, line: op.line };
    }
    return left;
  }

  private parseUnary(): VbaExpr {
    if (
      this.peek().type === 'OP' &&
      (this.peek().value === '-' || this.peek().value === '+')
    ) {
      const op = this.advance();
      const expr = this.parseUnary();
      return { kind: 'UnaryOp', op: op.value, expr, line: op.line };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): VbaExpr {
    let expr = this.parsePrimary();
    while (true) {
      if (this.peek().type === 'DOT') {
        const dot = this.advance();
        const propTok = this.peek();
        if (propTok.type !== 'IDENT' && propTok.type !== 'KEYWORD') {
          throw new ParseException(
            `Satır ${dot.line}: '.' sonrasında özellik veya metot adı bekleniyordu.`,
            dot.line
          );
        }
        this.advance();
        expr = {
          kind: 'MemberAccess',
          object: expr,
          property: propTok.value,
          line: dot.line
        };
      } else if (this.peek().type === 'LPAREN') {
        const lp = this.advance();
        const args: VbaExpr[] = [];
        if (this.peek().type !== 'RPAREN') {
          args.push(this.parseExpr());
          while (this.peek().type === 'COMMA') {
            this.advance();
            args.push(this.parseExpr());
          }
        }
        if (this.peek().type !== 'RPAREN') {
          throw new ParseException(
            `Satır ${lp.line}: Kapatılmamış parantez ')'.`,
            lp.line
          );
        }
        this.advance();
        expr = { kind: 'CallExpr', callee: expr, args, line: lp.line };
      } else {
        break;
      }
    }
    return expr;
  }

  private parsePrimary(): VbaExpr {
    const t = this.peek();

    if (t.type === 'NUMBER') {
      this.advance();
      return { kind: 'NumberLiteral', value: Number(t.value), line: t.line };
    }
    if (t.type === 'STRING') {
      this.advance();
      return { kind: 'StringLiteral', value: t.value, line: t.line };
    }
    if (this.isKeyword('TRUE')) {
      this.advance();
      return { kind: 'BooleanLiteral', value: true, line: t.line };
    }
    if (this.isKeyword('FALSE')) {
      this.advance();
      return { kind: 'BooleanLiteral', value: false, line: t.line };
    }
    if (t.type === 'IDENT') {
      this.advance();
      return { kind: 'Identifier', name: t.value, line: t.line };
    }
    if (t.type === 'LPAREN') {
      this.advance();
      const inner = this.parseExpr();
      if (this.peek().type !== 'RPAREN') {
        throw new ParseException(
          `Satır ${t.line}: Parantez ')' ile kapatılmamış.`,
          t.line
        );
      }
      this.advance();
      return inner;
    }

    throw new ParseException(
      `Satır ${t.line}: Beklenmeyen ifade '${t.value || 'satır sonu'}'.`,
      t.line
    );
  }
}

export function parseVbaProgram(source: string): {
  program?: VbaProgram;
  error?: VbaSimError;
} {
  const { tokens, error } = tokenizeVba(source);
  if (error) return { error };

  try {
    const parser = new VbaParser(tokens);
    const program = parser.parseProgram();
    return { program };
  } catch (err) {
    if (err instanceof ParseException) {
      return {
        error: {
          line: err.line,
          message: err.message,
          isUnsupported: err.isUnsupported
        }
      };
    }
    return {
      error: {
        line: 1,
        message: 'Kod ayrıştırılırken beklenmeyen bir sözdizimi hatası oluştu.'
      }
    };
  }
}
