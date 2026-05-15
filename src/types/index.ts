export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  telegramFileId: string;
  telegramMsgId: number;
  folderId: string | null;
  starred: boolean;
  trashedAt: string | null;
  downloads: number;
  totalChunks: number;
  createdAt: string;
  updatedAt: string;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    files: number;
    children: number;
  };
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  totalFolders: number;
  starredFiles: number;
  trashedFiles: number;
}

export type ViewMode = "grid" | "list";
export type SortBy = "name" | "size" | "date";
export type SortOrder = "asc" | "desc";

export type SidebarView = "files" | "starred" | "trash";

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  type: "file" | "folder" | null;
  item: FileItem | FolderItem | null;
}