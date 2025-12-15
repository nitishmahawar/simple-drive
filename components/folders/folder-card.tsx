"use client";

import { IconFolder } from "@tabler/icons-react";
import { FolderActionsMenu } from "./folder-actions-menu";

interface Folder {
  id: string;
  name: string;
  createdAt: Date;
}

interface FolderCardProps {
  folder: Folder;
  onClick: () => void;
}

export const FolderCard = ({ folder, onClick }: FolderCardProps) => {
  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col items-center rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
    >
      {/* Dropdown menu trigger */}
      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <FolderActionsMenu folderId={folder.id} folderName={folder.name} />
      </div>

      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
        <IconFolder className="h-6 w-6 text-amber-600 dark:text-amber-400" />
      </div>

      <p className="w-full truncate text-center text-sm font-medium">
        {folder.name}
      </p>
    </div>
  );
};
