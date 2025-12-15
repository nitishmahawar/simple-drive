"use client";

import { useState } from "react";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RenameFolderDialog } from "./rename-folder-dialog";
import { DeleteFolderDialog } from "./delete-folder-dialog";

interface FolderActionsMenuProps {
  folderId: string;
  folderName: string;
}

export const FolderActionsMenu = ({
  folderId,
  folderName,
}: FolderActionsMenuProps) => {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
          <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
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

      <RenameFolderDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        folderId={folderId}
        currentName={folderName}
      />

      <DeleteFolderDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        folderId={folderId}
        folderName={folderName}
      />
    </>
  );
};
