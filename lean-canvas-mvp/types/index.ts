export interface Canvas {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  problem?: string | null;
  solution?: string | null;
  uniqueValueProp?: string | null;
  unfairAdvantage?: string | null;
  customerSegments?: string | null;
  keyMetrics?: string | null;
  channels?: string | null;
  costStructure?: string | null;
  revenueStreams?: string | null;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CanvasBlock {
  id: keyof Pick<
    Canvas,
    | "problem"
    | "solution"
    | "uniqueValueProp"
    | "unfairAdvantage"
    | "customerSegments"
    | "keyMetrics"
    | "channels"
    | "costStructure"
    | "revenueStreams"
  >;
  title: string;
  placeholder: string;
  color: string;
  description: string;
}

export const CANVAS_BLOCKS: CanvasBlock[] = [
  {
    id: "problem",
    title: "해결하려는 문제",
    placeholder: "고객이 겪는 주요 문제 3가지를 나열하세요",
    color: "red",
    description: "타겟 고객이 실제로 겪고 있는 가장 중요한 문제들을 정의합니다. 해결할 가치가 있는 문제인지 검증하세요.",
  },
  {
    id: "solution",
    title: "솔루션",
    placeholder: "문제를 해결할 주요 기능 3가지를 작성하세요",
    color: "blue",
    description: "각 문제에 대응하는 솔루션과 핵심 기능을 설명합니다. 최소 기능 제품(MVP)으로 시작하세요.",
  },
  {
    id: "uniqueValueProp",
    title: "고유 가치 제안",
    placeholder: "명확하고 설득력 있는 한 문장의 메시지",
    color: "purple",
    description: "고객이 당신을 선택해야 하는 이유를 한 문장으로 표현합니다. 차별화된 가치를 명확히 전달하세요.",
  },
  {
    id: "unfairAdvantage",
    title: "불공정한 경쟁 우위",
    placeholder: "쉽게 복제하거나 구매할 수 없는 것",
    color: "orange",
    description: "경쟁사가 쉽게 모방할 수 없는 독특한 강점입니다. 팀, 기술, 네트워크 등이 포함될 수 있습니다.",
  },
  {
    id: "customerSegments",
    title: "고객 세그먼트",
    placeholder: "타겟 고객과 사용자",
    color: "green",
    description: "제품을 사용할 타겟 고객층을 정의합니다. 얼리어답터부터 시작하여 점진적으로 확장하세요.",
  },
  {
    id: "keyMetrics",
    title: "핵심 지표",
    placeholder: "측정할 주요 활동 지표",
    color: "yellow",
    description: "비즈니스 성과를 측정할 핵심 지표들입니다. 의미 있는 지표에 집중하세요.",
  },
  {
    id: "channels",
    title: "채널",
    placeholder: "고객에게 도달하는 경로",
    color: "teal",
    description: "고객에게 제품을 전달하고 소통하는 방법입니다. 효과적이고 확장 가능한 채널을 찾으세요.",
  },
  {
    id: "costStructure",
    title: "비용 구조",
    placeholder: "고객 획득 비용, 유통 비용, 호스팅, 인건비 등",
    color: "gray",
    description: "비즈니스를 운영하는 데 필요한 주요 비용들입니다. 고정 비용과 변동 비용을 파악하세요.",
  },
  {
    id: "revenueStreams",
    title: "수익원",
    placeholder: "수익 모델, 생애 가치, 수익, 마진",
    color: "emerald",
    description: "고객으로부터 수익을 창출하는 방법입니다. 지속 가능한 수익 모델을 설계하세요.",
  },
];

// Backlog Types
export enum BacklogSource {
  Meeting = "Meeting",
  Interview = "Interview",
  Survey = "Survey",
  Research = "Research",
  Other = "Other",
}

export enum BacklogPriority {
  High = "High",
  Medium = "Medium",
  Low = "Low",
}

export enum BacklogStatus {
  New = "New",
  Validated = "Validated",
  InCanvas = "InCanvas",
  Rejected = "Rejected",
}

export interface Backlog {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  source?: string | null;
  priority: string;
  status: string;
  tags?: string | null;
  isPublic?: boolean;
  shareToken?: string | null;
  discoveredAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
}

export interface CanvasBacklogLink {
  id: string;
  canvasId: string;
  backlogId: string;
  notes?: string | null;
  createdAt: Date | string;
}

export interface BacklogWithLinks extends Backlog {
  canvasLinks?: CanvasBacklogLink[];
}
