"use client";

import { useQuery } from "@tanstack/react-query";
import { IconStar } from "@tabler/icons-react";
import { orpc } from "@/orpc/client";
import { FileList } from "@/components/files/file-list";
import { FilesPageSkeleton } from "@/components/skeletons/files-skeleton";

const StarredPage = () => {
  const { data: files, isLoading } = useQuery(
    orpc.files.list.queryOptions({ input: { starred: true } })
  );

  if (isLoading) {
    return <FilesPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <IconStar className="h-6 w-6 text-yellow-500" />
        <h1 className="text-2xl font-bold">Starred</h1>
      </div>

      <FileList
        folders={[]}
        files={files ?? []}
        onFolderClick={() => {}}
        emptyTitle="No starred files"
        emptyDescription="Star files to quickly access them here"
      />
    </div>
  );
};

export default StarredPage;
