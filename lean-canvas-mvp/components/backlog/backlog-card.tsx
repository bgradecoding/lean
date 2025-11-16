"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "@/lib/utils";
import { BacklogPriority, BacklogStatus, type BacklogWithLinks } from "@/types";
import { FileText, Users, ClipboardList, Search, MoreHorizontal } from "lucide-react";

interface BacklogCardProps {
  backlog: BacklogWithLinks;
}

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

const sourceIcons = {
  Meeting: Users,
  Interview: Users,
  Survey: ClipboardList,
  Research: Search,
  Other: MoreHorizontal,
};

export function BacklogCard({ backlog }: BacklogCardProps) {
  const priorityInfo = priorityConfig[backlog.priority as BacklogPriority] || priorityConfig[BacklogPriority.Medium];
  const statusInfo = statusConfig[backlog.status as BacklogStatus] || statusConfig[BacklogStatus.New];
  const SourceIcon = backlog.source ? sourceIcons[backlog.source as keyof typeof sourceIcons] || FileText : FileText;

  const canvasCount = backlog.canvasLinks?.length || 0;
  const tags = backlog.tags ? backlog.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  return (
    <Link href={`/backlog/${backlog.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant={priorityInfo.variant}>
              {priorityInfo.label}
            </Badge>
            <Badge variant={statusInfo.variant}>
              {statusInfo.label}
            </Badge>
          </div>
          <CardTitle className="line-clamp-2 text-lg">{backlog.title}</CardTitle>
          {backlog.description && (
            <CardDescription className="line-clamp-3">
              {backlog.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0 mt-auto">
          <div className="flex flex-col gap-2">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{tags.length - 3}</span>
                )}
              </div>
            )}

            {/* Footer info */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <SourceIcon className="w-3 h-3" />
                <span>{backlog.source || "Other"}</span>
              </div>
              {canvasCount > 0 && (
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{canvasCount} Canvas</span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400">
              Updated {formatDistanceToNow(new Date(backlog.updatedAt))}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
