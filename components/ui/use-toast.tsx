// components/ui/use-toast.tsx (もしまだ存在しない場合)
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({
    title,
    description,
    variant = "default",
  }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant }]);

    // 自動で消える
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}

      {/* トースト表示エリア */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-md shadow-md max-w-sm transform transition-all duration-300 ease-in-out 
              ${
                toast.variant === "destructive"
                  ? "bg-red-100 border-l-4 border-red-600 text-red-900"
                  : "bg-white border-l-4 border-green-600 text-slate-900"
              }`}
          >
            {toast.title && <h3 className="font-medium mb-1">{toast.title}</h3>}
            {toast.description && (
              <p className="text-sm">{toast.description}</p>
            )}
            <button
              onClick={() => dismiss(toast.id)}
              className="absolute top-1 right-1 text-slate-500 hover:text-slate-700"
              aria-label="閉じる"
            >
              <span className="text-xs">✕</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
