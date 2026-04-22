"use client";

import { useEffect, useState } from "react";
import AdminTable, { Column } from "@/components/admin/AdminTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import AdminFormField from "@/components/admin/AdminFormField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { AdminGame } from "@/lib/types";

const COLUMNS: Column<AdminGame>[] = [
  { key: "id", label: "ID" },
  { key: "steamAppId", label: "Steam App ID" },
  { key: "name", label: "Name" },
  {
    key: "priceFinal",
    label: "Price",
    render: (row) =>
      row.priceFinal != null
        ? `€${(row.priceFinal / 100).toFixed(2)}`
        : "—",
  },
  {
    key: "reductionPercentage",
    label: "Discount",
    render: (row) =>
      row.reductionPercentage > 0 ? `-${row.reductionPercentage}%` : "—",
  },
  { key: "releaseDate", label: "Release Date" },
];

const EMPTY_FORM = {
  steamAppId: "",
  name: "",
  slug: "",
  headerImage: "",
  priceFinal: "",
  reductionPercentage: "0",
  releaseDate: "",
};

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<AdminGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminGame | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const visibleGames = games
    .slice()
    .sort((a, b) => a.id - b.id)
    .filter((g) =>
      search.trim() === "" ||
      g.name.toLowerCase().includes(search.trim().toLowerCase())
    );

  async function loadGames() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/games");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGames(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      setError("Failed to load games.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadGames(); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/games/${deleteTarget.id}`, { method: "DELETE" });
      setGames((prev) => prev.filter((g) => g.id !== deleteTarget.id));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/games", {
        method: "POST",
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
      setShowCreate(false);
      setForm(EMPTY_FORM);
      loadGames();
    } catch {
      setError("Failed to create game.");
    } finally {
      setCreating(false);
    }
  }

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : toSlug(name),
    }));
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setShowCreate(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Games</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          New Game
        </button>
      </div>

      <div className="relative mb-6">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--on-surface-variant)] pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--surface-container-highest)] border border-[var(--outline-variant)] text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
          >
            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
          </button>
        )}
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
      ) : visibleGames.length === 0 ? (
        <div className="py-16 text-center text-[var(--on-surface-variant)] text-sm">
          {search ? `No games matching "${search}"` : "No games found."}
        </div>
      ) : (
        <AdminTable
          columns={COLUMNS}
          rows={visibleGames}
          editHref={(row) => `/admin/games/${row.id}`}
          onDelete={(row) => setDeleteTarget(row)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently remove the game from the catalog."
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
          <div className="relative z-10 w-full max-w-lg mx-4 bg-[var(--surface-container-high)] border border-[var(--outline-variant)] rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Create Game</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
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
                onChange={handleNameChange}
              />
              <AdminFormField
                label="Slug"
                id="slug"
                value={form.slug}
                onChange={handleSlugChange}
                placeholder="auto-generated from name"
              />
              <AdminFormField
                label="Header Image URL (optional)"
                id="headerImage"
                value={form.headerImage}
                onChange={field("headerImage")}
                placeholder="https://…"
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
                type="date"
                value={form.releaseDate}
                onChange={field("releaseDate")}
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
