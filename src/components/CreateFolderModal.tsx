"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useFiles } from "@/hooks/useFiles";
import { FOLDER_COLORS } from "@/lib/constants";
import { FiX } from "react-icons/fi";

export default function CreateFolderModal() {
  const { showCreateFolder, setShowCreateFolder } = useAppStore();
  const { createFolder } = useFiles();
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[0]);

  if (!showCreateFolder) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createFolder(name.trim(), color);
    setName("");
    setColor(FOLDER_COLORS[0]);
    setShowCreateFolder(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => setShowCreateFolder(false)}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Create New Folder</h2>
          <button
            onClick={() => setShowCreateFolder(false)}
            className="text-gray-400 hover:text-gray-600"
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
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 text-sm"
          />

          <div className="mb-6">
            <label className="text-sm text-gray-500 mb-2 block">Color</label>
            <div className="flex gap-2">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? "scale-125 ring-2 ring-offset-2 ring-gray-400" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowCreateFolder(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}