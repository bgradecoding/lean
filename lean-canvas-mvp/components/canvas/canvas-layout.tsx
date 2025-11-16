"use client";

import { useState, useCallback } from "react";
import { Canvas, Backlog } from "@/types";
import { CanvasGrid } from "./canvas-grid";
import { BacklogPanel } from "./backlog-panel";

interface CanvasLayoutProps {
  canvas: Canvas;
  isReadOnly: boolean;
}

export function CanvasLayout({ canvas, isReadOnly }: CanvasLayoutProps) {
  const [canvasData, setCanvasData] = useState<Canvas>(canvas);
  const [backlogRefreshTrigger, setBacklogRefreshTrigger] = useState(0);

  // 백로그를 문제 블록에 추가하는 핸들러
  const handleAddToProblemBlock = useCallback(async (backlog: Backlog) => {
    // 현재 문제 블록의 내용 가져오기
    const currentProblem = canvasData.problem || "";

    // 백로그 내용을 문제 블록에 추가
    const backlogContent = `- ${backlog.title}${backlog.description ? `\n  ${backlog.description}` : ""}`;

    // 기존 내용이 있으면 줄바꿈 후 추가, 없으면 바로 추가
    const newProblem = currentProblem
      ? `${currentProblem}\n\n${backlogContent}`
      : backlogContent;

    // 낙관적 업데이트
    const updatedCanvas = {
      ...canvasData,
      problem: newProblem,
    };
    setCanvasData(updatedCanvas);

    try {
      // API 호출하여 저장
      const response = await fetch(`/api/canvas/${canvas.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ problem: newProblem }),
      });

      if (!response.ok) {
        throw new Error("Failed to update problem block");
      }

      const data = await response.json();
      setCanvasData(data.canvas);

      // 성공 알림 (선택적)
      alert("백로그가 문제 블록에 추가되었습니다!");
    } catch (error) {
      // 실패 시 롤백
      setCanvasData(canvasData);
      console.error("Error adding backlog to problem block:", error);
      alert("백로그를 문제 블록에 추가하는 중 오류가 발생했습니다.");
    }
  }, [canvasData, canvas.slug]);

  // 백로그 생성 시 호출되는 핸들러
  const handleBacklogCreated = useCallback(() => {
    // 백로그 패널을 새로고침하기 위해 트리거 값 증가
    setBacklogRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="flex">
      <div className="flex-1 overflow-auto">
        <CanvasGrid
          canvas={canvasData}
          isReadOnly={isReadOnly}
          onCanvasUpdate={setCanvasData}
          onBacklogCreated={handleBacklogCreated}
        />
      </div>
      <BacklogPanel
        key={backlogRefreshTrigger}
        canvasSlug={canvas.slug}
        isReadOnly={isReadOnly}
        onAddToProblemBlock={handleAddToProblemBlock}
      />
    </div>
  );
}
