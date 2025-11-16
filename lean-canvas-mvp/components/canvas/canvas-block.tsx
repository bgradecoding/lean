"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, HelpCircle, Sparkles, Check, X, BookmarkPlus } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Canvas } from "@/types";
import { SaveToBacklogDialog } from "./save-to-backlog-dialog";

interface CanvasBlockProps {
  id: string;
  title: string;
  content: string;
  placeholder: string;
  color: string;
  description: string;
  onSave: (content: string) => Promise<void>;
  isReadOnly?: boolean;
  canvasData?: Canvas;
  canvasSlug?: string;
  onBacklogCreated?: () => void;
}

const colorClasses: Record<string, string> = {
  red: "bg-red-50 border-red-200 hover:border-red-300 focus-within:ring-red-400",
  blue: "bg-blue-50 border-blue-200 hover:border-blue-300 focus-within:ring-blue-400",
  purple: "bg-purple-50 border-purple-200 hover:border-purple-300 focus-within:ring-purple-400",
  orange: "bg-orange-50 border-orange-200 hover:border-orange-300 focus-within:ring-orange-400",
  green: "bg-green-50 border-green-200 hover:border-green-300 focus-within:ring-green-400",
  yellow: "bg-yellow-50 border-yellow-200 hover:border-yellow-300 focus-within:ring-yellow-400",
  teal: "bg-teal-50 border-teal-200 hover:border-teal-300 focus-within:ring-teal-400",
  gray: "bg-gray-50 border-gray-200 hover:border-gray-300 focus-within:ring-gray-400",
  emerald: "bg-emerald-50 border-emerald-200 hover:border-emerald-300 focus-within:ring-emerald-400",
};

export function CanvasBlock({
  id,
  title,
  content,
  placeholder,
  color,
  description,
  onSave,
  isReadOnly = false,
  canvasData,
  canvasSlug,
  onBacklogCreated,
}: CanvasBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(content);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState("");
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [showBacklogDialog, setShowBacklogDialog] = useState(false);

  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    setValue(content);
    setLastSaved(content);
  }, [content]);

  const handleSave = useCallback(async (newContent: string) => {
    setIsSaving(true);
    try {
      await onSave(newContent);
      setLastSaved(newContent);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  const handleAIGenerate = useCallback(async () => {
    if (isReadOnly || isGenerating) return;

    // Validation: 캔버스 이름이 없으면 AI 생성 불가
    if (!canvasData?.name || canvasData.name.trim() === "") {
      setGenerationError("캔버스 이름을 먼저 입력해주세요. AI가 내용을 생성하려면 최소한 캔버스 이름이 필요합니다.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blockId: id,
          canvasData: canvasData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate content");
      }

      const data = await response.json();
      const generatedText = data.generatedText;

      // 생성된 텍스트를 프리뷰에 표시
      setGeneratedContent(generatedText);
      setShowAIPreview(true);
    } catch (error: any) {
      console.error("AI generation error:", error);
      setGenerationError(error.message || "AI 생성 중 오류가 발생했습니다");
    } finally {
      setIsGenerating(false);
    }
  }, [id, canvasData, isReadOnly, isGenerating]);

  const handleApplyAI = useCallback(async () => {
    // 프리뷰 내용을 실제 값에 적용하고 저장
    setValue(generatedContent);
    setLastSaved(generatedContent);
    setShowAIPreview(false);
    setIsEditing(false);
    await handleSave(generatedContent);
  }, [generatedContent, handleSave]);

  const handleDiscardAI = useCallback(() => {
    // 프리뷰 취소
    setGeneratedContent("");
    setShowAIPreview(false);
  }, []);

  useEffect(() => {
    if (debouncedValue !== lastSaved && isEditing && !isReadOnly) {
      handleSave(debouncedValue);
    }
  }, [debouncedValue, lastSaved, isEditing, isReadOnly, handleSave]);

  // 에러 메시지 자동 제거 (5초 후)
  useEffect(() => {
    if (generationError) {
      const timer = setTimeout(() => {
        setGenerationError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [generationError]);

  return (
    <div
      className={cn(
        "border-2 rounded-lg p-4 transition-all cursor-pointer",
        colorClasses[color] || colorClasses.gray,
        isEditing && !isReadOnly && "ring-2"
      )}
      onClick={() => !isReadOnly && setIsEditing(true)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  type="button"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {!isReadOnly && (
            <>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="text-purple-400 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAIGenerate();
                      }}
                      disabled={isGenerating}
                      type="button"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>AI로 내용 작성하기</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {id === "problem" && canvasSlug && value && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="text-blue-400 hover:text-blue-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBacklogDialog(true);
                        }}
                        type="button"
                      >
                        <BookmarkPlus className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>백로그로 저장</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
          {!isSaving && lastSaved === value && value !== "" && (
            <span className="text-xs text-green-600">✓</span>
          )}
        </div>
      </div>

      {isEditing && !isReadOnly ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setIsEditing(false)}
          placeholder={placeholder}
          className="w-full min-h-[100px] p-2 border-0 bg-transparent resize-none focus:outline-none text-sm"
          autoFocus
        />
      ) : (
        <p className="text-gray-600 whitespace-pre-wrap text-sm min-h-[100px]">
          {value || <span className="text-gray-400">{placeholder}</span>}
        </p>
      )}

      {generationError && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
          {generationError}
        </div>
      )}

      {showAIPreview && (
        <div
          className="mt-3 border-t pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">AI 생성 결과</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDiscardAI}
                className="h-7 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleApplyAI}
                className="h-7 text-xs bg-purple-600 hover:bg-purple-700"
              >
                <Check className="h-3 w-3 mr-1" />
                적용
              </Button>
            </div>
          </div>
          <textarea
            value={generatedContent}
            onChange={(e) => setGeneratedContent(e.target.value)}
            className="w-full min-h-[120px] p-3 border rounded-md text-sm bg-purple-50 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            placeholder="AI가 생성한 내용..."
          />
          <p className="mt-1 text-xs text-gray-500">
            생성된 내용을 수정한 후 &apos;적용&apos; 버튼을 눌러주세요.
          </p>
        </div>
      )}

      {/* 백로그 저장 다이얼로그 */}
      {id === "problem" && canvasSlug && (
        <SaveToBacklogDialog
          open={showBacklogDialog}
          onOpenChange={setShowBacklogDialog}
          problemContent={value}
          canvasSlug={canvasSlug}
          onSuccess={onBacklogCreated}
        />
      )}
    </div>
  );
}
