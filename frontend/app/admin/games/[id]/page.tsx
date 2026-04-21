"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminFormField from "@/components/admin/AdminFormField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import type { AdminGame } from "@/lib/types";

export default function EditGamePage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    steamAppId: "",
    name: "",
    slug: "",
    headerImage: "",
    priceFinal: "",
    reductionPercentage: "",
    releaseDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/games/${id}`)
      .then((r) => r.json())
      .then((data: AdminGame) => {
        setForm({
          steamAppId: String(data.steamAppId ?? ""),
          name: data.name ?? "",
          slug: data.slug ?? "",
          headerImage: data.headerImage ?? "",
          priceFinal: data.priceFinal != null ? String(data.priceFinal / 100) : "",
          reductionPercentage: String(data.reductionPercentage ?? 0),
          releaseDate: data.releaseDate ?? "",
        });
      })
      .catch(() => setError("Failed to load game."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/admin/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steamAppId: Number(form.steamAppId),
          name: form.name,
          slug: form.slug,
          headerImage: form.headerImage,
          priceFinal: Math.round(Number(form.priceFinal) * 100),
          reductionPercentage: Number(form.reductionPercentage),
          releaseDate: form.releaseDate,
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

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/games"
          className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold">Edit Game #{id}</h1>
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
            label="Steam App ID"
            id="steamAppId"
            type="number"
            required
            value={form.steamAppId}
            onChange={field("steamAppId")}
          />
          <AdminFormField
            label="Name"
            id="name"
            required
            value={form.name}
            onChange={field("name")}
          />
          <AdminFormField
            label="Slug"
            id="slug"
            value={form.slug}
            onChange={field("slug")}
          />
          <AdminFormField
            label="Header Image URL"
            id="headerImage"
            value={form.headerImage}
            onChange={field("headerImage")}
          />
          <div className="grid grid-cols-2 gap-4">
            <AdminFormField
              label="Price (€)"
              id="priceFinal"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.priceFinal}
              onChange={field("priceFinal")}
            />
            <AdminFormField
              label="Discount %"
              id="reductionPercentage"
              type="number"
              min="0"
              max="100"
              value={form.reductionPercentage}
              onChange={field("reductionPercentage")}
            />
          </div>
          <AdminFormField
            label="Release Date"
            id="releaseDate"
            value={form.releaseDate}
            onChange={field("releaseDate")}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/games"
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
