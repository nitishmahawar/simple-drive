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
import { FileActionsMenu } from "./file-actions-menu";

interface File {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  isStarred: boolean;
  createdAt: Date;
}

interface FileListRowProps {
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

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

export const FileListRow = ({
  file,
  onClick,
  showTrashActions = false,
}: FileListRowProps) => {
  const FileIcon = getFileIcon(file.mimeType);

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-4 rounded-lg border bg-card p-3 transition-all hover:border-primary hover:shadow-sm"
    >
      {/* Icon */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <FileIcon className="size-5 text-primary" />
      </div>

      {/* Name */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <p className="truncate font-medium">{file.name}</p>
        {file.isStarred && !showTrashActions && (
          <IconStarFilled className="size-4 shrink-0 text-yellow-500" />
        )}
      </div>

      {/* Size */}
      <div className="hidden w-24 shrink-0 text-sm text-muted-foreground sm:block">
        {formatBytes(file.size)}
      </div>

      {/* Date */}
      <div className="hidden w-28 shrink-0 text-sm text-muted-foreground md:block">
        {formatDate(file.createdAt)}
      </div>

      {/* Actions */}
      <div className="opacity-0 transition-opacity group-hover:opacity-100">
        <FileActionsMenu
          fileId={file.id}
          fileName={file.name}
          isStarred={file.isStarred}
          showTrashActions={showTrashActions}
        />
      </div>
    </div>
  );
};
