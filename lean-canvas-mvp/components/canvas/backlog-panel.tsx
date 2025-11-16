"use client";

import { useState, useEffect } from "react";
import { Backlog, BacklogPriority, BacklogStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ChevronDown, ArrowDown, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BacklogPanelProps {
  canvasSlug: string;
  isReadOnly?: boolean;
  onAddToProblemBlock?: (backlog: Backlog) => void;
}

const priorityConfig: Record<BacklogPriority, { label: string; variant: "destructive" | "default" | "secondary" }> = {
  High: { label: "높음", variant: "destructive" },
  Medium: { label: "보통", variant: "default" },
  Low: { label: "낮음", variant: "secondary" },
};

const statusConfig: Record<BacklogStatus, { label: string; className: string }> = {
  New: { label: "새로운", className: "bg-blue-100 text-blue-800" },
  Validated: { label: "검증됨", className: "bg-green-100 text-green-800" },
  InCanvas: { label: "캔버스에 있음", className: "bg-purple-100 text-purple-800" },
  Rejected: { label: "거부됨", className: "bg-gray-100 text-gray-800" },
};

export function BacklogPanel({ canvasSlug, isReadOnly = false, onAddToProblemBlock }: BacklogPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [linkedBacklogs, setLinkedBacklogs] = useState<Backlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 연결 다이얼로그 상태
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [availableBacklogs, setAvailableBacklogs] = useState<Backlog[]>([]);
  const [selectedBacklogId, setSelectedBacklogId] = useState<string>("");

  // 연결된 백로그 가져오기
  useEffect(() => {
    fetchLinkedBacklogs();
  }, [canvasSlug]);

  const fetchLinkedBacklogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/canvas/${canvasSlug}/backlog`);
      if (!response.ok) {
        throw new Error("Failed to fetch linked backlogs");
      }
      const data = await response.json();
      setLinkedBacklogs(data.backlogs || []);
    } catch (err: any) {
      console.error("Error fetching linked backlogs:", err);
      setError(err.message || "백로그를 불러오는 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // 연결 가능한 백로그 목록 가져오기
  const fetchAvailableBacklogs = async () => {
    try {
      const response = await fetch("/api/backlog");
      if (!response.ok) {
        throw new Error("Failed to fetch backlogs");
      }
      const data = await response.json();
      // 이미 연결된 백로그는 제외
      const linkedIds = new Set(linkedBacklogs.map(b => b.id));
      const available = data.backlogs.filter((b: Backlog) => !linkedIds.has(b.id));
      setAvailableBacklogs(available);
    } catch (err) {
      console.error("Error fetching available backlogs:", err);
    }
  };

  // 백로그 연결
  const handleLinkBacklog = async () => {
    if (!selectedBacklogId) {
      alert("백로그를 선택해주세요.");
      return;
    }

    console.log("Linking backlog:", selectedBacklogId);
    setIsLinking(true);
    try {
      const response = await fetch(`/api/canvas/${canvasSlug}/backlog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ backlogId: selectedBacklogId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to link backlog");
      }

      // 연결 성공 후 목록 새로고침
      await fetchLinkedBacklogs();
      setIsLinkDialogOpen(false);
      setSelectedBacklogId("");
      alert("백로그가 성공적으로 연결되었습니다!");
    } catch (err: any) {
      console.error("Error linking backlog:", err);
      alert(err.message || "백로그 연결 중 오류가 발생했습니다");
    } finally {
      setIsLinking(false);
    }
  };

  // 백로그 연결 해제
  const handleUnlinkBacklog = async (backlogId: string) => {
    if (!confirm("이 백로그와의 연결을 해제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/canvas/${canvasSlug}/backlog/${backlogId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to unlink backlog");
      }

      // 연결 해제 성공 후 목록 새로고침
      await fetchLinkedBacklogs();
    } catch (err: any) {
      console.error("Error unlinking backlog:", err);
      alert(err.message || "백로그 연결 해제 중 오류가 발생했습니다");
    }
  };

  return (
    <div className={cn(
      "bg-white border-l border-gray-200 transition-all duration-300",
      isOpen ? "w-80" : "w-12"
    )}>
      {/* 패널 토글 버튼 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {isOpen ? (
          <>
            <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              📋 연결된 백로그
              <Badge variant="secondary" className="text-xs">{linkedBacklogs.length}</Badge>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="h-8 w-8 p-0 mx-auto"
          >
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </Button>
        )}
      </div>

      {/* 패널 내용 */}
      {isOpen && (
        <div className="flex flex-col h-[calc(100vh-12rem)] overflow-hidden">
          {/* 백로그 연결 버튼 */}
          {!isReadOnly && (
            <div className="p-3 border-b border-gray-200">
              <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => fetchAvailableBacklogs()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    백로그 연결
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>백로그 연결하기</DialogTitle>
                    <DialogDescription>
                      이 캔버스에 연결할 백로그를 선택하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Select value={selectedBacklogId} onValueChange={setSelectedBacklogId}>
                      <SelectTrigger>
                        <SelectValue placeholder="백로그 선택..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBacklogs.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500 text-center">
                            연결 가능한 백로그가 없습니다
                          </div>
                        ) : (
                          availableBacklogs.map((backlog) => (
                            <SelectItem key={backlog.id} value={backlog.id}>
                              {backlog.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsLinkDialogOpen(false);
                          setSelectedBacklogId("");
                        }}
                      >
                        취소
                      </Button>
                      <Button
                        onClick={handleLinkBacklog}
                        disabled={!selectedBacklogId || isLinking}
                      >
                        {isLinking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        연결하기
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* 백로그 목록 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            ) : linkedBacklogs.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-8">
                연결된 백로그가 없습니다
              </div>
            ) : (
              linkedBacklogs.map((backlog) => (
                <div
                  key={backlog.id}
                  className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                >
                  {/* 백로그 헤더 */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <Badge
                          variant={priorityConfig[backlog.priority as BacklogPriority].variant}
                          className="text-xs"
                        >
                          {priorityConfig[backlog.priority as BacklogPriority].label}
                        </Badge>
                        <Badge
                          className={cn(
                            "text-xs",
                            statusConfig[backlog.status as BacklogStatus].className
                          )}
                        >
                          {statusConfig[backlog.status as BacklogStatus].label}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
                        {backlog.title}
                      </h3>
                    </div>
                    {!isReadOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnlinkBacklog(backlog.id)}
                        className="h-6 w-6 p-0 shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* 백로그 설명 */}
                  {backlog.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {backlog.description}
                    </p>
                  )}

                  {/* 태그 */}
                  {backlog.tags && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {backlog.tags.split(",").slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 액션 버튼들 */}
                  <div className="flex gap-2 mt-2">
                    {!isReadOnly && onAddToProblemBlock && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddToProblemBlock(backlog)}
                        className="h-7 text-xs flex-1"
                      >
                        <ArrowDown className="h-3 w-3 mr-1" />
                        문제 블록에 추가
                      </Button>
                    )}
                    <Link href={`/backlog/${backlog.slug}`} target="_blank">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 모든 백로그 보기 링크 */}
          <div className="p-3 border-t border-gray-200">
            <Link href="/backlog">
              <Button variant="outline" size="sm" className="w-full">
                모든 백로그 보기 →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
