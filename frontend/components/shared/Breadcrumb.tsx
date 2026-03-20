"use client";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-2 px-6 py-4 text-xs uppercase tracking-wider">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-on-surface-variant/40">›</span>}
          {item.href ? (
            <a
              href={item.href}
              className="text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-primary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
