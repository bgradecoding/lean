"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BacklogList } from "@/components/backlog/backlog-list";
import { BacklogFilters } from "@/components/backlog/backlog-filters";
import { BacklogFormDialog } from "@/components/backlog/backlog-form-dialog";
import { AiExtractDialog } from "@/components/backlog/ai-extract-dialog";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { type BacklogWithLinks } from "@/types";

export default function BacklogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [backlogs, setBacklogs] = useState<BacklogWithLinks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchBacklogs();
    }
  }, [status, router]);

  const fetchBacklogs = async () => {
    try {
      const response = await fetch("/api/backlog");
      if (!response.ok) {
        throw new Error("Failed to fetch backlogs");
      }
      const data = await response.json();
      setBacklogs(data.backlogs || []);

      // Extract unique tags from backlogs
      const tagSet = new Set<string>();
      data.backlogs?.forEach((backlog: BacklogWithLinks) => {
        if (backlog.tags) {
          backlog.tags.split(",").forEach((tag) => {
            const trimmed = tag.trim();
            if (trimmed) tagSet.add(trimmed);
          });
        }
      });
      setAvailableTags(Array.from(tagSet).sort());
    } catch (error) {
      console.error("Error fetching backlogs:", error);
      setBacklogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AppLayout userName={session.user?.name} userEmail={session.user?.email}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">백로그 관리</h1>
            <p className="text-gray-600 mt-2">
              고객 문제를 체계적으로 수집하고 관리하세요
            </p>
          </div>
          <div className="flex gap-3">
            <AiExtractDialog onSuccess={fetchBacklogs} />
            <BacklogFormDialog
              trigger={
                <Button size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  새 백로그 추가
                </Button>
              }
              onSuccess={fetchBacklogs}
            />
          </div>
        </div>

        <BacklogFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          tagFilter={tagFilter}
          onTagChange={setTagFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          availableTags={availableTags}
        />

        <div className="mt-8">
          <BacklogList
            backlogs={backlogs}
            searchQuery={searchQuery}
            priorityFilter={priorityFilter}
            statusFilter={statusFilter}
            tagFilter={tagFilter}
            sortBy={sortBy}
          />
        </div>
      </div>
    </AppLayout>
  );
}
