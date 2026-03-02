"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type SnackbarVariant = "success" | "error" | "info";

interface SnackbarOptions {
  variant?: SnackbarVariant;
  autoClose?: boolean;
  duration?: number;
}

interface SnackbarItem extends Required<SnackbarOptions> {
  id: string;
  message: ReactNode;
}

interface SnackbarContextValue {
  enqueueSnackbar: (message: ReactNode, options?: SnackbarOptions) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

function getVariantClasses(variant: SnackbarVariant) {
  if (variant === "success") {
    return "border-green-300 bg-green-50 text-green-800";
  }
  if (variant === "error") {
    return "border-red-300 bg-red-50 text-red-800";
  }
  return "border-blue-300 bg-blue-50 text-blue-800";
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([]);

  const removeSnackbar = useCallback((id: string) => {
    setSnackbars((current) => current.filter((item) => item.id !== id));
  }, []);

  const enqueueSnackbar = useCallback(
    (message: ReactNode, options: SnackbarOptions = {}) => {
      const id = crypto.randomUUID();
      const item: SnackbarItem = {
        id,
        message,
        variant: options.variant ?? "info",
        autoClose: options.autoClose ?? true,
        duration: options.duration ?? 5000,
      };

      setSnackbars((current) => [...current, item]);

      if (item.autoClose) {
        window.setTimeout(() => removeSnackbar(id), item.duration);
      }
    },
    [removeSnackbar],
  );

  const contextValue = useMemo(
    () => ({ enqueueSnackbar }),
    [enqueueSnackbar],
  );

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(92vw,420px)] flex-col gap-2">
        {snackbars.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-md border p-3 shadow-md ${getVariantClasses(item.variant)}`}
          >
            <div className="text-sm">{item.message}</div>
            <button
              type="button"
              className="rounded px-2 py-0.5 text-xs font-semibold hover:bg-black/10"
              onClick={() => removeSnackbar(item.id)}
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within SnackbarProvider.");
  }
  return context;
}
