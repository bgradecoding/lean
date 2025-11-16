"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Canvas {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
}

interface LinkCanvasDialogProps {
  trigger: React.ReactNode;
  backlogSlug: string;
  backlogId: string;
  linkedCanvasIds: string[];
  onLink: () => void;
}

export function LinkCanvasDialog({
  trigger,
  backlogSlug,
  backlogId,
  linkedCanvasIds,
  onLink,
}: LinkCanvasDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [selectedCanvasId, setSelectedCanvasId] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCanvases();
    }
  }, [isOpen]);

  const fetchCanvases = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/canvas");
      if (!response.ok) {
        throw new Error("Failed to fetch canvases");
      }
      const data = await response.json();
      setCanvases(data.canvases || []);
    } catch (error) {
      console.error("Error fetching canvases:", error);
      setCanvases([]);
    } finally {
      setIsLoading(false);
    }
  };

  const availableCanvases = canvases.filter(
    (canvas) => !linkedCanvasIds.includes(canvas.id)
  );

  const handleSubmit = async () => {
    if (!selectedCanvasId) return;

    setIsSubmitting(true);
    try {
      const canvas = canvases.find((c) => c.id === selectedCanvasId);
      if (!canvas) return;

      const response = await fetch(`/api/canvas/${canvas.slug}/backlog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backlogId,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to link canvas");
      }

      setIsOpen(false);
      setSelectedCanvasId("");
      setNotes("");
      onLink();
    } catch (error) {
      console.error("Error linking canvas:", error);
      alert("캔버스 연결에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>캔버스 연결</DialogTitle>
          <DialogDescription>
            이 백로그를 린 캔버스와 연결하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <p className="text-sm text-gray-500">캔버스 목록을 불러오는 중...</p>
          ) : availableCanvases.length === 0 ? (
            <p className="text-sm text-gray-500">
              연결 가능한 캔버스가 없습니다
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="canvas">캔버스 선택</Label>
                <Select value={selectedCanvasId} onValueChange={setSelectedCanvasId}>
                  <SelectTrigger id="canvas">
                    <SelectValue placeholder="캔버스를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCanvases.map((canvas) => (
                      <SelectItem key={canvas.id} value={canvas.id}>
                        {canvas.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">메모 (선택사항)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="연결과 관련된 메모를 작성하세요"
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCanvasId || isSubmitting || availableCanvases.length === 0}
          >
            {isSubmitting ? "연결 중..." : "연결"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
