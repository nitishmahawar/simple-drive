"use client";

import { useState } from "react";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/orpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FolderActionsMenuProps {
  folderId: string;
  folderName: string;
}

export const FolderActionsMenu = ({
  folderId,
  folderName,
}: FolderActionsMenuProps) => {
  const queryClient = useQueryClient();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newName, setNewName] = useState(folderName);

  const renameMutation = useMutation(
    orpc.folders.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.folders.list.key() });
        toast.success("Folder renamed");
        setRenameDialogOpen(false);
      },
      onError: () => {
        toast.error("Failed to rename folder");
      },
    })
  );

  const deleteMutation = useMutation(
    orpc.folders.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.folders.list.key() });
        queryClient.invalidateQueries({ queryKey: orpc.files.list.key() });
        queryClient.invalidateQueries({
          queryKey: orpc.storage.getUsage.key(),
        });
        toast.success("Folder deleted");
        setDeleteDialogOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete folder");
      },
    })
  );

  const handleRename = () => {
    if (newName.trim() && newName !== folderName) {
      renameMutation.mutate({ id: folderId, name: newName.trim() });
    } else {
      setRenameDialogOpen(false);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: folderId });
  };

  const handleOpenRename = () => {
    setNewName(folderName);
    setRenameDialogOpen(true);
  };

  return (
    <>
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
          className="w-[180px]"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem onClick={handleOpenRename}>
            <IconPencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            variant="destructive"
          >
            <IconTrash />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              Enter a new name for this folder.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Folder name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRename}
              disabled={renameMutation.isPending || !newName.trim()}
            >
              {renameMutation.isPending ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{folderName}&quot;? This
              will permanently delete all files inside the folder. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
