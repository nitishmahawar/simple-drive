"use client";

import { useState, useEffect } from "react";
import {
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconLayoutGrid,
  IconLayoutList,
  IconFilter,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type SortBy = "name" | "size" | "createdAt" | "updatedAt";
export type SortOrder = "asc" | "desc";
export type FileType =
  | "all"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "archive"
  | "other";
export type ViewMode = "grid" | "list";

interface FileToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  sortBy: SortBy;
  onSortByChange: (sortBy: SortBy) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (sortOrder: SortOrder) => void;
  fileType: FileType;
  onFileTypeChange: (fileType: FileType) => void;
  viewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
  showFileTypeFilter?: boolean;
}

export const FileToolbar = ({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  fileType,
  onFileTypeChange,
  viewMode,
  onViewModeChange,
  showFileTypeFilter = true,
}: FileToolbarProps) => {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Sync local search with prop
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const toggleSortOrder = () => {
    onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search files and folders..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {localSearch && (
          <button
            onClick={() => {
              setLocalSearch("");
              onSearchChange("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <IconX className="size-4" />
          </button>
        )}
      </div>

      {/* Filters and View */}
      <div className="flex items-center gap-2">
        {/* File Type Filter */}
        {showFileTypeFilter && (
          <Select
            value={fileType}
            onValueChange={(v) => onFileTypeChange(v as FileType)}
          >
            <SelectTrigger className="w-[130px]">
              <IconFilter className="size-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="archive">Archives</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Sort By */}
        <Select
          value={sortBy}
          onValueChange={(v) => onSortByChange(v as SortBy)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="size">Size</SelectItem>
            <SelectItem value="createdAt">Date created</SelectItem>
            <SelectItem value="updatedAt">Date modified</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSortOrder}
          title={sortOrder === "asc" ? "Ascending" : "Descending"}
        >
          {sortOrder === "asc" ? (
            <IconSortAscending className="size-4" />
          ) : (
            <IconSortDescending className="size-4" />
          )}
        </Button>

        {/* View Mode Toggle */}
        <Tabs
          value={viewMode}
          onValueChange={(v) => onViewModeChange(v as ViewMode)}
        >
          <TabsList className="h-9 p-0.5">
            <TabsTrigger value="grid" className="h-8 w-8 p-0" title="Grid view">
              <IconLayoutGrid className="size-4" />
            </TabsTrigger>
            <TabsTrigger value="list" className="h-8 w-8 p-0" title="List view">
              <IconLayoutList className="size-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
