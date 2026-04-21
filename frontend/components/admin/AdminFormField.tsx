interface AdminFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

export default function AdminFormField({
  label,
  id,
  error,
  className = "",
  ...inputProps
}: AdminFormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-[var(--on-surface-variant)]"
      >
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-3 py-2.5 rounded-lg bg-[var(--surface-container-highest)] border ${
          error
            ? "border-[var(--error)] focus:ring-[var(--error)]"
            : "border-[var(--outline-variant)] focus:border-[var(--primary)]"
        } text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] text-sm outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors ${className}`}
        {...inputProps}
      />
      {error && <p className="text-xs text-[var(--error)]">{error}</p>}
    </div>
  );
}
