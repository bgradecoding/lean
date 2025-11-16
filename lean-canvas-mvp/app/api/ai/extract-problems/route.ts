import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 백로그 추출을 위한 프롬프트
const EXTRACT_PROBLEMS_PROMPT = (interviewNotes: string) => {
  return `당신은 고객 개발(Customer Development) 전문가입니다. 고객 인터뷰 노트를 분석하여 고객이 겪는 문제들을 추출하는 역할을 수행합니다.

다음은 고객 인터뷰/미팅 노트입니다:

${interviewNotes}

위 노트에서 고객이 겪고 있는 문제들을 추출하여 구조화된 백로그 형태로 작성해주세요.

각 문제에 대해 다음 정보를 JSON 배열 형식으로 제공해주세요:
- title: 문제를 한 문장으로 요약 (명확하고 구체적으로)
- description: 문제에 대한 상세 설명 (2-3문장, 고객의 관점에서 작성)
- priority: 문제의 우선순위 ("High", "Medium", "Low" 중 하나)
- source: 문제의 출처 ("Interview", "Meeting", "Survey", "Research", "Other" 중 하나)
- suggestedTags: 관련 태그 (최대 3개, 쉼표로 구분된 문자열)

우선순위 판단 기준:
- High: 고객이 반복적으로 언급하거나 강한 감정을 표현한 문제, 비즈니스에 직접적 영향
- Medium: 중요하지만 급하지 않은 문제, 개선 사항
- Low: 부차적인 문제, 선호도 관련 문제

응답은 반드시 다음 형식의 순수 JSON 배열로만 작성해주세요 (다른 설명 없이):
[
  {
    "title": "문제 제목",
    "description": "문제 설명",
    "priority": "High",
    "source": "Interview",
    "suggestedTags": "태그1,태그2,태그3"
  }
]

최소 1개, 최대 10개의 문제를 추출해주세요.`;
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
    const { interviewNotes } = await req.json();

    if (!interviewNotes || typeof interviewNotes !== "string") {
      return NextResponse.json(
        { error: "Interview notes are required" },
        { status: 400 }
      );
    }

    if (interviewNotes.trim().length < 50) {
      return NextResponse.json(
        { error: "Interview notes are too short. Please provide more detailed notes." },
        { status: 400 }
      );
    }

    // Claude API 호출
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: EXTRACT_PROBLEMS_PROMPT(interviewNotes),
        },
      ],
    });

    // 응답 추출
    const content = message.content[0];
    const responseText = content.type === "text" ? content.text : "";

    // JSON 파싱 시도
    let extractedProblems;
    try {
      // 응답에서 JSON 부분만 추출 (코드 블록이 있을 수 있음)
      let jsonText = responseText.trim();

      // 코드 블록 제거
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\s*/, "").replace(/```\s*$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\s*/, "").replace(/```\s*$/, "");
      }

      extractedProblems = JSON.parse(jsonText);

      // 배열인지 확인
      if (!Array.isArray(extractedProblems)) {
        throw new Error("Response is not an array");
      }

      // 각 항목 검증
      extractedProblems = extractedProblems.map((problem: any) => ({
        title: problem.title || "Untitled Problem",
        description: problem.description || "",
        priority: ["High", "Medium", "Low"].includes(problem.priority)
          ? problem.priority
          : "Medium",
        source: ["Interview", "Meeting", "Survey", "Research", "Other"].includes(
          problem.source
        )
          ? problem.source
          : "Interview",
        suggestedTags: problem.suggestedTags || "",
      }));

      // 최대 10개로 제한
      if (extractedProblems.length > 10) {
        extractedProblems = extractedProblems.slice(0, 10);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Response text:", responseText);
      return NextResponse.json(
        {
          error: "Failed to parse extracted problems",
          details: "AI response was not in the expected format",
          rawResponse: responseText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      problems: extractedProblems,
      count: extractedProblems.length,
      success: true,
    });
  } catch (error: any) {
    console.error("AI extraction error:", error);
    return NextResponse.json(
      {
        error: "Failed to extract problems",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
