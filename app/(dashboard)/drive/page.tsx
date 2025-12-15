"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { IconFolderPlus, IconUpload } from "@tabler/icons-react";
import { orpc } from "@/orpc/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FileList } from "@/components/files/file-list";
import { UploadZone } from "@/components/files/upload-zone";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";

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
          <Button onClick={() => setShowUpload(!showUpload)}>
            <IconUpload />
            Upload
          </Button>
        </div>
      </div>

      {showUpload && <UploadZone folderId={null} />}

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
    </div>
  );
};

export default DrivePage;
