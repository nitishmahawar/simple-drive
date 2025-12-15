"use client";

import { useQuery } from "@tanstack/react-query";
import { IconTrash } from "@tabler/icons-react";
import { orpc } from "@/orpc/client";
import { FileList } from "@/components/files/file-list";
import { FilesPageSkeleton } from "@/components/skeletons/files-skeleton";

const TrashPage = () => {
  const { data: files, isLoading } = useQuery(
    orpc.files.list.queryOptions({ input: { trashed: true } })
  );

  if (isLoading) {
    return <FilesPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <IconTrash className="h-6 w-6 text-destructive" />
        <h1 className="text-2xl font-bold">Trash</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Files in trash will be automatically deleted after 30 days
      </p>

      <FileList
        folders={[]}
        files={files ?? []}
        onFolderClick={() => {}}
        showTrashActions
        emptyTitle="Trash is empty"
        emptyDescription="Files you delete will appear here"
      />
    </div>
  );
};

export default TrashPage;
