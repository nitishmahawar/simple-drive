"use client";

import {
  IconFile,
  IconPhoto,
  IconFileText,
  IconVideo,
  IconMusic,
  IconFileZip,
  IconStar,
  IconStarFilled,
  IconDotsVertical,
  IconDownload,
  IconTrash,
  IconRestore,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

interface File {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  isStarred: boolean;
  createdAt: Date;
}

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
  const queryClient = useQueryClient();
  const FileIcon = getFileIcon(file.mimeType);

  const starMutation = useMutation(
    orpc.files.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["files"] });
      },
    })
  );

  const trashMutation = useMutation(
    orpc.files.trash.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["files"] });
      },
    })
  );

  const restoreMutation = useMutation(
    orpc.files.restore.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["files"] });
      },
    })
  );

  const deleteMutation = useMutation(
    orpc.files.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["files"] });
      },
    })
  );

  const downloadMutation = useMutation(
    orpc.storage.getDownloadUrl.mutationOptions({
      onSuccess: (data) => {
        window.open(data.url, "_blank");
      },
    })
  );

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    starMutation.mutate({ id: file.id, isStarred: !file.isStarred });
  };

  const handleTrash = (e: React.MouseEvent) => {
    e.stopPropagation();
    trashMutation.mutate({ id: file.id });
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    restoreMutation.mutate({ id: file.id });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Permanently delete this file?")) {
      deleteMutation.mutate({ id: file.id });
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadMutation.mutate({ fileId: file.id });
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col items-center rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
    >
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!showTrashActions && (
          <>
            <button
              onClick={handleStar}
              className="rounded p-1 hover:bg-muted"
              title={file.isStarred ? "Unstar" : "Star"}
            >
              {file.isStarred ? (
                <IconStarFilled className="h-4 w-4 text-yellow-500" />
              ) : (
                <IconStar className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleDownload}
              className="rounded p-1 hover:bg-muted"
              title="Download"
            >
              <IconDownload className="h-4 w-4" />
            </button>
            <button
              onClick={handleTrash}
              className="rounded p-1 hover:bg-muted"
              title="Move to trash"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </>
        )}
        {showTrashActions && (
          <>
            <button
              onClick={handleRestore}
              className="rounded p-1 hover:bg-muted"
              title="Restore"
            >
              <IconRestore className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded p-1 hover:bg-muted text-destructive"
              title="Delete permanently"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

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
