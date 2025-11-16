"use client";

import { useMemo } from "react";
import { BacklogCard } from "./backlog-card";
import { type BacklogWithLinks, BacklogPriority } from "@/types";

interface BacklogListProps {
  backlogs: BacklogWithLinks[];
  searchQuery: string;
  priorityFilter: string;
  statusFilter: string;
  tagFilter: string;
  sortBy: string;
}

export function BacklogList({
  backlogs,
  searchQuery,
  priorityFilter,
  statusFilter,
  tagFilter,
  sortBy,
}: BacklogListProps) {
  const filteredAndSortedBacklogs = useMemo(() => {
    if (!backlogs || backlogs.length === 0) {
      return [];
    }

    let result = [...backlogs];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (backlog) =>
          backlog.title.toLowerCase().includes(query) ||
          backlog.description?.toLowerCase().includes(query) ||
          backlog.tags?.toLowerCase().includes(query)
      );
    }

    // Apply priority filter
    if (priorityFilter && priorityFilter !== "all") {
      result = result.filter((backlog) => backlog.priority === priorityFilter);
    }

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      result = result.filter((backlog) => backlog.status === statusFilter);
    }

    // Apply tag filter
    if (tagFilter && tagFilter !== "all") {
      result = result.filter((backlog) => {
        if (!backlog.tags) return false;
        const tags = backlog.tags.split(",").map((tag) => tag.trim());
        return tags.includes(tagFilter);
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "priority": {
          const priorityOrder = {
            [BacklogPriority.High]: 0,
            [BacklogPriority.Medium]: 1,
            [BacklogPriority.Low]: 2,
          };
          return (
            priorityOrder[a.priority as BacklogPriority] -
            priorityOrder[b.priority as BacklogPriority]
          );
        }
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "latest":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return result;
  }, [backlogs, searchQuery, priorityFilter, statusFilter, tagFilter, sortBy]);

  if (filteredAndSortedBacklogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {searchQuery || priorityFilter !== "all" || statusFilter !== "all" || tagFilter !== "all"
            ? "검색 결과가 없습니다"
            : "백로그가 없습니다. 새 백로그를 추가해보세요!"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredAndSortedBacklogs.map((backlog) => (
        <BacklogCard key={backlog.id} backlog={backlog} />
      ))}
    </div>
  );
}
