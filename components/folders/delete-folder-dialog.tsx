"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/orpc/client";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
  folderName: string;
}

export const DeleteFolderDialog = ({
  open,
  onOpenChange,
  folderId,
  folderName,
}: DeleteFolderDialogProps) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    orpc.folders.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.folders.list.key() });
        queryClient.invalidateQueries({ queryKey: orpc.files.list.key() });
        queryClient.invalidateQueries({
          queryKey: orpc.storage.getUsage.key(),
        });
        toast.success("Folder deleted");
        onOpenChange(false);
      },
      onError: () => {
        toast.error("Failed to delete folder");
      },
    })
  );

  const handleDelete = () => {
    deleteMutation.mutate({ id: folderId });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Folder</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{folderName}&quot;? This will
            permanently delete all files inside the folder. This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && <Spinner />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
