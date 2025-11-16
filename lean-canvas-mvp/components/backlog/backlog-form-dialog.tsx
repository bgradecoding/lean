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
import { BacklogForm, type BacklogFormData } from "./backlog-form";
import { type Backlog } from "@/types";

interface BacklogFormDialogProps {
  trigger: React.ReactNode;
  backlog?: Backlog;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BacklogFormDialog({ trigger, backlog, open, onOpenChange, onSuccess }: BacklogFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const handleSubmit = async (data: BacklogFormData) => {
    setIsSubmitting(true);
    try {
      if (backlog) {
        // Update existing backlog
        const response = await fetch(`/api/backlog/${backlog.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to update backlog");
        }

        setDialogOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Create new backlog
        const response = await fetch("/api/backlog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to create backlog");
        }

        const result = await response.json();
        setDialogOpen(false);
        router.push(`/backlog/${result.backlog.slug}`);
      }
    } catch (error) {
      console.error("Error submitting backlog:", error);
      alert(backlog ? "백로그 수정에 실패했습니다" : "백로그 생성에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{backlog ? "백로그 수정" : "새 백로그 추가"}</DialogTitle>
          <DialogDescription>
            {backlog
              ? "백로그 정보를 수정하세요"
              : "고객 문제 백로그를 생성하세요. 나중에 린 캔버스와 연결할 수 있습니다."}
          </DialogDescription>
        </DialogHeader>
        <BacklogForm
          backlog={backlog}
          onSubmit={handleSubmit}
          onCancel={() => setDialogOpen(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
