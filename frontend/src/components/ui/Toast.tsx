import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

/* =========================================
   Lightweight Toast Notification System
   ========================================= */

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2" style={{ maxWidth: '380px' }}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ---- Individual Toast ---- */

const ICON_MAP: Record<ToastType, { bg: string; color: string; icon: ReactNode }> = {
  success: {
    bg: '#ECFDF5',
    color: 'var(--color-success)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
           strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    bg: '#FEF2F2',
    color: 'var(--color-error)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
           strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  info: {
    bg: 'var(--color-brand-50)',
    color: 'var(--color-brand-600)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
           strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const cfg = ICON_MAP[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration]);

  useEffect(() => {
    if (exiting) {
      const timer = setTimeout(() => onDismiss(toast.id), 250);
      return () => clearTimeout(timer);
    }
  }, [exiting, onDismiss, toast.id]);

  return (
    <div
      className={`flex items-start gap-3 rounded-xl p-4 shadow-lg ${exiting ? 'toast-exit' : 'toast-enter'}`}
      style={{ background: 'var(--color-surface-0)', border: '1px solid var(--color-surface-200)' }}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
           style={{ background: cfg.bg, color: cfg.color }}>
        {cfg.icon}
      </div>
      <p className="flex-1 text-sm font-medium leading-snug" style={{ color: 'var(--color-surface-900)' }}>
        {toast.message}
      </p>
      <button
        onClick={() => setExiting(true)}
        className="shrink-0 cursor-pointer border-none bg-transparent p-0.5"
        style={{ color: 'var(--color-surface-800)', opacity: 0.3 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-xl">
        <div className="toast-progress h-full" style={{ background: cfg.color, animationDuration: `${toast.duration}ms` }} />
      </div>
    </div>
  );
}
