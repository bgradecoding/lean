import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 백로그 그룹화를 위한 프롬프트
const GROUP_BACKLOGS_PROMPT = (backlogs: any[]) => {
  const backlogList = backlogs
    .map(
      (b, index) =>
        `${index + 1}. [ID: ${b.id}] ${b.title}
   우선순위: ${b.priority}
   설명: ${b.description || "없음"}
   태그: ${b.tags || "없음"}`
    )
    .join("\n\n");

  return `당신은 고객 문제 분석 전문가입니다. 다음 백로그들을 분석하여 유사한 문제들을 그룹화해주세요.

백로그 목록:
${backlogList}

위 백로그들을 분석하여 다음 기준으로 그룹화해주세요:
1. 문제의 유사성 (같은 고객 페인 포인트를 다루는가?)
2. 해결 방법의 연관성
3. 고객 세그먼트의 유사성
4. 태그의 중복성

그룹화 결과를 다음 형식의 JSON 배열로 제공해주세요:
[
  {
    "groupName": "그룹 이름 (문제 영역을 잘 설명하는 이름)",
    "description": "그룹 설명 (왜 이 백로그들이 관련있는지)",
    "backlogIds": ["백로그 ID 배열"],
    "suggestedPriority": "High/Medium/Low (그룹의 전체 우선순위)",
    "suggestedTags": "공통 태그들 (쉼표로 구분)"
  }
]

주의사항:
- 최소 2개 이상의 백로그가 있을 때만 그룹을 만드세요
- 하나의 백로그는 여러 그룹에 속할 수 있습니다
- 유사성이 없다면 빈 배열을 반환하세요
- 그룹은 최소 2개, 최대 5개까지만 제안하세요
- 응답은 순수 JSON 배열만 작성하고 다른 설명은 포함하지 마세요`;
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
    const { backlogs } = await req.json();

    if (!backlogs || !Array.isArray(backlogs)) {
      return NextResponse.json(
        { error: "Backlogs array is required" },
        { status: 400 }
      );
    }

    if (backlogs.length < 2) {
      return NextResponse.json(
        { error: "At least 2 backlogs are required for grouping" },
        { status: 400 }
      );
    }

    if (backlogs.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 backlogs can be grouped at once" },
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
          content: GROUP_BACKLOGS_PROMPT(backlogs),
        },
      ],
    });

    // 응답 추출
    const content = message.content[0];
    const responseText = content.type === "text" ? content.text : "";

    // JSON 파싱 시도
    let groups;
    try {
      // 응답에서 JSON 부분만 추출
      let jsonText = responseText.trim();

      // 코드 블록 제거
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\s*/, "").replace(/```\s*$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\s*/, "").replace(/```\s*$/, "");
      }

      groups = JSON.parse(jsonText);

      // 배열인지 확인
      if (!Array.isArray(groups)) {
        throw new Error("Response is not an array");
      }

      // 각 그룹 검증
      groups = groups.map((group: any) => ({
        groupName: group.groupName || "Unnamed Group",
        description: group.description || "",
        backlogIds: Array.isArray(group.backlogIds) ? group.backlogIds : [],
        suggestedPriority: ["High", "Medium", "Low"].includes(
          group.suggestedPriority
        )
          ? group.suggestedPriority
          : "Medium",
        suggestedTags: group.suggestedTags || "",
      }));

      // 백로그가 2개 미만인 그룹 필터링
      groups = groups.filter((group: any) => group.backlogIds.length >= 2);

      // 최대 5개로 제한
      if (groups.length > 5) {
        groups = groups.slice(0, 5);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Response text:", responseText);
      return NextResponse.json(
        {
          error: "Failed to parse grouping suggestions",
          details: "AI response was not in the expected format",
          rawResponse: responseText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      groups,
      count: groups.length,
      success: true,
    });
  } catch (error: any) {
    console.error("AI grouping error:", error);
    return NextResponse.json(
      {
        error: "Failed to group backlogs",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
