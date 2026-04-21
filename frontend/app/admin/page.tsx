import { getAdminToken } from "@/lib/admin-auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faShoppingCart, faGamepad } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

async function fetchCount(path: string, token: string): Promise<number> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return 0;
    const data = await res.json();
    if (Array.isArray(data)) return data.length;
    if (typeof data.total === "number") return data.total;
    if (typeof data.totalElements === "number") return data.totalElements;
    if (typeof data.count === "number") return data.count;
    return 0;
  } catch {
    return 0;
  }
}

const statCards = [
  {
    label: "Total Users",
    icon: faUsers,
    path: "/api/admin/users",
    href: "/admin/users",
    color: "var(--primary)",
  },
  {
    label: "Total Orders",
    icon: faShoppingCart,
    path: "/api/admin/orders",
    href: "/admin/orders",
    color: "var(--secondary)",
  },
  {
    label: "Total Games",
    icon: faGamepad,
    path: "/api/admin/games",
    href: "/admin/games",
    color: "var(--tertiary-container)",
  },
];

export default async function AdminDashboard() {
  const token = (await getAdminToken())!;

  const counts = await Promise.all(
    statCards.map((card) => fetchCount(card.path, token))
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <Link
            key={card.label}
            href={card.href}
            className="group flex items-center gap-5 p-6 rounded-2xl bg-[var(--surface-container)] border border-[var(--outline-variant)] hover:border-[var(--primary)] transition-colors"
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{ backgroundColor: `color-mix(in srgb, ${card.color} 15%, transparent)` }}
            >
              <FontAwesomeIcon
                icon={card.icon}
                className="w-6 h-6"
                style={{ color: card.color }}
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--on-surface)]">{counts[i]}</p>
              <p className="text-sm text-[var(--on-surface-variant)]">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
