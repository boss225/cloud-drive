"use client";

import { useAppStore } from "@/store/useAppStore";

export function useToast() {
  const { addToast, removeToast, toasts } = useAppStore();
  return { addToast, removeToast, toasts };
}