"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminFormField from "@/components/admin/AdminFormField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import type { AdminOrder } from "@/lib/types";

export default function EditOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({ userId: "", gamesId: "", key: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((data: AdminOrder) => {
        setForm({
          userId: String(data.userId ?? ""),
          gamesId: String(data.gamesId ?? ""),
          key: data.key ?? "",
          status: data.status ?? "",
        });
      })
      .catch(() => setError("Failed to load order."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(form.userId),
          gamesId: Number(form.gamesId),
          key: form.key,
          status: form.status,
        }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/orders"
          className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold">Edit Order #{id}</h1>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[var(--on-surface-variant)]">Loading…</div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-2xl p-6"
        >
          {error && (
            <p className="px-4 py-3 rounded-lg bg-[var(--error-container)] text-[var(--on-error-container)] text-sm">
              {error}
            </p>
          )}
          {success && (
            <p className="px-4 py-3 rounded-lg bg-green-900/40 text-green-300 text-sm">
              Saved successfully.
            </p>
          )}
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
          <AdminFormField
            label="Status"
            id="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/orders"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--surface-container-highest)] text-[var(--on-surface)] hover:bg-[var(--surface-bright)] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
