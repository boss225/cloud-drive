import { create } from "zustand";
import {
  FileItem,
  FolderItem,
  BreadcrumbItem,
  UploadingFile,
  StorageStats,
  ViewMode,
  SortBy,
  SortOrder,
  SidebarView,
  ContextMenuState,
} from "@/types";

interface AppState {
  // Navigation
  currentFolderId: string | null;
  breadcrumbs: BreadcrumbItem[];
  sidebarView: SidebarView;

  // Data
  files: FileItem[];
  folders: FolderItem[];
  stats: StorageStats | null;

  // UI
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  loading: boolean;

  // Selection
  selectedIds: Set<string>;

  // Upload
  uploadQueue: UploadingFile[];

  // Modals
  showCreateFolder: boolean;
  showRename: { type: "file" | "folder"; item: FileItem | FolderItem } | null;
  previewFile: FileItem | null;

  // Context Menu
  contextMenu: ContextMenuState;

  // Toast
  toasts: Array<{
    id: string;
    message: string;
    type: "success" | "error" | "info";
  }>;

  isSidebarOpen: boolean;

  // Actions
  setCurrentFolder: (id: string | null, breadcrumbs: BreadcrumbItem[]) => void;
  setSidebarView: (view: SidebarView) => void;
  setFiles: (files: FileItem[]) => void;
  setFolders: (folders: FolderItem[]) => void;
  setStats: (stats: StorageStats) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setShowCreateFolder: (show: boolean) => void;
  setShowRename: (
    data: { type: "file" | "folder"; item: FileItem | FolderItem } | null
  ) => void;
  setPreviewFile: (file: FileItem | null) => void;
  setContextMenu: (menu: ContextMenuState) => void;
  addUpload: (upload: UploadingFile) => void;
  updateUpload: (id: string, data: Partial<UploadingFile>) => void;
  removeUpload: (id: string) => void;
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  // Selection actions
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentFolderId: null,
  breadcrumbs: [{ id: null, name: "My Drive" }],
  sidebarView: "files",
  files: [],
  folders: [],
  stats: null,
  viewMode: "grid",
  sortBy: "name",
  sortOrder: "asc",
  searchQuery: "",
  loading: false,
  selectedIds: new Set<string>(),
  uploadQueue: [],
  showCreateFolder: false,
  showRename: null,
  previewFile: null,
  contextMenu: { visible: false, x: 0, y: 0, type: null, item: null },
  toasts: [],
  isSidebarOpen: false,

  setCurrentFolder: (id, breadcrumbs) =>
    set({ currentFolderId: id, breadcrumbs }),
  setSidebarView: (view) => set({ sidebarView: view }),
  setFiles: (files) => set({ files }),
  setFolders: (folders) => set({ folders }),
  setStats: (stats) => set({ stats }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ loading }),
  setShowCreateFolder: (show) => set({ showCreateFolder: show }),
  setShowRename: (data) => set({ showRename: data }),
  setPreviewFile: (file) => set({ previewFile: file }),
  setContextMenu: (menu) => set({ contextMenu: menu }),
  addUpload: (upload) =>
    set((state) => ({ uploadQueue: [...state.uploadQueue, upload] })),
  updateUpload: (id, data) =>
    set((state) => ({
      uploadQueue: state.uploadQueue.map((u) =>
        u.id === id ? { ...u, ...data } : u
      ),
    })),
  removeUpload: (id) =>
    set((state) => ({
      uploadQueue: state.uploadQueue.filter((u) => u.id !== id),
    })),
  addToast: (message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),
  clearSelection: () => set({ selectedIds: new Set<string>() }),
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
}));