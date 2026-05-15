"use client";

import { useAppStore } from "@/store/useAppStore";
import { useFiles } from "@/hooks/useFiles";
import { FileItem as FileItemType, FolderItem } from "@/types";
import { formatFileSize, getFileIcon, isPreviewable } from "@/lib/utils";
import { FiStar, FiFolder } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

interface FileCardProps {
  file: FileItemType;
}

export function FileCard({ file }: FileCardProps) {
  const { setContextMenu, setPreviewFile, viewMode, selectedIds, toggleSelect } = useAppStore();
  const { toggleStar } = useFiles();

  const isSelected = selectedIds.has(file.id);
  const hasSelection = selectedIds.size > 0;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: "file",
      item: file,
    });
  };

  const handleClick = () => {
    if (hasSelection) {
      toggleSelect(file.id);
      return;
    }
    if (isPreviewable(file.mimeType)) {
      setPreviewFile(file);
    } else {
      window.open(`/api/files/${file.id}/download`, "_blank");
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelect(file.id);
  };

  if (viewMode === "list") {
    return (
      <div
        className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer group transition ${
          isSelected ? "bg-blue-50 ring-1 ring-blue-300" : "hover:bg-gray-50"
        }`}
        onContextMenu={handleContextMenu}
        onClick={handleClick}
      >
        {/* Checkbox */}
        <div
          className={`flex-shrink-0 transition ${
            isSelected || hasSelection ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={handleCheckboxClick}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
          />
        </div>

        {file.mimeType.startsWith("image/") ? (
          <div className="w-8 h-8 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/files/${file.id}/download`}
              alt={file.name}
              className="w-full h-full object-cover rounded"
            />
          </div>
        ) : (
          <span className="text-2xl flex-shrink-0 flex items-center justify-center w-8">{getFileIcon(file.mimeType)}</span>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{file.name}</div>
        </div>
        <div className="text-xs text-gray-400 hidden sm:block">
          {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
        </div>
        <div className="text-xs text-gray-400 w-20 text-right">
          {formatFileSize(file.size)}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStar(file.id, file.starred);
          }}
          className="opacity-0 group-hover:opacity-100 transition"
        >
          <FiStar
            size={16}
            className={file.starred ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border rounded-2xl p-4 cursor-pointer group transition relative ${
        isSelected
          ? "border-blue-400 ring-2 ring-blue-300 shadow-md"
          : "border-gray-200 hover:shadow-md hover:border-gray-300"
      }`}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      {/* Checkbox */}
      <div
        className={`absolute top-3 left-3 transition z-10 ${
          isSelected || hasSelection ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onClick={handleCheckboxClick}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Star */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleStar(file.id, file.starred);
        }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition"
      >
        <FiStar
          size={16}
          className={
            file.starred ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }
        />
      </button>

      {/* Icon or Thumbnail */}
      {file.mimeType.startsWith("image/") ? (
        <div className="mb-3 flex justify-center h-12 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/files/${file.id}/download`}
            alt={file.name}
            className="h-full w-auto object-contain rounded"
          />
        </div>
      ) : (
        <div className="text-4xl mb-3 text-center">
          {getFileIcon(file.mimeType)}
        </div>
      )}

      {/* Info */}
      <div className="text-sm font-medium truncate text-center">{file.name}</div>
      <div className="text-xs text-gray-400 text-center mt-1">
        {formatFileSize(file.size)}
      </div>
    </div>
  );
}

interface FolderCardProps {
  folder: FolderItem;
}

export function FolderCard({ folder }: FolderCardProps) {
  const { setContextMenu, viewMode, selectedIds, toggleSelect } = useAppStore();
  const { navigateToFolder } = useFiles();

  const isSelected = selectedIds.has(folder.id);
  const hasSelection = selectedIds.size > 0;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: "folder",
      item: folder,
    });
  };

  const handleClick = () => {
    if (hasSelection) {
      toggleSelect(folder.id);
      return;
    }
    navigateToFolder(folder.id, folder.name);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelect(folder.id);
  };

  if (viewMode === "list") {
    return (
      <div
        className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer group transition ${
          isSelected ? "bg-blue-50 ring-1 ring-blue-300" : "hover:bg-gray-50"
        }`}
        onContextMenu={handleContextMenu}
        onClick={handleClick}
      >
        {/* Checkbox */}
        <div
          className={`flex-shrink-0 transition ${
            isSelected || hasSelection ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={handleCheckboxClick}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
          />
        </div>

        <FiFolder size={24} style={{ color: folder.color }} className="fill-current" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{folder.name}</div>
        </div>
        <div className="text-xs text-gray-400">
          {folder._count
            ? `${folder._count.files} files, ${folder._count.children} folders`
            : ""}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border rounded-2xl p-4 cursor-pointer group transition relative ${
        isSelected
          ? "border-blue-400 ring-2 ring-blue-300 shadow-md"
          : "border-gray-200 hover:shadow-md hover:border-gray-300"
      }`}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      {/* Checkbox */}
      <div
        className={`absolute top-3 left-3 transition z-10 ${
          isSelected || hasSelection ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onClick={handleCheckboxClick}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
        />
      </div>

      <div className="mb-3 text-center">
        <FiFolder size={40} style={{ color: folder.color }} className="mx-auto fill-current" />
      </div>
      <div className="text-sm font-medium truncate text-center">{folder.name}</div>
      <div className="text-xs text-gray-400 text-center mt-1">
        {folder._count
          ? `${folder._count.files + folder._count.children} items`
          : ""}
      </div>
    </div>
  );
}