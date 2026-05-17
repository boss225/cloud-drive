"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useFiles } from "@/hooks/useFiles";
import { useActionLoading } from "@/hooks/useActionLoading";
import { FiLoader, FiX } from "react-icons/fi";
import type { FileItem, FolderItem } from "@/types";

type RenameTarget = { type: "file" | "folder"; item: FileItem | FolderItem };

export default function RenameModal() {
  const { showRename } = useAppStore();

  if (!showRename) return null;

  return (
    <RenameModalContent
      key={`${showRename.type}-${showRename.item.id}`}
      showRename={showRename}
    />
  );
}

function RenameModalContent({ showRename }: { showRename: RenameTarget }) {
  const { setShowRename } = useAppStore();
  const { renameFile, renameFolder } = useFiles();
  const [name, setName] = useState(showRename.item.name);

  const { loading: isRenaming, run: handleSubmit } = useActionLoading(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (showRename.type === "file") {
      await renameFile(showRename.item.id, name.trim());
    } else {
      await renameFolder(showRename.item.id, name.trim());
    }
    setShowRename(null);
  });

  const closeModal = () => {
    if (!isRenaming) setShowRename(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            Rename {showRename.type === "file" ? "File" : "Folder"}
          </h2>
          <button
            onClick={closeModal}
            disabled={isRenaming}
            className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isRenaming}
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6 text-sm disabled:cursor-not-allowed disabled:bg-gray-50"
          />

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={isRenaming}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isRenaming}
              aria-busy={isRenaming}
              className="inline-flex min-w-24 items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isRenaming && <FiLoader size={16} className="animate-spin" />}
              {isRenaming ? "Renaming..." : "Rename"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
