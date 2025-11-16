"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Share2, Trash2, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CanvasHeaderProps {
  canvasName: string;
  canvasSlug: string;
  isOwner: boolean;
}

export function CanvasHeader({ canvasName, canvasSlug, isOwner }: CanvasHeaderProps) {
  const router = useRouter();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    // 클라이언트 사이드에서만 window 객체 사용
    setShareUrl(`${window.location.origin}/canvas/${canvasSlug}`);
  }, [canvasSlug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/canvas/${canvasSlug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete canvas:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">{canvasName}</h1>
            <p className="text-sm text-gray-500">Lean Canvas</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {isOwner && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Canvas</DialogTitle>
            <DialogDescription>
              Anyone with this link can view your canvas (read-only)
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border rounded-md text-sm bg-gray-50"
            />
            <Button onClick={handleCopyLink}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Canvas</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this canvas? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
