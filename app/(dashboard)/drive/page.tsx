"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { IconFolderPlus, IconUpload } from "@tabler/icons-react";
import { orpc } from "@/orpc/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FileList } from "@/components/files/file-list";
import {
  FileToolbar,
  type SortBy,
  type SortOrder,
  type FileType,
  type ViewMode,
} from "@/components/files/file-toolbar";
import { UploadDialog } from "@/components/files/upload-dialog";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";

const DrivePage = () => {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  // Toolbar state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [fileType, setFileType] = useState<FileType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { data: folders, isLoading: foldersLoading } = useQuery(
    orpc.folders.list.queryOptions({
      input: {
        parentId: null,
        search: search || undefined,
        sortBy: sortBy === "size" ? "name" : sortBy,
        sortOrder,
      },
    })
  );

  const { data: files, isLoading: filesLoading } = useQuery(
    orpc.files.list.queryOptions({
      input: {
        folderId: null,
        search: search || undefined,
        fileType: fileType !== "all" ? fileType : undefined,
        sortBy,
        sortOrder,
      },
    })
  );

  const isLoading = foldersLoading || filesLoading;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Drive</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateFolder(true)}>
            <IconFolderPlus />
            New Folder
          </Button>
          <Button onClick={() => setShowUpload(true)}>
            <IconUpload />
            Upload
          </Button>
        </div>
      </div>

      <FileToolbar
        search={search}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        fileType={fileType}
        onFileTypeChange={setFileType}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <FileList
        folders={folders ?? []}
        files={files ?? []}
        onFolderClick={(folderId) => router.push(`/drive/${folderId}`)}
        onUploadClick={() => setShowUpload(true)}
        viewMode={viewMode}
      />

      <CreateFolderDialog
        parentId={null}
        open={showCreateFolder}
        onOpenChange={setShowCreateFolder}
      />

      <UploadDialog
        folderId={null}
        open={showUpload}
        onOpenChange={setShowUpload}
      />
    </div>
  );
};

export default DrivePage;
