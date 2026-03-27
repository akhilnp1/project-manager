"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { cn, getInitials } from "@/lib/utils";
import {
  Layers, FolderKanban, CheckSquare, LogOut, ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/tasks",    label: "Tasks",    icon: CheckSquare },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, hydrate, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (!token && typeof window !== "undefined") router.replace("/login"); }, [token, router]);

  const handleLogout = () => { logout(); router.push("/login"); };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 text-white flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-2">
          <div className="bg-brand-500 p-1.5 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">ProjectFlow</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
                {active && <ChevronRight className="ml-auto w-4 h-4 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
}
