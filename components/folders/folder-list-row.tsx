"use client";

import { IconFolder } from "@tabler/icons-react";
import { type Folder } from "@/db/schema";
import { FolderActionsMenu } from "./folder-actions-menu";

interface FolderListRowProps {
  folder: Folder;
  onClick?: () => void;
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

export const FolderListRow = ({ folder, onClick }: FolderListRowProps) => {
  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-4 rounded-lg border bg-card p-3 transition-all hover:border-primary hover:shadow-sm"
    >
      {/* Icon */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
        <IconFolder className="size-5 text-amber-600 dark:text-amber-400" />
      </div>

      {/* Name */}
      <div className="flex min-w-0 flex-1 items-center">
        <p className="truncate font-medium">{folder.name}</p>
      </div>

      {/* Type placeholder for alignment */}
      <div className="hidden w-24 shrink-0 text-sm text-muted-foreground sm:block">
        —
      </div>

      {/* Date */}
      <div className="hidden w-28 shrink-0 text-sm text-muted-foreground md:block">
        {formatDate(folder.createdAt)}
      </div>

      {/* Actions */}
      <div className="opacity-0 transition-opacity group-hover:opacity-100">
        <FolderActionsMenu folderId={folder.id} folderName={folder.name} />
      </div>
    </div>
  );
};
