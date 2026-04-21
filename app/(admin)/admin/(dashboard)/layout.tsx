"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Menu,
  HelpCircle,
  ImageIcon,
  X,
} from "lucide-react";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false); // 🔥 mobile drawer

  const nav = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Seasons", href: "/admin/seasons", icon: BarChart3 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "FAQ", href: "/admin/faq", icon: HelpCircle },
    { name: "Banners", href: "/admin/banners", icon: ImageIcon },
  ];

  return (
    <div className="flex min-h-screen bg-[#070014]">

      {/* 🔥 MOBILE TOP BAR */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-[#0d061a] border-b border-white/5 flex items-center px-3 z-50 md:hidden">
        <button onClick={() => setOpen(true)}>
          <Menu size={20} className="text-white" />
        </button>

        <span className="ml-3 text-sm text-white font-semibold">
          Admin
        </span>
      </div>

      {/* 🔥 OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 🔥 SIDEBAR */}
      <aside
        className={`
        fixed md:relative z-50 md:z-auto
        h-full bg-[#0d061a] border-r border-white/5 p-3
        transition-all duration-300

        ${collapsed ? "md:w-16" : "md:w-44"}
        ${open ? "left-0" : "-left-64 md:left-0"}
        w-56
      `}
      >

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-6">

          {/* DESKTOP TOGGLE */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex text-muted hover:text-white"
          >
            <Menu size={18} />
          </button>

          {/* MOBILE CLOSE */}
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* TITLE */}
        {!collapsed && (
          <h2 className="text-white text-xs font-semibold mb-4 tracking-wide">
            Admin Panel
          </h2>
        )}

        {/* NAV */}
        <div className="space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)} // 🔥 close on mobile click
                className={`flex items-center gap-3 px-2 py-2 rounded-md text-sm transition
                ${
                  active
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* 🔥 CONTENT */}
      <main className="flex-1 pt-12 md:pt-0 p-3 md:p-6">
        {children}
      </main>
    </div>
  );
}