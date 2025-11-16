"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type Backlog,
  BacklogPriority,
  BacklogStatus,
} from "@/types";
import { Calendar, Lock } from "lucide-react";
import { formatDistanceToNow, cn } from "@/lib/utils";
import { getTagColor } from "@/lib/tag-utils";

const priorityConfig = {
  [BacklogPriority.High]: { variant: "danger" as const, label: "High" },
  [BacklogPriority.Medium]: { variant: "warning" as const, label: "Medium" },
  [BacklogPriority.Low]: { variant: "success" as const, label: "Low" },
};

const statusConfig = {
  [BacklogStatus.New]: { variant: "default" as const, label: "New" },
  [BacklogStatus.Validated]: { variant: "success" as const, label: "Validated" },
  [BacklogStatus.InCanvas]: { variant: "secondary" as const, label: "In Canvas" },
  [BacklogStatus.Rejected]: { variant: "outline" as const, label: "Rejected" },
};

export default function SharedBacklogPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [backlog, setBacklog] = useState<Backlog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBacklog();
  }, [params.token]);

  const fetchBacklog = async () => {
    try {
      const response = await fetch(`/api/share/backlog/${params.token}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("백로그를 찾을 수 없거나 공유가 비활성화되었습니다.");
        } else {
          setError("백로그를 불러오는데 실패했습니다.");
        }
        return;
      }
      const data = await response.json();
      setBacklog(data.backlog);
    } catch (error) {
      console.error("Error fetching shared backlog:", error);
      setError("백로그를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error || !backlog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Lock className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">{error || "백로그를 찾을 수 없습니다."}</p>
      </div>
    );
  }

  const priorityInfo = priorityConfig[backlog.priority as BacklogPriority] ||
    priorityConfig[BacklogPriority.Medium];
  const statusInfo = statusConfig[backlog.status as BacklogStatus] ||
    statusConfig[BacklogStatus.New];
  const tags = backlog.tags ? backlog.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 text-center">
          <Badge variant="secondary" className="mb-2">
            공유된 백로그
          </Badge>
          <p className="text-sm text-gray-500">
            이 페이지는 읽기 전용입니다
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={priorityInfo.variant}>
                    {priorityInfo.label}
                  </Badge>
                  <Badge variant={statusInfo.variant}>
                    {statusInfo.label}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{backlog.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {backlog.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">설명</h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {backlog.description}
                </p>
              </div>
            )}

            {tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className={cn("text-sm", getTagColor(tag))}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">출처</h3>
                <p className="text-gray-600">{backlog.source || "Other"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  발견일
                </h3>
                <p className="text-gray-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDistanceToNow(new Date(backlog.discoveredAt))}
                </p>
              </div>
            </div>

            <div className="text-xs text-gray-400 pt-2">
              최종 수정: {formatDistanceToNow(new Date(backlog.updatedAt))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
