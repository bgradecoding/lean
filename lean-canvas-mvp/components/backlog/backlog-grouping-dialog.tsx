"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Network, Loader2, Check, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { type BacklogWithLinks } from "@/types";

interface BacklogGroup {
  groupName: string;
  description: string;
  backlogIds: string[];
  suggestedPriority: string;
  suggestedTags: string;
}

interface BacklogGroupingDialogProps {
  backlogs: BacklogWithLinks[];
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function BacklogGroupingDialog({
  backlogs,
  trigger,
  onSuccess,
}: BacklogGroupingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGrouping, setIsGrouping] = useState(false);
  const [groups, setGroups] = useState<BacklogGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Set<number>>(new Set());
  const [isApplying, setIsApplying] = useState(false);

  const handleGroupBacklogs = async () => {
    if (backlogs.length < 2) {
      toast.error("그룹화하려면 최소 2개 이상의 백로그가 필요합니다");
      return;
    }

    if (backlogs.length > 50) {
      toast.error("한 번에 최대 50개의 백로그만 그룹화할 수 있습니다");
      return;
    }

    setIsGrouping(true);
    try {
      const response = await fetch("/api/ai/group-backlogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backlogs }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to group backlogs");
      }

      const data = await response.json();
      setGroups(data.groups || []);

      if (data.count === 0) {
        toast.info("유사한 백로그를 찾지 못했습니다");
      } else {
        // 기본적으로 모든 그룹 선택
        setSelectedGroups(new Set(data.groups.map((_: any, idx: number) => idx)));
        toast.success(`${data.count}개의 그룹을 제안했습니다`);
      }
    } catch (error: any) {
      console.error("Grouping error:", error);
      toast.error(error.message || "그룹화에 실패했습니다");
    } finally {
      setIsGrouping(false);
    }
  };

  const toggleGroup = (index: number) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedGroups(newSelected);
  };

  const handleApplyGroups = async () => {
    if (selectedGroups.size === 0) {
      toast.error("적용할 그룹을 선택해주세요");
      return;
    }

    setIsApplying(true);
    try {
      const selectedGroupsList = Array.from(selectedGroups).map(
        (idx) => groups[idx]
      );

      // 각 그룹의 백로그들에 공통 태그 추가
      for (const group of selectedGroupsList) {
        const backlogIdsToUpdate = group.backlogIds;
        const newTags = group.suggestedTags;

        // 각 백로그 업데이트
        await Promise.all(
          backlogIdsToUpdate.map(async (backlogId) => {
            const backlog = backlogs.find((b) => b.id === backlogId);
            if (!backlog) return;

            // 기존 태그와 새 태그 병합
            const existingTags = backlog.tags
              ? backlog.tags.split(",").map((t) => t.trim())
              : [];
            const newTagsList = newTags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t);

            const mergedTags = Array.from(
              new Set([...existingTags, ...newTagsList])
            ).join(",");

            const response = await fetch(`/api/backlog/${backlog.slug}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tags: mergedTags,
                priority: group.suggestedPriority,
              }),
            });

            if (!response.ok) {
              throw new Error(`Failed to update backlog: ${backlog.title}`);
            }
          })
        );
      }

      toast.success(`${selectedGroups.size}개 그룹을 적용했습니다`);

      // 다이얼로그 닫기 및 초기화
      setIsOpen(false);
      setGroups([]);
      setSelectedGroups(new Set());

      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Apply groups error:", error);
      toast.error(error.message || "그룹 적용에 실패했습니다");
    } finally {
      setIsApplying(false);
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

  const getBacklogTitle = (backlogId: string) => {
    const backlog = backlogs.find((b) => b.id === backlogId);
    return backlog?.title || "Unknown";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Network className="mr-2 h-4 w-4" />
            AI로 백로그 그룹화
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI로 백로그 그룹화</DialogTitle>
          <DialogDescription>
            AI가 유사한 백로그들을 분석하여 그룹화 제안을 제공합니다. 제안을
            수락하면 해당 백로그들에 공통 태그가 추가됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 백로그 수 정보 */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {backlogs.length}개의 백로그를 분석합니다
              </span>
            </div>
            <Button
              onClick={handleGroupBacklogs}
              disabled={isGrouping || backlogs.length < 2}
            >
              {isGrouping ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  그룹화 중...
                </>
              ) : (
                <>
                  <Network className="mr-2 h-4 w-4" />
                  그룹화 시작
                </>
              )}
            </Button>
          </div>

          {/* 그룹화 결과 */}
          {groups.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  그룹화 제안 ({groups.length}개)
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedGroups.size}개 선택됨
                </p>
              </div>

              <div className="space-y-3">
                {groups.map((group, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedGroups.has(index)
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => toggleGroup(index)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedGroups.has(index)}
                        onCheckedChange={() => toggleGroup(index)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-lg">
                            {group.groupName}
                          </h4>
                          <Badge className={getPriorityColor(group.suggestedPriority)}>
                            {group.suggestedPriority}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {group.description}
                        </p>

                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700">
                            포함된 백로그 ({group.backlogIds.length}개):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {group.backlogIds.map((backlogId) => (
                              <Badge
                                key={backlogId}
                                variant="outline"
                                className="text-xs"
                              >
                                {getBacklogTitle(backlogId)}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {group.suggestedTags && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700">
                              추가될 태그:
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {group.suggestedTags
                                .split(",")
                                .map((tag, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {tag.trim()}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 적용 버튼 */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setGroups([]);
                    setSelectedGroups(new Set());
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  취소
                </Button>
                <Button
                  onClick={handleApplyGroups}
                  disabled={isApplying || selectedGroups.size === 0}
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      적용 중...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {selectedGroups.size}개 그룹 적용
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* 그룹화 결과가 없을 때 */}
          {!isGrouping && groups.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Network className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-sm">
                &quot;그룹화 시작&quot; 버튼을 클릭하여 유사한 백로그를
                찾아보세요
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
