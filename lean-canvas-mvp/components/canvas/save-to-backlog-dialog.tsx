"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, BookmarkPlus } from "lucide-react";

interface SaveToBacklogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problemContent: string;
  canvasSlug: string;
  onSuccess?: () => void;
}

export function SaveToBacklogDialog({
  open,
  onOpenChange,
  problemContent,
  canvasSlug,
  onSuccess,
}: SaveToBacklogDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(problemContent);
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [source, setSource] = useState<string>("Meeting");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. 백로그 생성
      const createResponse = await fetch("/api/backlog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
          source,
          tags,
          status: "New",
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "백로그 생성에 실패했습니다.");
      }

      const { backlog } = await createResponse.json();

      // 2. 캔버스에 연결
      const linkResponse = await fetch(`/api/canvas/${canvasSlug}/backlog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          backlogId: backlog.id,
        }),
      });

      if (!linkResponse.ok) {
        const errorData = await linkResponse.json();
        throw new Error(errorData.error || "캔버스 연결에 실패했습니다.");
      }

      // 성공
      alert("백로그가 생성되고 캔버스에 연결되었습니다!");

      // 폼 리셋
      setTitle("");
      setDescription(problemContent);
      setPriority("Medium");
      setSource("Meeting");
      setTags("");

      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Error creating backlog:", err);
      setError(err.message || "백로그 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkPlus className="h-5 w-5" />
            백로그로 저장
          </DialogTitle>
          <DialogDescription>
            문제 블록의 내용을 백로그로 저장하고 이 캔버스에 자동으로 연결합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 제목 */}
          <div>
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="백로그 제목을 입력하세요"
              required
            />
          </div>

          {/* 설명 */}
          <div>
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="백로그 설명을 입력하세요"
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 출처 */}
            <div>
              <Label htmlFor="source">출처</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meeting">고객 미팅</SelectItem>
                  <SelectItem value="Interview">인터뷰</SelectItem>
                  <SelectItem value="Survey">설문조사</SelectItem>
                  <SelectItem value="Research">리서치</SelectItem>
                  <SelectItem value="Other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 우선순위 */}
            <div>
              <Label htmlFor="priority">우선순위</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">높음</SelectItem>
                  <SelectItem value="Medium">보통</SelectItem>
                  <SelectItem value="Low">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 태그 */}
          <div>
            <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="예: UX, 성능, 로그인"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {/* 버튼들 */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              백로그 생성 및 연결
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
