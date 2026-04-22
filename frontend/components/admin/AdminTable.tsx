"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface AdminTableProps<T extends { id: number | string }> {
  columns: Column<T>[];
  rows: T[];
  editHref?: (row: T) => string;
  onDelete?: (row: T) => void;
}

export default function AdminTable<T extends { id: number | string }>({
  columns,
  rows,
  editHref,
  onDelete,
}: AdminTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--outline-variant)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] text-left">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 font-semibold whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
            {(editHref || onDelete) && (
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-8 text-center text-[var(--on-surface-variant)]"
              >
                No records found.
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className={`border-t border-[var(--outline-variant)] transition-colors hover:bg-[var(--surface-container-high)] ${
                i % 2 === 0 ? "bg-[var(--surface-container)]" : "bg-[var(--surface-container-low)]"
              }`}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 whitespace-nowrap">
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                </td>
              ))}
              {(editHref || onDelete) && (
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editHref && (
                      <Link
                        href={editHref(row)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--surface-container-highest)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] transition-colors"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--surface-container-highest)] text-[var(--error)] hover:bg-[var(--error)] hover:text-white transition-colors"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
