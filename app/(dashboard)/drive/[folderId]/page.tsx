"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { IconFolderPlus, IconUpload } from "@tabler/icons-react";
import { orpc } from "@/orpc/client";
import { Button } from "@/components/ui/button";
import { FileList } from "@/components/files/file-list";
import { ContentSkeleton } from "@/components/skeletons/content-skeleton";
import {
  FileToolbar,
  type SortBy,
  type SortOrder,
  type FileType,
  type ViewMode,
} from "@/components/files/file-toolbar";
import { UploadDialog } from "@/components/files/upload-dialog";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";
import { BreadcrumbNav } from "@/components/folders/breadcrumb-nav";

const FolderPage = () => {
  const router = useRouter();
  const params = useParams();
  const folderId = params.folderId as string;

  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  // Toolbar state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [fileType, setFileType] = useState<FileType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Reset search when changing folders
  useEffect(() => {
    setSearch("");
  }, [folderId]);

  const { data: folder, isLoading: folderLoading } = useQuery(
    orpc.folders.get.queryOptions({ input: { id: folderId } })
  );

  const { data: folders, isLoading: foldersLoading } = useQuery(
    orpc.folders.list.queryOptions({
      input: {
        parentId: folderId,
        search: search || undefined,
        sortBy: sortBy === "size" ? "name" : sortBy,
        sortOrder,
      },
    })
  );

  const { data: files, isLoading: filesLoading } = useQuery(
    orpc.files.list.queryOptions({
      input: {
        folderId,
        search: search || undefined,
        fileType: fileType !== "all" ? fileType : undefined,
        sortBy,
        sortOrder,
      },
    })
  );

  const isLoading = folderLoading || foldersLoading || filesLoading;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <BreadcrumbNav path={folder?.path ?? []} />
          <h1 className="text-2xl font-bold">{folder?.name}</h1>
        </div>
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

      {isLoading ? (
        <ContentSkeleton />
      ) : (
        <FileList
          folders={folders ?? []}
          files={files ?? []}
          onFolderClick={(id) => router.push(`/drive/${id}`)}
          onUploadClick={() => setShowUpload(true)}
          viewMode={viewMode}
        />
      )}

      <CreateFolderDialog
        parentId={folderId}
        open={showCreateFolder}
        onOpenChange={setShowCreateFolder}
      />

      <UploadDialog
        folderId={folderId}
        open={showUpload}
        onOpenChange={setShowUpload}
      />
    </div>
  );
};

export default FolderPage;
