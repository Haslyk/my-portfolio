import { VbaFormControl, VirtualSheetData } from '../types';

export type VbaTokenType =
  | 'KEYWORD'
  | 'IDENT'
  | 'NUMBER'
  | 'STRING'
  | 'OP'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'
  | 'DOT'
  | 'NEWLINE'
  | 'EOF';

export interface VbaToken {
  type: VbaTokenType;
  value: string;
  line: number;
  col: number;
}

export type VbaVarType = 'String' | 'Long' | 'Double' | 'Boolean' | 'Variant' | 'Worksheet';

export type VbaExpr =
  | { kind: 'NumberLiteral'; value: number; line: number }
  | { kind: 'StringLiteral'; value: string; line: number }
  | { kind: 'BooleanLiteral'; value: boolean; line: number }
  | { kind: 'Identifier'; name: string; line: number }
  | { kind: 'MemberAccess'; object: VbaExpr; property: string; line: number }
  | { kind: 'CallExpr'; callee: VbaExpr; args: VbaExpr[]; line: number }
  | { kind: 'UnaryOp'; op: string; expr: VbaExpr; line: number }
  | { kind: 'BinaryOp'; op: string; left: VbaExpr; right: VbaExpr; line: number };

export type VbaStmt =
  | { kind: 'OptionExplicit'; line: number }
  | {
      kind: 'DimStmt';
      declarations: { name: string; varType: VbaVarType }[];
      line: number;
    }
  | {
      kind: 'ConstStmt';
      name: string;
      varType: VbaVarType;
      value: VbaExpr;
      line: number;
    }
  | { kind: 'AssignStmt'; target: VbaExpr; value: VbaExpr; isSet: boolean; line: number }
  | { kind: 'IfStmt'; branches: { cond: VbaExpr; body: VbaStmt[]; line: number }[]; elseBody: VbaStmt[]; line: number }
  | { kind: 'ForStmt'; varName: string; start: VbaExpr; end: VbaExpr; step?: VbaExpr; body: VbaStmt[]; line: number }
  | { kind: 'DoWhileStmt'; cond: VbaExpr; body: VbaStmt[]; line: number }
  | { kind: 'ExitSubStmt'; line: number }
  | { kind: 'MsgBoxStmt'; args: VbaExpr[]; line: number }
  | { kind: 'CallStmt'; expr: VbaExpr; args: VbaExpr[]; line: number };

export interface VbaSubDecl {
  name: string;
  isPrivate: boolean;
  params: string[];
  body: VbaStmt[];
  startLine: number;
  endLine: number;
}

export interface VbaProgram {
  optionExplicit: boolean;
  subs: VbaSubDecl[];
  topLevelStmts: VbaStmt[];
}

export interface VbaTraceStep {
  stepIndex: number;
  line: number;
  code: string;
  variables: Record<string, string | number | boolean>;
  loopCounters: Record<string, number>;
  note: string;
}

export interface VbaSimError {
  message: string;
  line: number;
  isUnsupported?: boolean;
  isLimitExceeded?: boolean;
}

export interface VbaRunOptions {
  code: string;
  controls: VbaFormControl[];
  sheet?: VirtualSheetData;
  eventSubName?: string; // e.g. 'btnHesapla_Click'
  listSelections?: Record<string, number>;
  maxSteps?: number;
  maxLoopIterations?: number;
  maxTimeMs?: number;
  maxOutputs?: number;
  captureTrace?: boolean;
}

export interface VbaRunResult {
  ok: boolean;
  error?: VbaSimError;
  msgBoxes: string[];
  controls: VbaFormControl[];
  sheet?: VirtualSheetData;
  readCells: string[];
  writtenCells: string[];
  trace: VbaTraceStep[];
  stepsExecuted: number;
  executedSub?: string;
}
