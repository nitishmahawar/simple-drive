"use client";

import { IconFolderOpen, IconUpload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { FileCard } from "./file-card";
import { FileListRow } from "./file-list-row";
import { FolderCard } from "../folders/folder-card";
import { FolderListRow } from "../folders/folder-list-row";
import type { ViewMode } from "./file-toolbar";

interface File {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  isStarred: boolean;
  createdAt: Date;
}

interface Folder {
  id: string;
  name: string;
  createdAt: Date;
}

interface FileListProps {
  files: File[];
  folders: Folder[];
  onFolderClick: (folderId: string) => void;
  onFileClick?: (fileId: string) => void;
  showTrashActions?: boolean;
  onUploadClick?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  viewMode?: ViewMode;
}

export const FileList = ({
  files,
  folders,
  onFolderClick,
  onFileClick,
  showTrashActions = false,
  onUploadClick,
  emptyTitle = "No files or folders",
  emptyDescription = "Upload files or create folders to get started",
  viewMode = "grid",
}: FileListProps) => {
  if (folders.length === 0 && files.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconFolderOpen />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
        {onUploadClick && (
          <EmptyContent>
            <Button onClick={onUploadClick}>
              <IconUpload />
              Upload Files
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {folders.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              Folders
            </h2>
            <div className="space-y-2">
              {folders.map((folder) => (
                <FolderListRow
                  key={folder.id}
                  folder={folder}
                  onClick={() => onFolderClick(folder.id)}
                />
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              Files
            </h2>
            <div className="space-y-2">
              {files.map((file) => (
                <FileListRow
                  key={file.id}
                  file={file}
                  onClick={() => onFileClick?.(file.id)}
                  showTrashActions={showTrashActions}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {folders.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Folders
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onClick={() => onFolderClick(folder.id)}
              />
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Files
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onClick={() => onFileClick?.(file.id)}
                showTrashActions={showTrashActions}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
