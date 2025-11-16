"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BacklogPriority, BacklogStatus } from "@/types";
import { Search } from "lucide-react";

interface BacklogFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function BacklogFilters({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}: BacklogFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="백로그 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[150px]">
          <Select value={priorityFilter} onValueChange={onPriorityChange}>
            <SelectTrigger>
              <SelectValue placeholder="모든 우선순위" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 우선순위</SelectItem>
              <SelectItem value={BacklogPriority.High}>High</SelectItem>
              <SelectItem value={BacklogPriority.Medium}>Medium</SelectItem>
              <SelectItem value={BacklogPriority.Low}>Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="모든 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value={BacklogStatus.New}>New</SelectItem>
              <SelectItem value={BacklogStatus.Validated}>Validated</SelectItem>
              <SelectItem value={BacklogStatus.InCanvas}>In Canvas</SelectItem>
              <SelectItem value={BacklogStatus.Rejected}>Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="priority">우선순위순</SelectItem>
              <SelectItem value="oldest">오래된 순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
