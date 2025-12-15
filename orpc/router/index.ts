import { filesRouter } from "./files";
import { foldersRouter } from "./folders";
import { storageRouter } from "./storage";

export const router = {
  files: filesRouter,
  folders: foldersRouter,
  storage: storageRouter,
};

export type Router = typeof router;
