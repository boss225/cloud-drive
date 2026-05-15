"use client";

import { useAppStore } from "@/store/useAppStore";
import { FiCheck, FiAlertCircle, FiLoader, FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import { useState } from "react";

export default function UploadProgress() {
  const { uploadQueue, removeUpload } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(true);

  if (uploadQueue.length === 0) return null;

  const completedCount = uploadQueue.filter((u) => u.status === "done").length;
  const totalCount = uploadQueue.length;
  const isUploading = uploadQueue.some((u) => u.status === "uploading" || u.status === "pending");

  const handleClearCompleted = () => {
    uploadQueue.forEach((u) => {
      if (u.status === "done" || u.status === "error") {
        removeUpload(u.id);
      }
    });
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-40 transition-all duration-300 ease-in-out">
      <div 
        className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {isUploading ? "Uploading..." : "Uploads completed"}
          </span>
          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isExpanded ? <FiChevronDown size={18} /> : <FiChevronUp size={18} />}
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="max-h-80 overflow-y-auto">
            {uploadQueue.map((upload) => (
              <div key={upload.id} className="px-4 py-3 border-b border-gray-100 last:border-0 group">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {upload.status === "done" && (
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <FiCheck size={12} className="text-green-600" />
                      </div>
                    )}
                    {upload.status === "error" && (
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                        <FiAlertCircle size={12} className="text-red-600" />
                      </div>
                    )}
                    {(upload.status === "uploading" || upload.status === "pending") && (
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <FiLoader size={12} className="text-blue-600 animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-700 truncate" title={upload.file.name}>
                        {upload.file.name}
                      </p>
                      {upload.status !== "uploading" && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeUpload(upload.id);
                          }}
                          className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX size={14} />
                        </button>
                      )}
                    </div>
                    
                    {upload.status === "uploading" && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                           <span className="text-[10px] text-gray-500">{upload.progress}%</span>
                        </div>
                      </div>
                    )}
                    
                    {upload.status === "error" && (
                      <p className="text-xs text-red-500 mt-1 truncate">{upload.error || "Failed to upload"}</p>
                    )}
                    
                    {upload.status === "done" && (
                      <p className="text-xs text-green-600 mt-1">Uploaded successfully</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {(completedCount > 0 || uploadQueue.some(u => u.status === "error")) && !isUploading && (
            <div className="px-4 py-2 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={handleClearCompleted}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Clear all completed
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}