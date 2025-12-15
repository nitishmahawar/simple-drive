"use client";

import { useState } from "react";
import {
  IconAlertCircle,
  IconCheck,
  IconFile,
  IconFileText,
  IconFileZip,
  IconMusic,
  IconPhoto,
  IconUpload,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  formatBytes,
  useFileUpload,
  type FileWithPreview,
} from "@/hooks/use-file-upload";
import { orpc } from "@/orpc/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UploadDialogProps {
  folderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadProgress {
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
}

const getFileIcon = (file: { file: File | { type: string; name: string } }) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type;
  const fileName = file.file instanceof File ? file.file.name : file.file.name;

  if (
    fileType.includes("pdf") ||
    fileName.endsWith(".pdf") ||
    fileType.includes("word") ||
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx")
  ) {
    return <IconFileText className="size-4 opacity-60" />;
  }
  if (
    fileType.includes("zip") ||
    fileType.includes("archive") ||
    fileName.endsWith(".zip") ||
    fileName.endsWith(".rar")
  ) {
    return <IconFileZip className="size-4 opacity-60" />;
  }
  if (fileType.includes("video/")) {
    return <IconVideo className="size-4 opacity-60" />;
  }
  if (fileType.includes("audio/")) {
    return <IconMusic className="size-4 opacity-60" />;
  }
  if (fileType.startsWith("image/")) {
    return <IconPhoto className="size-4 opacity-60" />;
  }
  return <IconFile className="size-4 opacity-60" />;
};

const uploadWithProgress = (
  url: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"));
    });

    xhr.open("PUT", url);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    );
    xhr.send(file);
  });
};

export const UploadDialog = ({
  folderId,
  open,
  onOpenChange,
}: UploadDialogProps) => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<
    Record<string, UploadProgress>
  >({});

  const maxSize = 1024 * 1024 * 1024; // 1GB
  const maxFiles = 10;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    multiple: true,
  });

  const getUploadUrlMutation = useMutation(
    orpc.storage.getUploadUrl.mutationOptions({})
  );

  const createFileMutation = useMutation(orpc.files.create.mutationOptions({}));

  const uploadSingleFile = async (fileWithPreview: FileWithPreview) => {
    const file = fileWithPreview.file;
    if (!(file instanceof File)) return;

    try {
      setUploadProgress((prev) => ({
        ...prev,
        [fileWithPreview.id]: { progress: 0, status: "uploading" },
      }));

      // Get presigned upload URL
      const { url, key } = await getUploadUrlMutation.mutateAsync({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      });

      // Upload to R2 with progress tracking
      await uploadWithProgress(url, file, (progress) => {
        setUploadProgress((prev) => ({
          ...prev,
          [fileWithPreview.id]: { progress, status: "uploading" },
        }));
      });

      // Create file record in database
      await createFileMutation.mutateAsync({
        name: file.name,
        folderId,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        storageKey: key,
      });

      setUploadProgress((prev) => ({
        ...prev,
        [fileWithPreview.id]: { progress: 100, status: "done" },
      }));

      return { success: true, name: file.name };
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadProgress((prev) => ({
        ...prev,
        [fileWithPreview.id]: { progress: 0, status: "error" },
      }));
      return { success: false, name: file.name };
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    // Initialize progress for all files
    const initialProgress: Record<string, UploadProgress> = {};
    files.forEach((file) => {
      initialProgress[file.id] = { progress: 0, status: "pending" };
    });
    setUploadProgress(initialProgress);

    const results = await Promise.all(files.map(uploadSingleFile));

    const successful = results.filter((r) => r?.success).length;
    const failed = results.filter((r) => r && !r.success).length;

    if (successful > 0) {
      toast.success(`Uploaded ${successful} file${successful > 1 ? "s" : ""}`);
      queryClient.invalidateQueries({ queryKey: orpc.files.list.key() });
      queryClient.invalidateQueries({ queryKey: orpc.storage.getUsage.key() });
    }

    if (failed > 0) {
      toast.error(`Failed to upload ${failed} file${failed > 1 ? "s" : ""}`);
    }

    setUploading(false);
    setUploadProgress({});
    clearFiles();
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      clearFiles();
      setUploadProgress({});
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Drag and drop files or click to browse. Max {maxFiles} files, up to{" "}
            {formatBytes(maxSize)} each.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Drop area */}
          {!uploading && (
            <div
              className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-input border-dashed p-4 transition-colors hover:bg-accent/50 data-[dragging=true]:bg-accent/50"
              data-dragging={isDragging || undefined}
              onClick={openFileDialog}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              role="button"
              tabIndex={-1}
            >
              <input
                {...getInputProps()}
                aria-label="Upload files"
                className="sr-only"
              />

              <div className="flex flex-col items-center justify-center text-center">
                <div
                  aria-hidden="true"
                  className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                >
                  <IconUpload className="size-4 opacity-60" />
                </div>
                <p className="mb-1.5 font-medium text-sm">Upload files</p>
                <p className="text-muted-foreground text-xs">
                  Drag & drop or click to browse
                </p>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div
              className="flex items-center gap-1 text-destructive text-xs"
              role="alert"
            >
              <IconAlertCircle className="size-3 shrink-0" />
              <span>{errors[0]}</span>
            </div>
          )}

          {/* File list */}
          {files.length > 0 && (
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {files.map((file) => {
                const progress = uploadProgress[file.id];
                const isUploading = progress?.status === "uploading";
                const isDone = progress?.status === "done";
                const isError = progress?.status === "error";

                return (
                  <div
                    className="flex flex-col gap-2 rounded-lg border bg-background p-2 pe-3"
                    key={file.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                          {isDone ? (
                            <IconCheck className="size-4 text-green-500" />
                          ) : isError ? (
                            <IconAlertCircle className="size-4 text-destructive" />
                          ) : (
                            getFileIcon(file)
                          )}
                        </div>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <p className="truncate font-medium text-[13px]">
                            {file.file instanceof File
                              ? file.file.name
                              : file.file.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatBytes(
                              file.file instanceof File
                                ? file.file.size
                                : file.file.size
                            )}
                            {isUploading && (
                              <span className="ml-2 text-primary">
                                {progress.progress}%
                              </span>
                            )}
                            {isDone && (
                              <span className="ml-2 text-green-500">Done</span>
                            )}
                            {isError && (
                              <span className="ml-2 text-destructive">
                                Failed
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {!uploading && (
                        <Button
                          aria-label="Remove file"
                          className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                          size="icon"
                          variant="ghost"
                        >
                          <IconX aria-hidden="true" className="size-4" />
                        </Button>
                      )}
                    </div>

                    {/* Progress bar */}
                    {isUploading && (
                      <Progress value={progress.progress} className="h-1" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
          >
            {uploading
              ? "Uploading..."
              : `Upload ${files.length > 0 ? `(${files.length})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
