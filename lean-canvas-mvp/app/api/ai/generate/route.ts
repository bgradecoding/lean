import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Canvas 블록별 전문화된 프롬프트 정의
const BLOCK_PROMPTS: Record<string, (context: any) => string> = {
  problem: (context) => {
    const canvasName = context.canvasName || "비즈니스";
    const customerSegments = context.customerSegments || "";
    const linkedBacklogs = context.linkedBacklogs || [];

    let backlogSection = "";
    if (linkedBacklogs.length > 0) {
      backlogSection = "\n\n연결된 고객 문제 백로그:\n";
      linkedBacklogs.forEach((backlog: any, index: number) => {
        backlogSection += `\n${index + 1}. [${backlog.priority}] ${backlog.title}`;
        if (backlog.description) {
          backlogSection += `\n   설명: ${backlog.description}`;
        }
        if (backlog.tags) {
          backlogSection += `\n   태그: ${backlog.tags}`;
        }
      });
      backlogSection += "\n\n위 백로그들을 참고하여 가장 중요한 문제들을 요약하고 우선순위를 정해주세요.";
    }

    return `당신은 린 캔버스 작성을 돕는 비즈니스 전문가입니다.

비즈니스 이름: ${canvasName}
${customerSegments ? `고객 세그먼트: ${customerSegments}` : ""}${backlogSection}

"해결하려는 문제" 섹션을 작성해주세요. 다음 가이드라인을 따라주세요:
- 고객이 실제로 겪고 있는 상위 3가지 문제를 구체적으로 작성
- 각 문제는 명확하고 측정 가능해야 함
- 고객의 관점에서 문제를 서술
- 간결하게 작성 (각 문제당 1-2문장)
${linkedBacklogs.length > 0 ? "- 위에 제시된 백로그들의 공통 패턴과 우선순위를 고려" : ""}

형식: 번호를 매긴 목록으로 작성해주세요.`;
  },

  solution: (context) => {
    const canvasName = context.canvasName || "비즈니스";
    const problem = context.problem || "";

    return `당신은 린 캔버스 작성을 돕는 비즈니스 전문가입니다.

비즈니스 이름: ${canvasName}
${problem ? `해결하려는 문제:\n${problem}` : ""}

"솔루션" 섹션을 작성해주세요. 다음 가이드라인을 따라주세요:
- 위에서 제시된 문제들을 해결하는 핵심 기능/서비스를 3-5가지 제시
- 각 솔루션은 구체적이고 실행 가능해야 함
- 문제와 솔루션의 연결성이 명확해야 함
- 기술적 세부사항보다는 고객 가치에 집중

형식: 번호를 매긴 목록으로 작성해주세요.`;
  },

  uniqueValueProp: (context) => {
    const canvasName = context.canvasName || "비즈니스";
    const problem = context.problem || "";
    const solution = context.solution || "";
    const customerSegments = context.customerSegments || "";

    return `당신은 린 캔버스 작성을 돕는 비즈니스 전문가입니다.

비즈니스 이름: ${canvasName}
${customerSegments ? `고객 세그먼트: ${customerSegments}` : ""}
${problem ? `해결하려는 문제:\n${problem}` : ""}
${solution ? `솔루션:\n${solution}` : ""}

"고유 가치 제안(Unique Value Proposition)" 섹션을 작성해주세요. 다음 가이드라인을 따라주세요:
- 한 문장으로 명확하게 표현
- 왜 고객이 이 제품/서비스를 선택해야 하는지 설명
- 경쟁사와 차별화되는 핵심 가치 포함
- 구체적이고 측정 가능한 베네핏 제시
- 마케팅 문구가 아닌 진정한 가치에 집중

하나의 명확한 문장으로 작성해주세요.`;
  },

  unfairAdvantage: (context) => {
    const canvasName = context.canvasName || "비즈니스";
    const solution = context.solution || "";

    return `당신은 린 캔버스 작성을 돕는 비즈니스 전문가입니다.

비즈니스 이름: ${canvasName}
${solution ? `솔루션:\n${solution}` : ""}

"불공정한 경쟁 우위(Unfair Advantage)" 섹션을 작성해주세요. 다음 가이드라인을 따라주세요:
- 경쟁자가 쉽게 복제하거나 구매할 수 없는 것
- 내부 정보, 전문가 팀, 독점 기술, 네트워크 효과 등
- 진정한 경쟁 우위만 작성 (단순한 아이디어는 불공정한 우위가 아님)
- 구체적이고 현실적으로 작성
- 없다면 "아직 없음" 또는 "개발 중"이라고 정직하게 작성

간결하게 2-3개 항목으로 작성해주세요.`;
  },

  customerSegments: (context) => {
    const canvasName = context.canvasName || "비즈니스";
    const problem = context.problem || "";

    return `당신은 린 캔버스 작성을 돕는 비즈니스 전문가입니다.

비즈니스 이름: ${canvasName}
${problem ? `해결하려는 문제:\n${problem}` : ""}

"고객 세그먼트(Customer Segments)" 섹션을 작성해주세요. 다음 가이드라인을 따라주세요:
- 타겟 고객을 명확하고 구체적으로 정의
- 인구통계학적 특성 (연령, 직업, 소득 등)
- 행동 패턴 및 특성
- 얼리어답터 그룹을 우선적으로 고려
- "모든 사람"은 고객이 아님 - 구체적으로 좁혀서 정의

2-3개의 핵심 고객 세그먼트로 작성해주세요.`;
  },

  keyMetrics: (context) => {
    const canvasName = context.canvasName || "비즈니스";
    const solution = context.solution || "";

    return `당신은 린 캔버스 작성을 돕는 비즈니스 전문가입니다.

비즈니스 이름: ${canvasName}
${solution ? `솔루션:\n${solution}` : ""}

"핵심 지표(Key Metrics)" 섹션을 작성해주세요. 다음 가이드라인을 따라주세요:
- 비즈니스 성공을 측정할 수 있는 핵심 지표
- 측정 가능하고 추적 가능한 지표
- Vanity metrics가 아닌 실질적인 지표
- AARRR 프레임워크 고려 (Acquisition, Activation, Retention, Revenue, Referral)
- 3-5개의 핵심 지표만 선택

형식: 번호를 매긴 목록으로 작성해주세요.`;
  },

  channels: (context) => {
    const canvasName = context.canvasName || "비즈니스";
    const customerSegments = context.customerSegments || "";

    return `당신은 린 캔버스 작성을 돕는 비즈니스 전문가입니다.

비즈니스 이름: ${canvasName}
${customerSegments ? `고객 세그먼트: ${customerSegments}` : ""}

"채널(Channels)" 섹션을 작성해주세요. 다음 가이드라인을 따라주세요:
- 고객에게 도달할 수 있는 경로 명시
- 무료 채널과 유료 채널 모두 고려
- 고객 세그먼트가 실제로 사용하는 채널
- 인바운드/아웃바운드 전략
- 초기에는 확장 가능하지 않은 채널도 고려

형식: 번호를 매긴 목록으로 작성해주세요.`;
  },

  costStructure: (context) => {
    const canvasName = context.canvasName || "비즈니스";
    const solution = context.solution || "";
    const channels = context.channels || "";

    return `당신은 린 캔버스 작성을 돕는 비즈니스 전문가입니다.

비즈니스 이름: ${canvasName}
${solution ? `솔루션:\n${solution}` : ""}
${channels ? `채널:\n${channels}` : ""}

"비용 구조(Cost Structure)" 섹션을 작성해주세요. 다음 가이드라인을 따라주세요:
- 비즈니스 운영에 필요한 주요 비용 항목
- 고정 비용과 변동 비용 구분
- 가장 큰 비용 항목에 집중
- 인건비, 인프라, 마케팅 등 핵심 비용
- 현실적이고 구체적으로 작성

형식: 번호를 매긴 목록으로 작성해주세요.`;
  },

  revenueStreams: (context) => {
    const canvasName = context.canvasName || "비즈니스";
    const customerSegments = context.customerSegments || "";
    const uniqueValueProp = context.uniqueValueProp || "";

    return `당신은 린 캔버스 작성을 돕는 비즈니스 전문가입니다.

비즈니스 이름: ${canvasName}
${customerSegments ? `고객 세그먼트: ${customerSegments}` : ""}
${uniqueValueProp ? `고유 가치 제안: ${uniqueValueProp}` : ""}

"수익원(Revenue Streams)" 섹션을 작성해주세요. 다음 가이드라인을 따라주세요:
- 어떻게 수익을 창출할 것인지 명확히 작성
- 가격 모델 (구독, 일회성, 프리미엄, 광고 등)
- 주요 수익원과 부차적 수익원 구분
- 고객이 기꺼이 비용을 지불할 가치
- 현실적이고 검증 가능한 수익 모델

형식: 번호를 매긴 목록으로 작성해주세요.`;
  },
};

