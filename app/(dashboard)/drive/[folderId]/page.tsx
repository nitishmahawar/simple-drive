"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { IconFolderPlus, IconUpload } from "@tabler/icons-react";
import { orpc } from "@/orpc/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FileList } from "@/components/files/file-list";
import { UploadDialog } from "@/components/files/upload-dialog";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";
import { BreadcrumbNav } from "@/components/folders/breadcrumb-nav";

const FolderPage = () => {
  const router = useRouter();
  const params = useParams();
  const folderId = params.folderId as string;

  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const { data: folder, isLoading: folderLoading } = useQuery(
    orpc.folders.get.queryOptions({ input: { id: folderId } })
  );

  const { data: folders, isLoading: foldersLoading } = useQuery(
    orpc.folders.list.queryOptions({ input: { parentId: folderId } })
  );

  const { data: files, isLoading: filesLoading } = useQuery(
    orpc.files.list.queryOptions({ input: { folderId } })
  );

  const isLoading = folderLoading || foldersLoading || filesLoading;

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

      <FileList
        folders={folders ?? []}
        files={files ?? []}
        onFolderClick={(id) => router.push(`/drive/${id}`)}
        onUploadClick={() => setShowUpload(true)}
      />

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
