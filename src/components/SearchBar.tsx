"use client";

import { useState, useEffect, useRef } from "react";
import { FiSearch, FiX, FiFolder } from "react-icons/fi";
import { FileItem, FolderItem } from "@/types";
import { useFiles } from "@/hooks/useFiles";
import { formatFileSize, getFileIcon } from "@/lib/utils";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    files: FileItem[];
    folders: FolderItem[];
  }>({ files: [], folders: [] });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { navigateToFolder } = useFiles();
  const visibleResults =
    query.length >= 2 ? results : { files: [], folders: [] };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setShowResults(true);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div ref={ref} className="relative flex-1 max-w-xl">
      <div className="relative">
        <FiSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search files and folders..."
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            if (value.length < 2) setShowResults(false);
          }}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-xl border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 transition text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {showResults && (visibleResults.files.length > 0 || visibleResults.folders.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {visibleResults.folders.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-400 px-3 py-1 font-medium">
                FOLDERS
              </div>
              {visibleResults.folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    navigateToFolder(folder.id);
                    setShowResults(false);
                    setQuery("");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                >
                  <FiFolder size={18} className="text-yellow-500" />
                  <span className="text-sm">{folder.name}</span>
                </button>
              ))}
            </div>
          )}

          {visibleResults.files.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs text-gray-400 px-3 py-1 font-medium">
                FILES
              </div>
              {visibleResults.files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    window.open(`/api/files/${file.id}/download`, "_blank");
                    setShowResults(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                >
                  <span className="text-lg">
                    {getFileIcon(file.mimeType)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{file.name}</div>
                    <div className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {showResults && loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border p-4 text-center text-sm text-gray-400 z-50">
          Searching...
        </div>
      )}
    </div>
  );
}
