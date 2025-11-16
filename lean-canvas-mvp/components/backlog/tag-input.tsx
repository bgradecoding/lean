"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTagColor } from "@/lib/tag-utils";

interface TagInputProps {
  value: string;
  onChange: (tags: string) => void;
  placeholder?: string;
  popularTags?: Array<{ tag: string; count: number }>;
}

export function TagInput({
  value,
  onChange,
  placeholder = "태그를 입력하세요...",
  popularTags = [],
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Initialize tags from value prop
  useEffect(() => {
    if (value) {
      const parsedTags = value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      setTags(parsedTags);
    } else {
      setTags([]);
    }
  }, [value]);

  // Update suggestions when input changes
  useEffect(() => {
    if (inputValue.trim().length > 0) {
      const filtered = popularTags
        .filter(
          ({ tag }) =>
            tag.toLowerCase().includes(inputValue.toLowerCase()) &&
            !tags.includes(tag)
        )
        .map(({ tag }) => tag)
        .slice(0, 5);

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, popularTags, tags]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      onChange(newTags.join(", "));
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    onChange(newTags.join(", "));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-background min-h-[42px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className={cn("gap-1 pr-1.5", getTagColor(tag))}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
            >
              <span>{suggestion}</span>
              <Badge variant="outline" className="text-xs">
                {popularTags.find((t) => t.tag === suggestion)?.count || 0}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* Popular tags */}
      {popularTags.length > 0 && tags.length === 0 && !inputValue && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">인기 태그:</p>
          <div className="flex flex-wrap gap-1">
            {popularTags.slice(0, 8).map(({ tag, count }) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                {tag} ({count})
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Enter 또는 쉼표(,)로 태그를 추가할 수 있습니다
      </p>
    </div>
  );
}
