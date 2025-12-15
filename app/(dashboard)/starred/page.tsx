"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { IconStar } from "@tabler/icons-react";
import { orpc } from "@/orpc/client";
import { Spinner } from "@/components/ui/spinner";
import { FileList } from "@/components/files/file-list";

const StarredPage = () => {
  const router = useRouter();

  const { data: files, isLoading } = useQuery(
    orpc.files.list.queryOptions({ input: { starred: true } })
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
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
