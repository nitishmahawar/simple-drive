"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { IconFolderPlus, IconUpload } from "@tabler/icons-react";
import { orpc } from "@/orpc/client";
import { Button } from "@/components/ui/button";
import { FileList } from "@/components/files/file-list";
import { UploadDialog } from "@/components/files/upload-dialog";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";
import { DrivePageSkeleton } from "@/components/skeletons/drive-skeleton";

const DrivePage = () => {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const { data: folders, isLoading: foldersLoading } = useQuery(
    orpc.folders.list.queryOptions({ input: { parentId: null } })
  );

  const { data: files, isLoading: filesLoading } = useQuery(
    orpc.files.list.queryOptions({ input: { folderId: null } })
  );

  const isLoading = foldersLoading || filesLoading;

  if (isLoading) {
    return <DrivePageSkeleton />;
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

      <FileList
        folders={folders ?? []}
        files={files ?? []}
        onFolderClick={(folderId) => router.push(`/drive/${folderId}`)}
        onUploadClick={() => setShowUpload(true)}
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
