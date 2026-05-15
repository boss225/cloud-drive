"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useFiles } from "@/hooks/useFiles";
import { FiX } from "react-icons/fi";

export default function RenameModal() {
  const { showRename, setShowRename } = useAppStore();
  const { renameFile, renameFolder } = useFiles();
  const [name, setName] = useState("");

  useEffect(() => {
    if (showRename) {
      setName(showRename.item.name);
    }
  }, [showRename]);

  if (!showRename) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (showRename.type === "file") {
      await renameFile(showRename.item.id, name.trim());
    } else {
      await renameFolder(showRename.item.id, name.trim());
    }
    setShowRename(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => setShowRename(null)}
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
            onClick={() => setShowRename(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6 text-sm"
          />

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowRename(null)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}