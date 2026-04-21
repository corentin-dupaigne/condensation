"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminFormField from "@/components/admin/AdminFormField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import type { AdminGameDetail } from "@/lib/types";

const TEXTAREA_CLS =
  "w-full px-3 py-2.5 rounded-lg bg-[var(--surface-container-highest)] border border-[var(--outline-variant)] text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors resize-y";

const SECTION_CLS = "flex flex-col gap-4";
const SECTION_TITLE_CLS = "text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)] border-b border-[var(--outline-variant)] pb-1";

export default function EditGamePage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    steamAppId: "",
    name: "",
    slug: "",
    headerImage: "",
    priceFinal: "",
    reductionPercentage: "",
    currency: "",
    releaseDate: "",
    releaseDateRaw: "",
    requiredAge: "",
    metacriticScore: "",
    recommendationsTotal: "",
    platformWindows: false,
    platformMac: false,
    platformLinux: false,
    detailedDescription: "",
    aboutTheGame: "",
    supportedLanguages: "",
    pcRequirements: "",
    macRequirements: "",
    linuxRequirements: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/games/${id}`)
      .then((r) => r.json())
      .then((data: AdminGameDetail) => {
        setForm({
          steamAppId: String(data.steamAppId ?? ""),
          name: data.name ?? "",
          slug: data.slug ?? "",
          headerImage: data.headerImage ?? "",
          priceFinal: data.priceFinal != null ? String(data.priceFinal / 100) : "",
          reductionPercentage: String(data.reductionPercentage ?? 0),
          currency: data.currency ?? "",
          releaseDate: data.releaseDate ?? "",
          releaseDateRaw: data.releaseDateRaw ?? "",
          requiredAge: data.requiredAge != null ? String(data.requiredAge) : "",
          metacriticScore: data.metacriticScore != null ? String(data.metacriticScore) : "",
          recommendationsTotal: data.recommendationsTotal != null ? String(data.recommendationsTotal) : "",
          platformWindows: data.platformWindows ?? false,
          platformMac: data.platformMac ?? false,
          platformLinux: data.platformLinux ?? false,
          detailedDescription: data.detailedDescription ?? "",
          aboutTheGame: data.aboutTheGame ?? "",
          supportedLanguages: data.supportedLanguages ?? "",
          pcRequirements: data.pcRequirements ? JSON.stringify(data.pcRequirements, null, 2) : "",
          macRequirements: data.macRequirements ? JSON.stringify(data.macRequirements, null, 2) : "",
          linuxRequirements: data.linuxRequirements ? JSON.stringify(data.linuxRequirements, null, 2) : "",
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
          headerImage: form.headerImage || null,
          priceFinal: Math.round(Number(form.priceFinal) * 100),
          reductionPercentage: Number(form.reductionPercentage),
          currency: form.currency || null,
          releaseDate: form.releaseDate || null,
          releaseDateRaw: form.releaseDateRaw || null,
          requiredAge: form.requiredAge !== "" ? Number(form.requiredAge) : null,
          metacriticScore: form.metacriticScore !== "" ? Number(form.metacriticScore) : null,
          recommendationsTotal: form.recommendationsTotal !== "" ? Number(form.recommendationsTotal) : null,
          platformWindows: form.platformWindows,
          platformMac: form.platformMac,
          platformLinux: form.platformLinux,
          detailedDescription: form.detailedDescription || null,
          aboutTheGame: form.aboutTheGame || null,
          supportedLanguages: form.supportedLanguages || null,
          pcRequirements: form.pcRequirements || null,
          macRequirements: form.macRequirements || null,
          linuxRequirements: form.linuxRequirements || null,
        }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  function textareaField(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function checkboxField(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.checked }));
  }

  return (
    <div className="max-w-3xl">
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
          className="flex flex-col gap-8 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-2xl p-6"
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

          {/* Basic Information */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Basic Information</p>
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
              placeholder="https://…"
            />
          </div>

          {/* Pricing */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Pricing</p>
            <div className="grid grid-cols-3 gap-4">
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
              <AdminFormField
                label="Currency"
                id="currency"
                value={form.currency}
                onChange={field("currency")}
                placeholder="EUR"
              />
            </div>
          </div>

          {/* Release */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Release</p>
            <div className="grid grid-cols-2 gap-4">
              <AdminFormField
                label="Release Date"
                id="releaseDate"
                type="date"
                value={form.releaseDate}
                onChange={field("releaseDate")}
              />
              <AdminFormField
                label="Release Date (raw)"
                id="releaseDateRaw"
                value={form.releaseDateRaw}
                onChange={field("releaseDateRaw")}
                placeholder="e.g. Q1 2026, Coming Soon"
              />
            </div>
          </div>

          {/* Stats */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Stats</p>
            <div className="grid grid-cols-3 gap-4">
              <AdminFormField
                label="Required Age"
                id="requiredAge"
                type="number"
                min="0"
                max="21"
                value={form.requiredAge}
                onChange={field("requiredAge")}
              />
              <AdminFormField
                label="Metacritic Score"
                id="metacriticScore"
                type="number"
                min="0"
                max="100"
                value={form.metacriticScore}
                onChange={field("metacriticScore")}
              />
              <AdminFormField
                label="Recommendations"
                id="recommendationsTotal"
                type="number"
                min="0"
                value={form.recommendationsTotal}
                onChange={field("recommendationsTotal")}
              />
            </div>
          </div>

          {/* Platforms */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Platforms</p>
            <div className="flex gap-6">
              {(
                [
                  ["platformWindows", "Windows"],
                  ["platformMac", "Mac"],
                  ["platformLinux", "Linux"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key] as boolean}
                    onChange={checkboxField(key)}
                    className="w-4 h-4 rounded accent-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--on-surface)]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Descriptions */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Descriptions</p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="detailedDescription" className="text-sm font-medium text-[var(--on-surface-variant)]">
                Detailed Description
              </label>
              <textarea
                id="detailedDescription"
                rows={6}
                value={form.detailedDescription}
                onChange={textareaField("detailedDescription")}
                className={TEXTAREA_CLS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="aboutTheGame" className="text-sm font-medium text-[var(--on-surface-variant)]">
                About the Game
              </label>
              <textarea
                id="aboutTheGame"
                rows={6}
                value={form.aboutTheGame}
                onChange={textareaField("aboutTheGame")}
                className={TEXTAREA_CLS}
              />
            </div>
            <AdminFormField
              label="Supported Languages"
              id="supportedLanguages"
              value={form.supportedLanguages}
              onChange={field("supportedLanguages")}
              placeholder="English, French, German…"
            />
          </div>

          {/* System Requirements */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>System Requirements (JSON)</p>
            {(
              [
                ["pcRequirements", "PC Requirements"],
                ["macRequirements", "Mac Requirements"],
                ["linuxRequirements", "Linux Requirements"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label htmlFor={key} className="text-sm font-medium text-[var(--on-surface-variant)]">
                  {label}
                </label>
                <textarea
                  id={key}
                  rows={4}
                  value={form[key] as string}
                  onChange={textareaField(key)}
                  className={`${TEXTAREA_CLS} font-mono text-xs`}
                  placeholder='{"minimum": "…", "recommended": "…"}'
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--outline-variant)]">
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
