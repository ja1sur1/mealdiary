"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/meals/new", label: "Meal" },
  { href: "/symptoms/new", label: "Symptoms" },
  { href: "/history", label: "History" },
  { href: "/insights", label: "Insights" },
  { href: "/settings", label: "Settings" }
] satisfies Array<{ href: Route; label: string }>;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="Primary">
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            className={`nav-link${isActive ? " active" : ""}`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
