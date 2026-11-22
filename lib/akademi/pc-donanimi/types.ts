export type WeekStatus = 'LOCKED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type ActivityType = 'application' | 'quiz' | 'homework';
export type AttemptMode = 'normal' | 'practice';
export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED';

export type WidgetType =
  | 'categorize_cards'
  | 'case_explorer_2d_3d'
  | 'quiz_3q'
  | 'scenario_matcher'
  | 'ram_simulator'
  | 'airflow_simulator'
  | 'monitor_troubleshoot'
  | 'cable_connector'
  | 'network_switch_ip'
  | 'system_card_homework';

export interface LearningAnimationSpec {
  id: string;
  weekOrder: number;
  title: string;
  subtitle: string;
  durationSeconds: number;
  steps: {
    id: string;
    title: string;
    description: string;
    highlightTarget: string;
  }[];
}

export interface PublicQuizQuestion {
  id: string;
  code: string;
  prompt: string;
  options: {
    key: 'A' | 'B' | 'C';
    label: string;
  }[];
}

export interface PublicCardItem {
  id: string;
  label: string;
  description?: string;
  iconName: string;
}

export interface PublicCategoryBox {
  id: string;
  label: string;
  subtitle?: string;
}

export interface PublicHotspotPart {
  id: string;
  label: string;
  roleSentence: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PublicScenarioItem {
  id: string;
  prompt: string;
  contextNote?: string;
  options?: { id: string; label: string }[];
}

export interface PublicCableEndpoint {
  id: string;
  label: string;
  sublabel: string;
  connectorShape: 'usb-a' | 'hdmi' | 'rj45' | 'jack35';
}

export interface PublicPortEndpoint {
  id: string;
  label: string;
  sublabel: string;
  portShape: 'usb-a' | 'hdmi' | 'rj45' | 'jack35';
}

export interface PublicActivityDefinition {
  code: string;
  weekOrder: number;
  title: string;
  type: ActivityType;
  required: boolean;
  widgetType: WidgetType;
  panelPath: string;
  purpose: string;
  estimatedMinutes: number;
  allocatedMinutes: number;
  expectedSeconds: number;
  allocatedSeconds: number;
  submitButtonText: 'Kontrol Et' | 'Ödevi Gönder';
  instructions: string[];
  hint: string;
  earlyFinisherPrompt?: string;
  pedagogicalNote?: string;
  contentVersion: string;
  payload: {
    cards?: PublicCardItem[];
    categories?: PublicCategoryBox[];
    hotspotParts?: PublicHotspotPart[];
    allowOptional3D?: boolean;
    questions?: PublicQuizQuestion[];
    scenarios?: PublicScenarioItem[];
    sharedOptions?: { id: string; label: string }[];
    cables?: PublicCableEndpoint[];
    ports?: PublicPortEndpoint[];
    networkConfig?: {
      mask: string;
      devices: { id: string; label: string; portId: string; portLabel: string; ipOptions?: string[] }[];
      switchPorts: { id: string; label: string }[];
    };
    systemParts?: { id: string; label: string; iconName: string }[];
    roleOptions?: { id: string; label: string }[];
  };
}

export interface PublicWeekDefinition {
  order: number;
  title: string;
  shortTitle: string;
  learningObjectives: [string, string];
  animation?: LearningAnimationSpec;
  activities: PublicActivityDefinition[];
}

export interface ValidationFeedbackItem {
  itemId: string;
  correct: boolean;
  message: string;
}

export interface ActivityCheckResult {
  passed: boolean;
  status: AttemptStatus;
  summaryMessage: string;
  items: ValidationFeedbackItem[];
  preservedState: Record<string, unknown>;
  completedAt: string | null;
  elapsedSeconds: number | null;
  activeSeconds: number;
  checkCount: number;
  weekCompleted: boolean;
  nextWeekUnlocked: boolean;
  earlyFinisher: boolean;
}
