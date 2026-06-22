"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Wallet,
  FileText,
  Megaphone,
  Settings,
  Calendar,
  Wrench,
  Users,
  FileBarChart,
} from "lucide-react";

export function Sidebar({ role = "resident" }: { role?: string }) {
  const pathname = usePathname();

  const adminNavigation = [
    { name: "Dashboard",      href: "/dashboard",               icon: LayoutDashboard },
    { name: "Residentes",     href: "/dashboard/residents",     icon: Users },
    { name: "Unidades",       href: "/dashboard/units",         icon: Building2 },
    { name: "Pagos",          href: "/dashboard/payments",      icon: Wallet },
    { name: "Gastos Comunes", href: "/dashboard/expenses",      icon: FileText },
    { name: "Áreas Comunes",  href: "/dashboard/amenities",     icon: Building2 },
    { name: "Reservas",       href: "/dashboard/reservations",  icon: Calendar },
    { name: "Incidencias",    href: "/dashboard/incidents",     icon: Wrench },
    { name: "Anuncios",       href: "/dashboard/announcements", icon: Megaphone },
    { name: "Informes",       href: "/dashboard/reports",       icon: FileBarChart },
  ];

  const residentNavigation = [
    { name: "Dashboard",  href: "/dashboard",               icon: LayoutDashboard },
    { name: "Pagos",      href: "/dashboard/payments",      icon: Wallet },
    { name: "Reservas",   href: "/dashboard/reservations",  icon: Calendar },
    { name: "Incidencias", href: "/dashboard/incidents",    icon: Wrench },
    { name: "Anuncios",   href: "/dashboard/announcements", icon: Megaphone },
  ];

  const navigation = role === "admin" ? adminNavigation : residentNavigation;

  /**
   * Returns true when the given href matches the current path.
   * Dashboard uses exact match; every other route uses startsWith
   * so nested routes (e.g. /dashboard/residents/123) also stay highlighted.
   */
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const linkClass = (href: string) => {
    const active = isActive(href);
    return [
      "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
      active
        ? "bg-primary/10 text-primary border border-primary/20"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    ].join(" ");
  };

  const iconClass = (href: string) => {
    const active = isActive(href);
    return [
      "h-5 w-5 mr-3 flex-shrink-0 transition-colors",
      active ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground",
    ].join(" ");
  };

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Building2 className="h-6 w-6 text-primary mr-2" />
        <span className="text-lg font-semibold tracking-tight">GestCom</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={linkClass(item.href)}
          >
            <item.icon className={iconClass(item.href)} aria-hidden="true" />
            {item.name}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <Link
          href="/dashboard/settings"
          className={linkClass("/dashboard/settings")}
        >
          <Settings className={iconClass("/dashboard/settings")} />
          Configuración
        </Link>
      </div>
    </div>
  );
}
