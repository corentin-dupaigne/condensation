"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faUsers,
  faShoppingCart,
  faGamepad,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: faGauge, exact: true },
  { href: "/admin/users", label: "Users", icon: faUsers },
  { href: "/admin/orders", label: "Orders", icon: faShoppingCart },
  { href: "/admin/games", label: "Games", icon: faGamepad },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col gap-1 bg-[var(--surface-container)] border-r border-[var(--outline-variant)] min-h-screen px-3 py-6">
      <div className="px-3 mb-6">
        <span className="text-[var(--primary)] font-bold tracking-wider text-sm uppercase">
          Admin Panel
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(href, exact)
                ? "bg-[var(--primary)] text-[var(--on-primary)]"
                : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]"
            }`}
          >
            <FontAwesomeIcon icon={icon} className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)] transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 shrink-0" />
          Back to site
        </Link>
      </div>
    </aside>
  );
}
