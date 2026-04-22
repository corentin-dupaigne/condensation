"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TopUpModal } from "@/components/wallet/TopUpModal";
import { setBalance, useBalance } from "@/lib/balance-store";

const sections = [
  "Account",
  "Wallet",
  "Notifications",
] as const;
type Section = (typeof sections)[number];

export function SettingsClient({ userName }: { userName: string | null }) {
  const [activeSection, setActiveSection] = useState<Section>("Account");

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Settings</h1>
      <p className="mt-1 text-sm text-on-surface-variant">
        Manage your account, notifications, and preferences.
      </p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Navigation */}
        <nav className="flex shrink-0 gap-1 overflow-x-auto lg:w-56 lg:flex-col">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${activeSection === section
                ? "bg-primary/10 text-primary"
                : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                }`}
            >
              {section}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {activeSection === "Account" && <AccountSection userName={userName} />}
          {activeSection === "Wallet" && <WalletSection />}
          {activeSection === "Notifications" && <NotificationsSection />}
        </div>
      </div>
    </div>
  );
}

/* ── Account ── */

function AccountSection({ userName }: { userName: string | null }) {
  return (
    <div className="space-y-6">
      <SettingsCard title="Profile Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Display Name">
            <input
              type="text"
              defaultValue={userName || ""}
              placeholder="Your display name"
              className="w-full rounded-lg bg-surface-container-highest px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-all focus:ring-1 focus:ring-primary/40"
            />
          </FieldGroup>
          <FieldGroup label="Email">
            <input
              type="email"
              defaultValue=""
              placeholder="your@email.com"
              className="w-full rounded-lg bg-surface-container-highest px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-all focus:ring-1 focus:ring-primary/40"
            />
          </FieldGroup>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-5 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90">
            Save Changes
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title="Security">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-surface-container-highest p-4">
            <div>
              <p className="text-sm font-medium text-on-surface">Password</p>
              <p className="text-xs text-on-surface-variant">
                Reset your password via email
              </p>
            </div>
            <button className="rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:border-primary/40 hover:text-on-surface">
              Reset Password
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-container-highest p-4">
            <div>
              <p className="text-sm font-medium text-on-surface">Active Sessions</p>
              <p className="text-xs text-on-surface-variant">
                Manage your active login sessions
              </p>
            </div>
            <button className="rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:border-error/40 hover:text-error">
              Sign Out All
            </button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Danger Zone">
        <div className="flex items-center justify-between rounded-lg border border-error/20 bg-error/5 p-4">
          <div>
            <p className="text-sm font-medium text-error">Delete Account</p>
            <p className="text-xs text-on-surface-variant">
              Permanently delete your account and all associated data
            </p>
          </div>
          <button className="rounded-lg border border-error/30 px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10">
            Delete Account
          </button>
        </div>
      </SettingsCard>
    </div>
  );
}

/* ── Notifications ── */

function NotificationsSection() {
  const [priceDropEmail, setPriceDropEmail] = useState(true);
  const [priceDropInApp, setPriceDropInApp] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  return (
    <div className="space-y-6">
      <SettingsCard title="Price Drop Alerts">
        <p className="mb-4 text-xs text-on-surface-variant">
          Get notified when games on your watchlist drop in price.
        </p>
        <div className="space-y-3">
          <ToggleRow
            label="Email notifications"
            description="Receive price drop alerts via email"
            checked={priceDropEmail}
            onChange={setPriceDropEmail}
          />
          <ToggleRow
            label="In-app notifications"
            description="See price drop alerts in the notification bell"
            checked={priceDropInApp}
            onChange={setPriceDropInApp}
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Order & Account">
        <div className="space-y-3">
          <ToggleRow
            label="Order updates"
            description="Key delivery confirmations and purchase receipts"
            checked={orderUpdates}
            onChange={setOrderUpdates}
          />
          <ToggleRow
            label="Newsletter"
            description="Weekly deals digest and new releases"
            checked={newsletter}
            onChange={setNewsletter}
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Watched Games">
        <p className="text-sm text-on-surface-variant">
          You are not watching any games yet. Browse the{" "}
          <Link href="/games" className="text-primary hover:underline">
            catalog
          </Link>{" "}
          and add games to your watchlist to receive price drop alerts.
        </p>
      </SettingsCard>
    </div>
  );
}

/* ── Wallet ── */

function WalletSection() {
  const balance = useBalance();
  const [topUpOpen, setTopUpOpen] = useState(false);

  useEffect(() => {
    fetch("/api/balance")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.balance !== undefined) setBalance(data.balance);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <SettingsCard title="Wallet">
        <div className="flex items-center justify-between rounded-lg bg-surface-container-highest p-4">
          <div>
            <p className="text-sm font-medium text-on-surface">Current Balance</p>
            <p className="mt-0.5 font-headline text-2xl font-bold text-primary tabular-nums">
              €{balance.toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => setTopUpOpen(true)}
            className="shrink-0 rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
          >
            Top Up
          </button>
        </div>
        <p className="mt-3 text-xs text-on-surface-variant">
          Balance is used to purchase games. Add funds via card payment.
        </p>
      </SettingsCard>
      <TopUpModal open={topUpOpen} onClose={() => setTopUpOpen(false)} />
    </div>
  );
}

/* ── Shared Components ── */

function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-high p-6">
      <h2 className="mb-4 font-headline text-lg font-semibold text-on-surface">
        {title}
      </h2>
      {children}
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-container-highest p-4">
      <div>
        <p className="text-sm font-medium text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-outline-variant"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-on-primary transition-transform ${checked ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  );
}
