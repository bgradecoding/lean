"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ExtractedProblem {
  title: string;
  description: string;
  priority: string;
  source: string;
  suggestedTags: string;
}

interface AiExtractDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AiExtractDialog({ trigger, onSuccess }: AiExtractDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [interviewNotes, setInterviewNotes] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedProblems, setExtractedProblems] = useState<ExtractedProblem[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<Set<number>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleExtract = async () => {
    if (!interviewNotes.trim()) {
      toast.error("인터뷰 노트를 입력해주세요");
      return;
    }

    if (interviewNotes.trim().length < 50) {
      toast.error("더 상세한 인터뷰 노트를 입력해주세요 (최소 50자)");
      return;
    }

    setIsExtracting(true);
    try {
      const response = await fetch("/api/ai/extract-problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewNotes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to extract problems");
      }

      const data = await response.json();
      setExtractedProblems(data.problems || []);

      // 기본적으로 모든 문제 선택
      setSelectedProblems(new Set(data.problems.map((_: any, idx: number) => idx)));

      toast.success(`${data.count}개의 문제를 추출했습니다`);
    } catch (error: any) {
      console.error("Extract error:", error);
      toast.error(error.message || "문제 추출에 실패했습니다");
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleProblem = (index: number) => {
    const newSelected = new Set(selectedProblems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedProblems(newSelected);
  };

  const handleCreateBacklogs = async () => {
    if (selectedProblems.size === 0) {
      toast.error("생성할 백로그를 선택해주세요");
      return;
    }

    setIsCreating(true);
    try {
      const selectedProblemsList = Array.from(selectedProblems).map(
        (idx) => extractedProblems[idx]
      );

      // 각 문제에 대해 백로그 생성
      const results = await Promise.all(
        selectedProblemsList.map(async (problem) => {
          const response = await fetch("/api/backlog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: problem.title,
              description: problem.description,
              priority: problem.priority,
              source: problem.source,
              tags: problem.suggestedTags,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to create backlog: ${problem.title}`);
          }

          return response.json();
        })
      );

      toast.success(`${results.length}개의 백로그가 생성되었습니다`);

      // 다이얼로그 닫기 및 초기화
      setIsOpen(false);
      setInterviewNotes("");
      setExtractedProblems([]);
      setSelectedProblems(new Set());

      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
      }

      // 페이지 새로고침
      router.refresh();
    } catch (error: any) {
      console.error("Create backlogs error:", error);
      toast.error(error.message || "백로그 생성에 실패했습니다");
    } finally {
      setIsCreating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            AI로 문제 추출
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI로 고객 문제 추출</DialogTitle>
          <DialogDescription>
            고객 인터뷰, 미팅 노트를 입력하면 AI가 자동으로 고객 문제를 추출하고 백로그로 정리해드립니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 인터뷰 노트 입력 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">인터뷰 노트</label>
            <Textarea
              placeholder="고객과의 인터뷰 내용, 미팅 노트, 관찰 내용 등을 입력하세요&#10;&#10;예시:&#10;고객: 김영희 (25세, 직장인)&#10;- 매일 아침 출근 준비하느라 바쁨&#10;- 옷 고르는데 평균 15분 소요&#10;- 날씨에 맞는 옷을 고르기 어려움&#10;- 비슷한 스타일만 입게 됨&#10;- 옷장에 옷은 많은데 입을 게 없다고 느낌"
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              rows={10}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              최소 50자 이상의 상세한 노트를 입력해주세요
            </p>
          </div>

          {/* 추출 버튼 */}
          <div className="flex justify-end">
            <Button
              onClick={handleExtract}
              disabled={isExtracting || !interviewNotes.trim()}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  문제 추출 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  문제 추출하기
                </>
              )}
            </Button>
          </div>

          {/* 추출된 문제 목록 */}
          {extractedProblems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  추출된 문제 ({extractedProblems.length}개)
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedProblems.size}개 선택됨
                </p>
              </div>

              <div className="space-y-3">
                {extractedProblems.map((problem, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedProblems.has(index)
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => toggleProblem(index)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedProblems.has(index)}
                        onCheckedChange={() => toggleProblem(index)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium">{problem.title}</h4>
                          <Badge className={getPriorityColor(problem.priority)}>
                            {problem.priority}
                          </Badge>
                        </div>
                        {problem.description && (
                          <p className="text-sm text-muted-foreground">
                            {problem.description}
                          </p>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {problem.source}
                          </Badge>
                          {problem.suggestedTags &&
                            problem.suggestedTags.split(",").map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 백로그 생성 버튼 */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setExtractedProblems([]);
                    setSelectedProblems(new Set());
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  취소
                </Button>
                <Button
                  onClick={handleCreateBacklogs}
                  disabled={isCreating || selectedProblems.size === 0}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {selectedProblems.size}개 백로그 생성
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
