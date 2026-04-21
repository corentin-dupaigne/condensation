"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminTable, { Column } from "@/components/admin/AdminTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import AdminFormField from "@/components/admin/AdminFormField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { AdminUser } from "@/lib/types";

const COLUMNS: Column<AdminUser>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  {
    key: "createdAt",
    label: "Created",
    render: (row) =>
      row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—",
  },
];

const EMPTY_FORM = { name: "", email: "", role: "user", password: "" };

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create");
      setShowCreate(false);
      setForm(EMPTY_FORM);
      loadUsers();
    } catch {
      setError("Failed to create user.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          New User
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
          rows={users}
          editHref={(row) => `/admin/users/${row.id}`}
          onDelete={(row) => setDeleteTarget(row)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title={`Delete user "${deleteTarget?.name}"?`}
        description="This will permanently remove the user and all their data."
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
              <h2 className="text-base font-semibold">Create User</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <AdminFormField
                label="Name"
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <AdminFormField
                label="Email"
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <AdminFormField
                label="Password"
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="role" className="text-sm font-medium text-[var(--on-surface-variant)]">
                  Role
                </label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-container-highest)] border border-[var(--outline-variant)] text-[var(--on-surface)] text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
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
