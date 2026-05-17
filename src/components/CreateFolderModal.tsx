"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useFiles } from "@/hooks/useFiles";
import { useActionLoading } from "@/hooks/useActionLoading";
import { FOLDER_COLORS } from "@/lib/constants";
import { FiLoader, FiX } from "react-icons/fi";

export default function CreateFolderModal() {
  const { showCreateFolder, setShowCreateFolder } = useAppStore();
  const { createFolder } = useFiles();
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[0]);

  const { loading: isCreating, run: handleSubmit } = useActionLoading(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createFolder(name.trim(), color);
    setName("");
    setColor(FOLDER_COLORS[0]);
    setShowCreateFolder(false);
  });

  const closeModal = () => {
    if (!isCreating) setShowCreateFolder(false);
  };

  if (!showCreateFolder) return null;

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
          <h2 className="text-lg font-semibold">Create New Folder</h2>
          <button
            onClick={closeModal}
            disabled={isCreating}
            className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isCreating}
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 text-sm disabled:cursor-not-allowed disabled:bg-gray-50"
          />

          <div className="mb-6">
            <label className="text-sm text-gray-500 mb-2 block">Color</label>
            <div className="flex gap-2">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  disabled={isCreating}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? "scale-125 ring-2 ring-offset-2 ring-gray-400" : ""
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={isCreating}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isCreating}
              aria-busy={isCreating}
              className="inline-flex min-w-24 items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isCreating && <FiLoader size={16} className="animate-spin" />}
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
