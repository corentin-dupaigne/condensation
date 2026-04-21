"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-[var(--surface-container-high)] border border-[var(--outline-variant)] rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors"
        >
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--error-container)] shrink-0">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="w-5 h-5 text-[var(--on-error-container)]"
            />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--on-surface)] mb-1">{title}</h2>
            <p className="text-sm text-[var(--on-surface-variant)]">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--surface-container-highest)] text-[var(--on-surface)] hover:bg-[var(--surface-bright)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--error)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
