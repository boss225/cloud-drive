"use client";

import { useState, useRef } from "react";
import { useUpload } from "@/hooks/useUpload";
import { FiUploadCloud } from "react-icons/fi";

export default function UploadZone({ children }: { children: React.ReactNode }) {
  const [dragActive, setDragActive] = useState(false);
  const { uploadFiles } = useUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      className="relative flex-1 flex flex-col"
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {children}

      {/* Upload Button */}
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={(e) => {
          if (e.target.files) uploadFiles(e.target.files);
          e.target.value = "";
        }}
        className="hidden"
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center z-40 hover:scale-110"
        title="Upload files"
      >
        <FiUploadCloud size={24} />
      </button>

      {/* Drag Overlay */}
      {dragActive && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-xl z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <FiUploadCloud size={64} className="mx-auto text-blue-500 mb-4" />
            <p className="text-xl font-semibold text-blue-700">
              Drop files here to upload
            </p>
          </div>
        </div>
      )}
    </div>
  );
}