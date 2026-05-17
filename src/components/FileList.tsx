"use client";

import { useAppStore } from "@/store/useAppStore";
import { useFiles } from "@/hooks/useFiles";
import { useActionLoading } from "@/hooks/useActionLoading";
import { FileCard, FolderCard } from "./FileItem";
import { FiGrid, FiList, FiInbox, FiTrash2, FiX, FiCheckSquare, FiRotateCcw, FiLoader } from "react-icons/fi";

export default function FileList() {
  const {
    files,
    folders,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    loading,
    selectedIds,
    clearSelection,
    selectAll,
    sidebarView,
  } = useAppStore();

  const { bulkDelete, restoreFile } = useFiles();

  const isEmpty = files.length === 0 && folders.length === 0;
  const selectionCount = selectedIds.size;
  const hasSelection = selectionCount > 0;

  const allIds = [
    ...folders.map((f) => f.id),
    ...files.map((f) => f.id),
  ];
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));

  const isTrashView = sidebarView === "trash";

  const { loading: isBulkDeleting, run: handleBulkDelete } = useActionLoading(async () => {
    const items: Array<{ id: string; type: "file" | "folder" }> = [
      ...folders
        .filter((f) => selectedIds.has(f.id))
        .map((f) => ({ id: f.id, type: "folder" as const })),
      ...files
        .filter((f) => selectedIds.has(f.id))
        .map((f) => ({ id: f.id, type: "file" as const })),
    ];
    await bulkDelete(items, isTrashView);
  });

  const { loading: isBulkRestoring, run: handleBulkRestore } = useActionLoading(async () => {
    const selectedFiles = files.filter((f) => selectedIds.has(f.id));
    await Promise.all(selectedFiles.map((f) => restoreFile(f.id)));
  });

  const isBulkActionLoading = isBulkDeleting || isBulkRestoring;

  return (
    <div className="flex-1 flex flex-col">
      {/* Bulk Action Bar */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          hasSelection ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-3 bg-blue-600 text-white">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm">
              {selectionCount} item{selectionCount !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => (allSelected ? clearSelection() : selectAll(allIds))}
              disabled={isBulkActionLoading}
              className="flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 rounded-lg px-2.5 py-1 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiCheckSquare size={13} />
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {isTrashView && files.some((f) => selectedIds.has(f.id)) && (
              <button
                onClick={handleBulkRestore}
                disabled={isBulkActionLoading}
                aria-busy={isBulkRestoring}
                className="flex items-center gap-1.5 text-sm bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBulkRestoring ? (
                  <FiLoader size={14} className="animate-spin" />
                ) : (
                  <FiRotateCcw size={14} />
                )}
                {isBulkRestoring ? "Restoring..." : "Restore"}
              </button>
            )}
            <button
              onClick={handleBulkDelete}
              disabled={isBulkActionLoading}
              aria-busy={isBulkDeleting}
              className="flex items-center gap-1.5 text-sm bg-red-500 hover:bg-red-600 rounded-lg px-3 py-1.5 font-medium transition shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBulkDeleting ? (
                <FiLoader size={14} className="animate-spin" />
              ) : (
                <FiTrash2 size={14} />
              )}
              {isBulkDeleting
                ? "Deleting..."
                : isTrashView
                  ? "Delete permanently"
                  : "Delete"}
            </button>
            <button
              onClick={clearSelection}
              disabled={isBulkActionLoading}
              className="flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 rounded-lg px-2.5 py-1.5 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiX size={14} />
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "size" | "date")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
          >
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="date">Date</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50"
          >
            {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition ${
              viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-400"
            }`}
          >
            <FiGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition ${
              viewMode === "list" ? "bg-white shadow-sm" : "text-gray-400"
            }`}
          >
            <FiList size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FiInbox size={64} className="mb-4" />
            <p className="text-lg font-medium">No files here</p>
            <p className="text-sm mt-1">
              Upload files or create a folder to get started
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <>
            {/* Folders Grid */}
            {folders.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Folders
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {folders.map((folder) => (
                    <FolderCard key={folder.id} folder={folder} />
                  ))}
                </div>
              </div>
            )}

            {/* Files Grid */}
            {files.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Files
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {files.map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* List View */
          <div className="space-y-1">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
