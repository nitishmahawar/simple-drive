"use client";

import { useCallback, useState } from "react";
import { IconUpload } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/orpc/client";

interface UploadZoneProps {
  folderId: string | null;
}

export const UploadZone = ({ folderId }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const getUploadUrlMutation = useMutation(
    orpc.storage.getUploadUrl.mutationOptions({})
  );

  const createFileMutation = useMutation(
    orpc.files.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.files.list.key() });
        queryClient.invalidateQueries({
          queryKey: orpc.storage.getUsage.key(),
        });
      },
    })
  );

  const uploadFile = async (file: File) => {
    try {
      setUploading((prev) => [...prev, file.name]);

      // Get presigned upload URL
      const { url, key } = await getUploadUrlMutation.mutateAsync({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      });

      // Upload to R2
      await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      // Create file record in database
      await createFileMutation.mutateAsync({
        name: file.name,
        folderId,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        storageKey: key,
      });

      toast.success(`Uploaded ${file.name}`);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(`Failed to upload ${file.name}`);
    } finally {
      setUploading((prev) => prev.filter((name) => name !== file.name));
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach(uploadFile);
    },
    [folderId]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(uploadFile);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <IconUpload className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="mb-2 text-sm font-medium">
          Drag and drop files here, or{" "}
          <label className="cursor-pointer text-primary hover:underline">
            browse
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </p>
        <p className="text-xs text-muted-foreground">Max file size: 100MB</p>
      </div>

      {uploading.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploading...</p>
          {uploading.map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 rounded bg-muted p-2 text-sm"
            >
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="truncate">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
