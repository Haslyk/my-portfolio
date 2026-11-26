export type WeekStatus = 'LOCKED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type ActivityStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type AttemptMode = 'NORMAL' | 'PRACTICE';

export type ActivityWidgetType =
  | 'CARD_MATCHING'
  | 'SCENARIO_CHOICE'
  | 'ORDERING'
  | 'NETWORK_BUILDER'
  | 'IP_ASSIGNMENT'
  | 'ARP_SIMULATION'
  | 'PATH_TRACKER'
  | 'MULTI_STEP_HOMEWORK'
  | 'WEEK_QUIZ';

export type AnimationCode = 'ANIM-W3' | 'ANIM-W4' | 'ANIM-W5';

export interface MatchingItemPublic {
  id: string;
  label: string;
  subtitle?: string;
  iconName: string;
}

export interface MatchingTargetPublic {
  id: string;
  text: string;
}

export interface ScenarioQuestionPublic {
  id: string;
  prompt: string;
  context?: string;
  options: {
    id: string;
    label: string;
  }[];
  followUpReasons?: {
    id: string;
    text: string;
  }[];
}

export interface OrderingCardPublic {
  id: string;
  title: string;
  description: string;
}

export interface NetworkNodePublic {
  id: string;
  label: string;
  deviceType: 'pc' | 'printer' | 'switch' | 'router' | 'ap' | 'phone' | 'pos' | 'cloud' | 'server';
  x: number; // 0-100 percentage or SVG coordinate (e.g. 0-700)
  y: number; // 0-420 SVG coordinate
  mobileX: number; // 0-360 vertical layout SVG coordinate
  mobileY: number; // 0-540 vertical layout SVG coordinate
  ipHint?: string;
}

export interface NetworkEdgeDraft {
  from: string;
  to: string;
  connectionType: 'wired' | 'wireless';
}

export interface IpDevicePublic {
  id: string;
  label: string;
  deviceType: 'pc' | 'printer' | 'laptop';
  initialIp?: string;
  locked?: boolean;
}

export interface QuizQuestionPublic {
  id: string;
  number: number;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
}

export interface ActivityPublicConfig {
  widgetType: ActivityWidgetType;
  instructions: string[];
  hint: string;
  earlyFinisherPrompt?: {
    question: string;
    explanation: string;
  };
  // Widget-specific public payloads (NEVER contains answer keys)
  matching?: {
    leftItems: MatchingItemPublic[];
    rightTargets: MatchingTargetPublic[];
  };
  scenarios?: {
    questions: ScenarioQuestionPublic[];
    note?: string;
  };
  ordering?: {
    initialCards: OrderingCardPublic[];
  };
  missingPacket?: {
    receivedPackets: number[];
    totalPackets: number;
    candidateMissingNumbers: number[];
    slotLabels: string[];
    protocolNote: string;
  };
  networkBuilder?: {
    nodes: NetworkNodePublic[];
    allowedConnectionTypes: ('wired' | 'wireless')[];
    defaultConnectionType: 'wired' | 'wireless';
    helperNote: string;
  };
  ipAssignment?: {
    gatewayIp: string;
    subnetMask: string;
    devices: IpDevicePublic[];
    ipPool: string[];
    followUpQuestion?: {
      prompt: string;
      options: { id: string; text: string }[];
    };
  };
  arpSimulation?: {
    subnetInfo: string;
    sender: {
      id: string;
      label: string;
      ip: string;
      mac: string;
    };
    targets: {
      id: string;
      label: string;
      deviceType: 'pc' | 'printer';
      ip: string;
    }[];
    macCards: {
      id: string;
      mac: string;
      hintLabel: string;
    }[];
    targetIpToFind: string;
  };
  pathTracker?: {
    nodes: NetworkNodePublic[];
    staticEdges: { from: string; to: string; connectionType: 'wired' | 'wireless' | 'wan' }[];
    missions: {
      id: string;
      title: string;
      description: string;
      startNodeId: string;
      targetNodeId: string;
    }[];
  };
  multiStepHomework?: {
    weekCode: 'W1-H' | 'W5-H';
    // W1-H specific
    homeDevices?: {
      id: string;
      label: string;
      iconName: string;
      description: string;
    }[];
    assumptionNote?: string;
    finalQuestion?: {
      prompt: string;
      options: { id: string; label: string }[];
    };
    // W5-H specific
    capstone?: {
      subnetMask: string;
      gatewayIp: string;
      nodes: NetworkNodePublic[];
      ipDevices: IpDevicePublic[];
      ipPool: string[];
      localMission: {
        title: string;
        description: string;
      };
      externalMission: {
        title: string;
        description: string;
      };
    };
  };
  quiz?: {
    questions: QuizQuestionPublic[];
  };
}

export interface ActivityCurriculumItem {
  code: string;
  weekOrder: number;
  orderInWeek: number;
  title: string;
  shortPurpose: string;
  difficulty?: 'Kolay' | 'Orta' | 'Zor';
  category: 'REQUIRED_ACTIVITY' | 'QUIZ' | 'HOMEWORK';
  required: boolean;
  expectedSeconds: number;
  allocatedSeconds: number;
  contentVersion: number;
  config: ActivityPublicConfig;
}

export interface AnimationStepPublic {
  id: number;
  title: string;
  caption: string;
  technicalNote: string;
  durationMs: number;
}

export interface WeekAnimationPublic {
  code: AnimationCode;
  title: string;
  subtitle: string;
  totalDurationSeconds: number;
  keyTakeaways: string[];
  steps: AnimationStepPublic[];
}

export interface WeekCurriculumItem {
  order: number;
  title: string;
  shortDescription: string;
  learningObjectives: [string, string];
  animation?: WeekAnimationPublic;
  activities: ActivityCurriculumItem[];
}

export interface ValidationFeedbackItem {
  fieldId: string;
  isCorrect: boolean;
  message: string;
}

export interface CheckResultResponse {
  passed: boolean;
  summaryMessage: string;
  feedbackItems: ValidationFeedbackItem[];
  attemptStatus: ActivityStatus;
  completedAt: string | null;
  activeSeconds: number;
  elapsedSeconds: number | null;
  checkCount: number;
  weekStatus: WeekStatus;
  nextWeekUnlocked: boolean;
}
