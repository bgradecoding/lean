"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "@/lib/utils";

interface CanvasCardProps {
  slug: string;
  name: string;
  description?: string | null;
  updatedAt: Date | string;
}

export function CanvasCard({ slug, name, description, updatedAt }: CanvasCardProps) {
  return (
    <Link href={`/canvas/${slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="line-clamp-1">{name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {description || "No description"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">
            Updated {formatDistanceToNow(new Date(updatedAt))}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