export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // API 키 확인
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your-claude-api-key-here") {
      return NextResponse.json(
        { error: "Claude API key not configured" },
        { status: 500 }
      );
    }

    // 요청 데이터 파싱
    const { blockId, canvasData, linkedBacklogs } = await req.json();

    if (!blockId) {
      return NextResponse.json(
        { error: "Block ID is required" },
        { status: 400 }
      );
    }

    // 해당 블록의 프롬프트 가져오기
    const promptGenerator = BLOCK_PROMPTS[blockId];
    if (!promptGenerator) {
      return NextResponse.json({ error: "Invalid block ID" }, { status: 400 });
    }

    // 컨텍스트 준비
    const context = {
      canvasName: canvasData?.name || "",
      problem: canvasData?.problem || "",
      solution: canvasData?.solution || "",
      uniqueValueProp: canvasData?.uniqueValueProp || "",
      unfairAdvantage: canvasData?.unfairAdvantage || "",
      customerSegments: canvasData?.customerSegments || "",
      keyMetrics: canvasData?.keyMetrics || "",
      channels: canvasData?.channels || "",
      costStructure: canvasData?.costStructure || "",
      revenueStreams: canvasData?.revenueStreams || "",
      linkedBacklogs: linkedBacklogs || [],
    };

    // Claude API 호출
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: promptGenerator(context),
        },
      ],
    });

    // 응답 추출
    const content = message.content[0];
    const generatedText = content.type === "text" ? content.text : "";

    return NextResponse.json({
      generatedText,
      success: true,
    });
  } catch (error: any) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate content",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
