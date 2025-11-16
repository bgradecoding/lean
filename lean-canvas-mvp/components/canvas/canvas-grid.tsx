"use client";

import { useState, useEffect } from "react";
import { CanvasBlock } from "./canvas-block";
import { Canvas, CANVAS_BLOCKS } from "@/types";

interface CanvasGridProps {
  canvas: Canvas;
  isReadOnly?: boolean;
  onCanvasUpdate?: (canvas: Canvas) => void;
  onBacklogCreated?: () => void;
}

export function CanvasGrid({ canvas, isReadOnly = false, onCanvasUpdate, onBacklogCreated }: CanvasGridProps) {
  const [canvasData, setCanvasData] = useState<Canvas>(canvas);

  // 외부에서 캔버스 데이터가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    setCanvasData(canvas);
  }, [canvas]);

  const handleSaveBlock = async (blockId: string, content: string) => {
    // Optimistic update
    const updatedCanvas = {
      ...canvasData,
      [blockId]: content,
    };
    setCanvasData(updatedCanvas);

    try {
      const response = await fetch(`/api/canvas/${canvas.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [blockId]: content }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      const data = await response.json();
      setCanvasData(data.canvas);
      // 외부에 업데이트 알림
      if (onCanvasUpdate) {
        onCanvasUpdate(data.canvas);
      }
    } catch (error) {
      // Rollback on error
      setCanvasData(canvasData);
      throw error;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {CANVAS_BLOCKS.map((block) => (
        <div
          key={block.id}
          className={
            block.id === "uniqueValueProp" || block.id === "keyMetrics" || block.id === "revenueStreams"
              ? "md:col-span-2"
              : ""
          }
        >
          <CanvasBlock
            id={block.id}
            title={block.title}
            content={(canvasData[block.id] as string) || ""}
            placeholder={block.placeholder}
            color={block.color}
            description={block.description}
            onSave={(content) => handleSaveBlock(block.id, content)}
            isReadOnly={isReadOnly}
            canvasData={canvasData}
            canvasSlug={canvas.slug}
            onBacklogCreated={onBacklogCreated}
          />
        </div>
      ))}
    </div>
  );
}
