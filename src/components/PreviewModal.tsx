"use client";

import { useAppStore } from "@/store/useAppStore";
import { formatFileSize } from "@/lib/utils";
import { FiX, FiDownload } from "react-icons/fi";

export default function PreviewModal() {
  const { previewFile, setPreviewFile } = useAppStore();

  if (!previewFile) return null;

  const downloadUrl = `/api/files/${previewFile.id}/download`;
  const isImage = previewFile.mimeType.startsWith("image/");
  const isVideo = previewFile.mimeType.startsWith("video/");
  const isAudio = previewFile.mimeType.startsWith("audio/");

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={() => setPreviewFile(null)}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="font-semibold truncate">{previewFile.name}</h3>
            <p className="text-sm text-gray-400">
              {formatFileSize(previewFile.size)} •{" "}
              {new Date(previewFile.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={downloadUrl}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              title="Download"
            >
              <FiDownload size={20} />
            </a>
            <button
              onClick={() => setPreviewFile(null)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-50">
          {isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={downloadUrl}
              alt={previewFile.name}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          )}
          {isVideo && (
            <video
              src={downloadUrl}
              controls
              className="max-w-full max-h-[70vh] rounded-lg"
            />
          )}
          {isAudio && (
            <div className="text-center">
              <div className="text-6xl mb-6">🎵</div>
              <audio src={downloadUrl} controls className="max-w-md w-[18rem]" />
            </div>
          )}
          {!isImage && !isVideo && !isAudio && (
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">📄</div>
              <p>Preview not available</p>
              <a
                href={downloadUrl}
                className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}