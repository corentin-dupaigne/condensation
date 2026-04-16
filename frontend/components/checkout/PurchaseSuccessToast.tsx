"use client";

import { useEffect } from "react";

interface PurchaseSuccessToastProps {
  visible: boolean;
  onDismiss: () => void;
}

export function PurchaseSuccessToast({ visible, onDismiss }: PurchaseSuccessToastProps) {
  useEffect(() => {
    if (!visible) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-[1000] flex items-center gap-3 rounded-xl border border-tertiary/30 bg-tertiary/10 px-5 py-4 shadow-xl backdrop-blur-md animate-fade-in"
    >
      {/* Check icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tertiary/20">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-tertiary" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      {/* Message */}
      <div>
        <p className="font-headline text-sm font-bold text-on-surface">
          Purchase complete!
        </p>
        <p className="text-xs text-on-surface-variant">
          Your keys are below.
        </p>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        aria-label="Dismiss success message"
        onClick={onDismiss}
        className="ml-2 shrink-0 rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
