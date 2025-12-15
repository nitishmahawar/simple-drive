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
  IconPhoto,
  IconVideo,
  IconMusic,
  IconFileText,
  IconFileZip,
  IconApps,
  IconLetterCase,
  IconDatabase,
  IconCalendarPlus,
  IconCalendarTime,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

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

const fileTypeItems = [
  {
    value: "all",
    label: (
      <>
        <IconApps className="text-muted-foreground" />
        <span>All Types</span>
      </>
    ),
  },
  {
    value: "image",
    label: (
      <>
        <IconPhoto className="text-muted-foreground" />
        <span>Images</span>
      </>
    ),
  },
  {
    value: "video",
    label: (
      <>
        <IconVideo className="text-muted-foreground" />
        <span>Videos</span>
      </>
    ),
  },
  {
    value: "audio",
    label: (
      <>
        <IconMusic className="text-muted-foreground" />
        <span>Audio</span>
      </>
    ),
  },
  {
    value: "document",
    label: (
      <>
        <IconFileText className="text-muted-foreground" />
        <span>Documents</span>
      </>
    ),
  },
  {
    value: "archive",
    label: (
      <>
        <IconFileZip className="text-muted-foreground" />
        <span>Archives</span>
      </>
    ),
  },
  {
    value: "other",
    label: (
      <>
        <IconApps className="text-muted-foreground" />
        <span>Other</span>
      </>
    ),
  },
];

const sortItems = [
  {
    value: "name",
    label: (
      <>
        <IconLetterCase className="text-muted-foreground" />
        <span>Name</span>
      </>
    ),
  },
  {
    value: "size",
    label: (
      <>
        <IconDatabase className="text-muted-foreground" />
        <span>Size</span>
      </>
    ),
  },
  {
    value: "createdAt",
    label: (
      <>
        <IconCalendarPlus className="text-muted-foreground" />
        <span>Date created</span>
      </>
    ),
  },
  {
    value: "updatedAt",
    label: (
      <>
        <IconCalendarTime className="text-muted-foreground" />
        <span>Date modified</span>
      </>
    ),
  },
];

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
      <div className="flex-1 max-w-xs">
        <InputGroup>
          <InputGroupAddon>
            <IconSearch className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search files and folders..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setLocalSearch("");
                  onSearchChange("");
                }}
              >
                <IconX className="size-4 text-muted-foreground" />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      {/* Filters and View */}
      <div className="flex items-center gap-2">
        {/* File Type Filter */}
        {showFileTypeFilter && (
          <Select
            value={fileType}
            items={fileTypeItems}
            onValueChange={(v) => onFileTypeChange(v as FileType)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fileTypeItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sort By */}
        <Select
          value={sortBy}
          onValueChange={(v) => onSortByChange(v as SortBy)}
          items={sortItems}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
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
          <TabsList>
            <TabsTrigger value="grid" title="Grid view">
              <IconLayoutGrid className="size-4" />
            </TabsTrigger>
            <TabsTrigger value="list" title="List view">
              <IconLayoutList className="size-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
