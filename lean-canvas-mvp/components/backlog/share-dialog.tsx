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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  trigger?: React.ReactNode;
  backlogSlug: string;
  isPublic: boolean;
  shareToken: string | null;
  onShareToggle: () => void;
}

export function ShareDialog({
  trigger,
  backlogSlug,
  isPublic,
  shareToken,
  onShareToggle,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = shareToken
    ? `${window.location.origin}/share/backlog/${shareToken}`
    : "";

  const handleEnableSharing = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/backlog/${backlogSlug}/share`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to enable sharing");
      }

      onShareToggle();
      toast.success("공유가 활성화되었습니다");
    } catch (error) {
      console.error("Error enabling sharing:", error);
      toast.error("공유 활성화에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableSharing = async () => {
    if (!confirm("공유를 비활성화하시겠습니까? 기존 공유 링크는 더 이상 작동하지 않습니다.")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/backlog/${backlogSlug}/share`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to disable sharing");
      }

      onShareToggle();
      toast.success("공유가 비활성화되었습니다");
      setOpen(false);
    } catch (error) {
      console.error("Error disabling sharing:", error);
      toast.error("공유 비활성화에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("링크가 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("복사에 실패했습니다");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>백로그 공유</DialogTitle>
          <DialogDescription>
            {isPublic
              ? "이 백로그는 현재 공유 중입니다. 링크를 가진 사람은 누구나 볼 수 있습니다."
              : "백로그를 공유하려면 공유를 활성화하세요."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isPublic && shareUrl ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="share-url">공유 링크</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  이 링크를 복사하여 다른 사람과 공유하세요
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleDisableSharing}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  공유 비활성화
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <p className="text-sm text-gray-600">
                공유를 활성화하면 링크를 가진 사람은 누구나 이 백로그를 볼 수 있습니다.
              </p>
              <Button
                onClick={handleEnableSharing}
                disabled={isLoading}
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                공유 활성화
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
