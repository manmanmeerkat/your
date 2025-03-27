"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function Toast({
  message,
  type = "info",
  onClose,
  autoClose = true,
  duration = 3000,
}: ToastProps) {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center rounded-md p-4 shadow-md",
        type === "success" &&
          "bg-green-100 border-l-4 border-green-500 text-green-700",
        type === "error" && "bg-red-100 border-l-4 border-red-500 text-red-700",
        type === "info" &&
          "bg-blue-100 border-l-4 border-blue-500 text-blue-700"
      )}
    >
      <p>{message}</p>
      <button
        onClick={handleClose}
        className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </div>
  );
}

// シンプルなコンテキストベースのトースト実装
const ToastContext = React.createContext<{
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  hideToast: () => void;
  toastData: { message: string; type: "success" | "error" | "info" } | null;
}>({
  showToast: () => {},
  hideToast: () => {},
  toastData: null,
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastData, setToastData] = React.useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = React.useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setToastData({ message, type });
    },
    []
  );

  const hideToast = React.useCallback(() => {
    setToastData(null);
  }, []);

  const value = React.useMemo(
    () => ({
      showToast,
      hideToast,
      toastData,
    }),
    [showToast, hideToast, toastData]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toastData && (
        <Toast
          message={toastData.message}
          type={toastData.type}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}
