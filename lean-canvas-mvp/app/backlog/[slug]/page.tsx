"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BacklogFormDialog } from "@/components/backlog/backlog-form-dialog";
import { LinkedCanvasList } from "@/components/backlog/linked-canvas-list";
import { LinkCanvasDialog } from "@/components/backlog/link-canvas-dialog";
import { ShareDialog } from "@/components/backlog/share-dialog";
import {
  type BacklogWithLinks,
  BacklogPriority,
  BacklogStatus,
  BacklogSource,
} from "@/types";
import { ArrowLeft, Edit, Trash2, Plus, FileText, Calendar, Share2 } from "lucide-react";
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

interface Canvas {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
}

export default function BacklogDetailPage({ params }: { params: { slug: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [backlog, setBacklog] = useState<BacklogWithLinks | null>(null);
  const [linkedCanvases, setLinkedCanvases] = useState<Canvas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchBacklog();
      fetchLinkedCanvases();
    }
  }, [status, params.slug, router]);

  const fetchBacklog = async () => {
    try {
      const response = await fetch(`/api/backlog/${params.slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/backlog");
          return;
        }
        throw new Error("Failed to fetch backlog");
      }
      const data = await response.json();
      setBacklog(data.backlog);
    } catch (error) {
      console.error("Error fetching backlog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLinkedCanvases = async () => {
    try {
      const response = await fetch(`/api/backlog/${params.slug}/canvas`);
      if (!response.ok) {
        throw new Error("Failed to fetch linked canvases");
      }
      const data = await response.json();
      setLinkedCanvases(data.canvases || []);
    } catch (error) {
      console.error("Error fetching linked canvases:", error);
      setLinkedCanvases([]);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말로 이 백로그를 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/backlog/${params.slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete backlog");
      }

      router.push("/backlog");
    } catch (error) {
      console.error("Error deleting backlog:", error);
      alert("백로그 삭제에 실패했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUnlinkCanvas = async (canvasId: string) => {
    if (!confirm("이 캔버스와의 연결을 해제하시겠습니까?")) {
      return;
    }

    try {
      const canvas = linkedCanvases.find((c) => c.id === canvasId);
      if (!canvas) return;

      const response = await fetch(
        `/api/canvas/${canvas.slug}/backlog/${backlog?.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unlink canvas");
      }

      fetchLinkedCanvases();
    } catch (error) {
      console.error("Error unlinking canvas:", error);
      alert("연결 해제에 실패했습니다");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!session || !backlog) {
    return null;
  }

  const priorityInfo = priorityConfig[backlog.priority as BacklogPriority] ||
    priorityConfig[BacklogPriority.Medium];
  const statusInfo = statusConfig[backlog.status as BacklogStatus] ||
    statusConfig[BacklogStatus.New];
  const tags = backlog.tags ? backlog.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  return (
    <AppLayout userName={session.user?.name} userEmail={session.user?.email}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/backlog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              백로그 목록
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                  <div className="flex gap-2">
                    <ShareDialog
                      backlogSlug={params.slug}
                      isPublic={backlog.isPublic || false}
                      shareToken={backlog.shareToken || null}
                      onShareToggle={fetchBacklog}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <BacklogFormDialog
                      trigger={
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      }
                      backlog={backlog}
                      onSuccess={fetchBacklog}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    연결된 캔버스 ({linkedCanvases.length})
                  </CardTitle>
                  <LinkCanvasDialog
                    trigger={
                      <Button size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    }
                    backlogSlug={params.slug}
                    backlogId={backlog?.id || ""}
                    linkedCanvasIds={linkedCanvases.map((c) => c.id)}
                    onLink={fetchLinkedCanvases}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <LinkedCanvasList
                  canvases={linkedCanvases}
                  onUnlink={handleUnlinkCanvas}
                  isOwner={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
