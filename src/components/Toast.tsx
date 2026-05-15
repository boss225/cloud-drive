"use client";

import { useAppStore } from "@/store/useAppStore";
import { FiX, FiCheck, FiAlertCircle, FiInfo } from "react-icons/fi";

export default function Toast() {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white min-w-[300px] animate-slide-in ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
                ? "bg-red-600"
                : "bg-blue-600"
          }`}
        >
          {toast.type === "success" && <FiCheck size={18} />}
          {toast.type === "error" && <FiAlertCircle size={18} />}
          {toast.type === "info" && <FiInfo size={18} />}
          <span className="flex-1 text-sm">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100">
            <FiX size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}