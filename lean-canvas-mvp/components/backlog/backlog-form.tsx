"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "./tag-input";
import { BacklogPriority, BacklogSource, BacklogStatus, type Backlog } from "@/types";

interface BacklogFormProps {
  backlog?: Backlog;
  onSubmit: (data: BacklogFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface BacklogFormData {
  title: string;
  description: string;
  source: string;
  priority: string;
  status: string;
  tags: string;
}

export function BacklogForm({ backlog, onSubmit, onCancel, isSubmitting }: BacklogFormProps) {
  const [formData, setFormData] = useState<BacklogFormData>({
    title: backlog?.title || "",
    description: backlog?.description || "",
    source: backlog?.source || BacklogSource.Other,
    priority: backlog?.priority || BacklogPriority.Medium,
    status: backlog?.status || BacklogStatus.New,
    tags: backlog?.tags || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BacklogFormData, string>>>({});
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([]);

  // Fetch popular tags
  useEffect(() => {
    async function fetchPopularTags() {
      try {
        const response = await fetch("/api/backlog/tags");
        if (response.ok) {
          const data = await response.json();
          setPopularTags(data.tags || []);
        }
      } catch (error) {
        console.error("Failed to fetch popular tags:", error);
      }
    }
    fetchPopularTags();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BacklogFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "제목은 필수입니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">
          제목 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="고객 문제를 간단히 설명하세요"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="문제에 대한 상세한 설명을 작성하세요"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">출처</Label>
          <Select
            value={formData.source}
            onValueChange={(value) => setFormData({ ...formData, source: value })}
          >
            <SelectTrigger id="source">
              <SelectValue placeholder="출처를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={BacklogSource.Meeting}>Meeting</SelectItem>
              <SelectItem value={BacklogSource.Interview}>Interview</SelectItem>
              <SelectItem value={BacklogSource.Survey}>Survey</SelectItem>
              <SelectItem value={BacklogSource.Research}>Research</SelectItem>
              <SelectItem value={BacklogSource.Other}>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">우선순위</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="우선순위 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={BacklogPriority.High}>High</SelectItem>
              <SelectItem value={BacklogPriority.Medium}>Medium</SelectItem>
              <SelectItem value={BacklogPriority.Low}>Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">상태</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={BacklogStatus.New}>New</SelectItem>
            <SelectItem value={BacklogStatus.Validated}>Validated</SelectItem>
            <SelectItem value={BacklogStatus.InCanvas}>In Canvas</SelectItem>
            <SelectItem value={BacklogStatus.Rejected}>Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">태그</Label>
        <TagInput
          value={formData.tags}
          onChange={(tags) => setFormData({ ...formData, tags })}
          placeholder="태그를 입력하세요..."
          popularTags={popularTags}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : backlog ? "수정" : "추가"}
        </Button>
      </div>
    </form>
  );
}
