"use client";

import { useEffect, useState } from "react";
import AdminTable, { Column } from "@/components/admin/AdminTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import AdminFormField from "@/components/admin/AdminFormField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { AdminOrder } from "@/lib/types";

const COLUMNS: Column<AdminOrder>[] = [
  { key: "id", label: "ID" },
  { key: "userId", label: "User ID" },
  { key: "gamesId", label: "Game ID" },
  {
    key: "key",
    label: "Key",
    render: (row) => (
      <span className="font-mono text-xs text-[var(--on-surface-variant)]">
        {row.key || "—"}
      </span>
    ),
  },
  { key: "status", label: "Status", render: (row) => row.status ?? "—" },
  {
    key: "createdAt",
    label: "Created",
    render: (row) =>
      row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—",
  },
];

const EMPTY_FORM = { userId: "", gamesId: "", key: "" };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminOrder | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/orders/${deleteTarget.id}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(form.userId),
          gamesId: Number(form.gamesId),
          key: form.key,
        }),
      });
      if (!res.ok) throw new Error();
      setShowCreate(false);
      setForm(EMPTY_FORM);
      loadOrders();
    } catch {
      setError("Failed to create order.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          New Order
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-[var(--error-container)] text-[var(--on-error-container)] text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}>
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-[var(--on-surface-variant)]">Loading…</div>
      ) : (
        <AdminTable
          columns={COLUMNS}
          rows={orders}
          editHref={(row) => `/admin/orders/${row.id}`}
          onDelete={(row) => setDeleteTarget(row)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title={`Delete order #${deleteTarget?.id}?`}
        description="This will permanently remove the order record."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          />
          <div className="relative z-10 w-full max-w-md mx-4 bg-[var(--surface-container-high)] border border-[var(--outline-variant)] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Create Order</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <AdminFormField
                label="User ID"
                id="userId"
                type="number"
                required
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
              />
              <AdminFormField
                label="Game ID"
                id="gamesId"
                type="number"
                required
                value={form.gamesId}
                onChange={(e) => setForm({ ...form, gamesId: e.target.value })}
              />
              <AdminFormField
                label="Key"
                id="key"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
              />
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--surface-container-highest)] text-[var(--on-surface)] hover:bg-[var(--surface-bright)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
