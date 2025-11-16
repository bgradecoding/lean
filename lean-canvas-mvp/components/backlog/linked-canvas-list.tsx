"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, X } from "lucide-react";

interface Canvas {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
}

interface LinkedCanvasListProps {
  canvases: Canvas[];
  onUnlink?: (canvasId: string) => void;
  isOwner?: boolean;
}

export function LinkedCanvasList({ canvases, onUnlink, isOwner = true }: LinkedCanvasListProps) {
  if (canvases.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">
          연결된 캔버스가 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {canvases.map((canvas) => (
        <Card key={canvas.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <Link
                    href={`/canvas/${canvas.slug}`}
                    className="font-medium text-gray-900 hover:text-blue-600 truncate"
                  >
                    {canvas.name}
                  </Link>
                  <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                </div>
                {canvas.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {canvas.description}
                  </p>
                )}
              </div>
              {isOwner && onUnlink && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUnlink(canvas.id)}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
