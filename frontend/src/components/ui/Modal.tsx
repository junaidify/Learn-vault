import { useEffect, useRef, type ReactNode } from 'react';

/* =========================================
   Generic Modal Component
   ========================================= */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Width class — defaults to max-w-sm */
  maxWidth?: string;
}

export default function Modal({ open, onClose, children, maxWidth = 'max-w-sm' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      style={{ animation: 'fade-in 0.2s ease both' }}
    >
      <div
        className={`animate-slide-up w-full rounded-2xl p-6 ${maxWidth}`}
        style={{ background: 'var(--color-surface-0)' }}
      >
        {children}
      </div>
    </div>
  );
}
