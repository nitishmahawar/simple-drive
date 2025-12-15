"use client";

import {
  IconStar,
  IconStarFilled,
  IconDotsVertical,
  IconDownload,
  IconTrash,
  IconRestore,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/orpc/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileActionsMenuProps {
  fileId: string;
  fileName: string;
  isStarred: boolean;
  showTrashActions?: boolean;
}

export const FileActionsMenu = ({
  fileId,
  fileName,
  isStarred,
  showTrashActions = false,
}: FileActionsMenuProps) => {
  const queryClient = useQueryClient();

  const starMutation = useMutation(
    orpc.files.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.files.list.key() });
        toast.success(isStarred ? "Removed from starred" : "Added to starred");
      },
      onError: () => {
        toast.error("Failed to update file");
      },
    })
  );

  const trashMutation = useMutation(
    orpc.files.trash.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.files.list.key() });
        toast.success("Moved to trash");
      },
      onError: () => {
        toast.error("Failed to move to trash");
      },
    })
  );

  const restoreMutation = useMutation(
    orpc.files.restore.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.files.list.key() });
        toast.success("File restored");
      },
      onError: () => {
        toast.error("Failed to restore file");
      },
    })
  );

  const deleteMutation = useMutation(
    orpc.files.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.files.list.key() });
        queryClient.invalidateQueries({
          queryKey: orpc.storage.getUsage.key(),
        });
        toast.success("File deleted permanently");
      },
      onError: () => {
        toast.error("Failed to delete file");
      },
    })
  );

  const downloadMutation = useMutation(
    orpc.storage.getDownloadUrl.mutationOptions({
      onSuccess: (data) => {
        window.open(data.url, "_blank");
      },
      onError: () => {
        toast.error("Failed to get download link");
      },
    })
  );

  const handleStar = () => {
    starMutation.mutate({ id: fileId, isStarred: !isStarred });
  };

  const handleTrash = () => {
    trashMutation.mutate({ id: fileId });
  };

  const handleRestore = () => {
    restoreMutation.mutate({ id: fileId });
  };

  const handleDelete = () => {
    if (confirm(`Permanently delete "${fileName}"?`)) {
      deleteMutation.mutate({ id: fileId });
    }
  };

  const handleDownload = () => {
    downloadMutation.mutate({ fileId });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className=""
            onClick={(e) => e.stopPropagation()}
          >
            <IconDotsVertical />
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="w-[200px]"
        onClick={(e) => e.stopPropagation()}
      >
        {!showTrashActions ? (
          <>
            <DropdownMenuItem onClick={handleStar}>
              {isStarred ? (
                <>
                  <IconStarFilled className="text-yellow-500" />
                  Remove from starred
                </>
              ) : (
                <>
                  <IconStar />
                  Add to starred
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload}>
              <IconDownload />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleTrash} variant="destructive">
              <IconTrash />
              Move to trash
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={handleRestore}>
              <IconRestore />
              Restore
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} variant="destructive">
              <IconTrash />
              Delete permanently
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
