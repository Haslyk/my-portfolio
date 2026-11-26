export type GpDifficulty =
  | 'Basit'
  | 'Basit–orta'
  | 'Orta'
  | 'Orta–zor'
  | 'Zor';

export type GpEnvironment = 'web' | 'web+excel';

export type GpWidgetType =
  | 'matching'
  | 'form_builder'
  | 'output_prediction'
  | 'code_editor'
  | 'fill_blanks'
  | 'bug_hunt'
  | 'code_ordering'
  | 'trace_viewer';

export type VbaControlType =
  | 'Label'
  | 'TextBox'
  | 'CommandButton'
  | 'CheckBox'
  | 'OptionButton'
  | 'ListBox'
  | 'Shape';

export interface VbaFormControl {
  id: string;
  type: VbaControlType;
  name: string;
  caption?: string;
  value?: string | boolean;
  backColor?: string;
  foreColor?: string;
  fontSize?: number;
  width?: number;
  height?: number;
  items?: string[];
  listIndex?: number;
  groupName?: string;
}

export interface VbaFormDefinition {
  title: string;
  backColor?: string;
  controls: VbaFormControl[];
}

export interface VirtualSheetData {
  name: string;
  columns: string[]; // e.g. ['A', 'B', 'C', 'D']
  rows: number;
  cells: Record<string, string | number | boolean>; // key: "row,col" (1-based) e.g. "1,1"
}

export interface GpInstructionGuide {
  whatToDo: string;       // Ne yapacağım?
  whereToStart: string;   // Nereden başlayacağım?
  whichData: string;      // Hangi verileri kullanacağım?
  expectedResult: string; // Nasıl bir sonuç görmeliyim?
  howToKnowDone: string;  // Tamamlandığını nasıl anlayacağım?
  steps: string[];
}

export interface GpTestCase {
  id: string;
  label: string;
  eventTarget?: string; // e.g. 'btnHesapla_Click' or 'txtAd_Enter'
  inputs?: Record<string, string | boolean | number>; // controlName -> value
  listSelections?: Record<string, number>; // listBoxName -> listIndex
  expectedMsgBoxContains?: string[];
  expectedControlProps?: Record<string, Record<string, string | number | boolean>>;
  expectedSheetCells?: Record<string, string | number>; // "row,col" -> value
  expectedListItems?: Record<string, string[]>;
  expectStopOnError?: boolean;
  description: string;
}

export interface GpMatchingPayload {
  leftItems: { id: string; label: string; subtitle?: string }[];
  rightTargets: { id: string; text: string }[];
  correctPairs: Record<string, string>;
  explanations: Record<string, string>;
}

export interface GpFillBlanksPayload {
  templateLines: string[];
  blanks: {
    id: string;
    label: string;
    options?: string[];
    correctAnswers: string[];
    explanationCorrect: string;
    explanationWrong: string;
  }[];
}

export interface GpCodeOrderingPayload {
  prompt: string;
  blocks: { id: string; code: string; note?: string }[];
  validOrders: string[][];
}

export interface GpOutputPredictionPayload {
  codeToRead: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  allowFreeText?: boolean;
  explanation: string;
  simInputs?: Record<string, string | boolean>;
  simEvent?: string;
}

export interface GpFormBuilderPayload {
  allowedControls: VbaControlType[];
  requiredControls: {
    type: VbaControlType;
    minCount: number;
    namePattern?: string;
    requiredCaptionContains?: string;
    label: string;
  }[];
  allowRunPreview: boolean;
}

export interface GpActivityDefinition {
  id: string; // e.g. 'H1-E1'
  code: string; // same as id for DB unique code: 'H1-E1'
  week: number; // 1..5
  orderInWeek: number; // 1..5
  title: string;
  difficulty: GpDifficulty;
  durationMinutes: number;
  expectedSeconds: number;
  allocatedSeconds: number;
  objectives: string[];
  environment: GpEnvironment;
  prerequisites: string[];
  instructions: GpInstructionGuide;
  sampleInputs: string[];
  expectedBehavior: string;
  completionCriteria: string[];
  hints: [string, string, string]; // 3 levels: 1. Kavram, 2. Bileşen/Satır, 3. Küçük Örnek
  widgetType: GpWidgetType;
  starterCode: string;
  starterForm: VbaFormDefinition;
  starterSheet?: VirtualSheetData;
  quickCommands?: string[];
  supportedEvents?: string[];
  tests: GpTestCase[];
  requireLoopInAst?: boolean;
  requireConditionInAst?: boolean;
  excelChecklist: string[];
  teacherNotes: string;
  teacherSolution: string;
  extensionTask: string;
  contentVersion: number;
  matchingPayload?: GpMatchingPayload;
  fillBlanksPayload?: GpFillBlanksPayload;
  codeOrderingPayload?: GpCodeOrderingPayload;
  outputPredictionPayload?: GpOutputPredictionPayload;
  formBuilderPayload?: GpFormBuilderPayload;
}

export interface GpWeekDefinition {
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  objectives: string[];
  activities: GpActivityDefinition[];
}
