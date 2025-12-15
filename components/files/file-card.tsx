"use client";

import {
  IconFile,
  IconPhoto,
  IconFileText,
  IconVideo,
  IconMusic,
  IconFileZip,
  IconStarFilled,
} from "@tabler/icons-react";
import { type File } from "@/db/schema";
import { FileActionsMenu } from "./file-actions-menu";

interface FileCardProps {
  file: File;
  onClick?: () => void;
  showTrashActions?: boolean;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return IconPhoto;
  if (mimeType.startsWith("video/")) return IconVideo;
  if (mimeType.startsWith("audio/")) return IconMusic;
  if (mimeType.includes("pdf") || mimeType.includes("document"))
    return IconFileText;
  if (mimeType.includes("zip") || mimeType.includes("archive"))
    return IconFileZip;
  return IconFile;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const FileCard = ({
  file,
  onClick,
  showTrashActions = false,
}: FileCardProps) => {
  const FileIcon = getFileIcon(file.mimeType);

  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col items-center rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
    >
      {/* Dropdown menu trigger */}
      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <FileActionsMenu
          fileId={file.id}
          fileName={file.name}
          isStarred={file.isStarred}
          showTrashActions={showTrashActions}
        />
      </div>

      {/* Star indicator */}
      {file.isStarred && !showTrashActions && (
        <div className="absolute left-2 top-2">
          <IconStarFilled className="size-4 text-yellow-500" />
        </div>
      )}

      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <FileIcon className="h-6 w-6 text-primary" />
      </div>

      <p className="w-full truncate text-center text-sm font-medium">
        {file.name}
      </p>
      <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
    </div>
  );
};
