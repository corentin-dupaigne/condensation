"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Order } from "@/lib/types";

const tabs = ["Overview", "Badges", "Order History"] as const;
type Tab = (typeof tabs)[number];

const mockBadges = [
  {
    id: "early-adopter",
    name: "Early Adopter",
    description: "Joined during the first month of Condensation",
    icon: "🛡️",
    earnedAt: "2024-12-15",
  },
  {
    id: "first-purchase",
    name: "First Purchase",
    description: "Completed your first key purchase",
    icon: "🎮",
    earnedAt: "2024-12-20",
  },
  {
    id: "collector",
    name: "Collector",
    description: "Purchased 10 or more game keys",
    icon: "🏆",
    earnedAt: "2025-01-10",
  },
];

export function ProfileClient({ userName }: { userName: string | null }) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, []);

  const initials = userName ? userName.charAt(0).toUpperCase() : "P";
  const memberSince = "December 2024";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-outline-variant/20 bg-surface-container-high p-8 md:flex-row md:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-2xl font-bold text-on-primary">
          {initials}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            {userName || "Player"}
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Member since {memberSince}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {mockBadges.length} Badges
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {ordersLoading ? "…" : orders.length} Orders
            </span>
          </div>
        </div>
        <Link
          href="/settings"
          className="shrink-0 rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:border-primary/40 hover:text-on-surface"
        >
          Edit Profile
        </Link>
      </div>

      {/* Steam Integration Card */}
      <div className="mt-6 rounded-xl border border-outline-variant/20 bg-surface-container-high p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-highest">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Steam Account</h3>
              <p className="text-xs text-on-surface-variant">
                Not linked — connect your Steam account for personalized recommendations
              </p>
            </div>
          </div>
          <button className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90">
            Link Steam
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-outline-variant/20">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "Overview" && (
          <OverviewTab badges={mockBadges} orders={orders} ordersLoading={ordersLoading} />
        )}
        {activeTab === "Badges" && <BadgesTab badges={mockBadges} />}
        {activeTab === "Order History" && (
          <OrderHistoryTab orders={orders} loading={ordersLoading} />
        )}
      </div>
    </div>
  );
}

function OverviewTab({
  badges,
  orders,
  ordersLoading,
}: {
  badges: typeof mockBadges;
  orders: Order[];
  ordersLoading: boolean;
}) {
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Badges */}
      <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-6">
        <h2 className="font-headline text-lg font-semibold text-on-surface">
          Recent Badges
        </h2>
        <div className="mt-4 space-y-3">
          {badges.slice(0, 3).map((badge) => (
            <div
              key={badge.id}
              className="flex items-center gap-3 rounded-lg bg-surface-container-high p-3 transition-colors hover:bg-surface-bright"
            >
              <span className="text-2xl">{badge.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-on-surface">{badge.name}</p>
                <p className="text-xs text-on-surface-variant">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-6">
        <h2 className="font-headline text-lg font-semibold text-on-surface">
          Recent Orders
        </h2>
        <div className="mt-4 space-y-3">
          {ordersLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-surface-container-high animate-pulse" />
            ))
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No orders yet.</p>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg bg-surface-container-high p-3 transition-colors hover:bg-surface-bright"
              >
                <div>
                  <p className="text-sm font-medium text-on-surface">Order #{order.id}</p>
                  <p className="font-mono text-xs text-on-surface-variant">
                    {order.key.split("-")[0]}-···
                  </p>
                </div>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View key
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommendations Placeholder */}
      {/* <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-6 md:col-span-2">
        <h2 className="font-headline text-lg font-semibold text-on-surface">
          Recommended For You
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Link your Steam account to get personalized game recommendations based on your library and play history.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-lg bg-surface-container-high animate-pulse"
            />
          ))}
        </div>
      </div> */}
    </div>
  );
}

function BadgesTab({ badges }: { badges: typeof mockBadges }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 transition-colors hover:bg-surface-container-high"
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">{badge.icon}</span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-on-surface">{badge.name}</h3>
              <p className="mt-1 text-xs text-on-surface-variant">{badge.description}</p>
              <p className="mt-2 text-xs text-on-surface-variant/60">
                Earned on{" "}
                {new Date(badge.earnedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      ))}

      {[
        { name: "Veteran", description: "Be a member for 1 year", icon: "🎖️" },
        { name: "Big Spender", description: "Spend €500 or more on game keys", icon: "💎" },
        { name: "Reseller", description: "Complete your first peer-to-peer sale", icon: "🤝" },
      ].map((badge) => (
        <div
          key={badge.name}
          className="rounded-xl border border-outline-variant/10 bg-surface-container/50 p-5 opacity-50"
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl grayscale">{badge.icon}</span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-on-surface-variant">{badge.name}</h3>
              <p className="mt-1 text-xs text-on-surface-variant/60">{badge.description}</p>
              <p className="mt-2 text-xs text-primary/60">Locked</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderHistoryTab({
  orders,
  loading,
}: {
  orders: Order[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-surface-container animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-12 text-center">
        <p className="text-on-surface-variant">No orders yet.</p>
        <Link
          href="/games"
          className="mt-4 inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
        >
          Browse games
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container">
      <div className="hidden grid-cols-[auto_1fr_auto] gap-4 border-b border-outline-variant/20 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant md:grid">
        <span>Order</span>
        <span>Key Preview</span>
        <span />
      </div>
      {orders.map((order) => (
        <div
          key={order.id}
          className="grid grid-cols-1 gap-2 border-b border-outline-variant/10 px-6 py-4 last:border-b-0 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-4"
        >
          <span className="text-sm font-medium text-on-surface">#{order.id}</span>
          <span className="font-mono text-sm text-on-surface-variant">
            {order.key.split("-")[0]}-···
          </span>
          <Link
            href={`/orders/${order.id}`}
            className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
          >
            View key →
          </Link>
        </div>
      ))}
    </div>
  );
}
