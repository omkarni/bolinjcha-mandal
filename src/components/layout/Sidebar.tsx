"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Handshake,
  Building2,
  Heart,
  IndianRupee,
  Scale,
  AlertTriangle,
  Receipt,
  Calendar,
  CalendarDays,
  LogOut,
  Menu,
  X,
  UserCheck,
  QrCode,
  Package,
  Trophy,
  PiggyBank,
  Wallet,
  UserCog,
  ClipboardCheck,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { logoutAction } from "@/lib/actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NavItem = { href: string; label: string; icon: React.ComponentType<any> };

const adminNavSections: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/events", label: "Event Calendar", icon: CalendarDays },
      { href: "/dashboard/years", label: "Years", icon: Calendar },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/dashboard/users", label: "App Users", icon: UserCog },
      { href: "/dashboard/members", label: "Members", icon: Users },
      { href: "/dashboard/membership-fees", label: "Membership Fees", icon: BadgeCheck },
      { href: "/dashboard/volunteers", label: "Volunteers", icon: UserCheck },
      { href: "/dashboard/donators", label: "Donators", icon: Heart },
      { href: "/dashboard/societies", label: "Societies", icon: Building2 },
      { href: "/dashboard/sponsors", label: "Sponsors", icon: Handshake },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/dashboard/payment-approvals", label: "Payment Approvals", icon: ClipboardCheck },
      { href: "/dashboard/collections", label: "Collections", icon: IndianRupee },
      { href: "/dashboard/balance", label: "Balance", icon: Scale },
      { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
      { href: "/dashboard/budget", label: "Budget", icon: PiggyBank },
      { href: "/dashboard/exceptions", label: "Exceptions", icon: AlertTriangle },
      { href: "/dashboard/qr-donations", label: "QR Donations", icon: QrCode },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/dashboard/inventory", label: "Inventory", icon: Package },
      { href: "/dashboard/activities", label: "Activities", icon: Trophy },
      { href: "/dashboard/documents", label: "Documents", icon: FileText },
    ],
  },
];

const userNavItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/my-payments", label: "My Payments", icon: Wallet },
  { href: "/dashboard/events", label: "Event Calendar", icon: CalendarDays },
  { href: "/dashboard/qr-donations", label: "Donate via QR", icon: QrCode },
  { href: "/dashboard/activities", label: "Activities", icon: Trophy },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = userRole === "ADMIN";

  const NavContent = () => (
    <>
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-saffron-gradient flex items-center justify-center text-white font-bold text-xl shadow-glow shrink-0">
            ॐ
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-white text-sm leading-tight truncate">
              Bolinjcha Vighnaharta
            </h2>
            <p className="text-[11px] text-white/50 truncate">Sarvajanik Utsav Mandal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-5 overflow-y-auto">
        {isAdmin ? (
          adminNavSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-mandal-gold/70">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-0.5">
            {userNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </div>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="w-10 h-10 rounded-full bg-saffron-gradient flex items-center justify-center text-white text-sm font-bold shrink-0">
            {getInitials(userName)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-[11px] text-mandal-gold/80 capitalize">
              {isAdmin ? "Administrator" : "Member"}
            </p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all w-full py-2.5 rounded-xl border border-white/10"
          >
            <LogOut size={16} />
            Logout
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-mandal-gradient border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-sidebar">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-saffron-gradient flex items-center justify-center text-white text-sm font-bold">
            ॐ
          </div>
          <span className="font-display font-bold text-white text-sm">BVSM Mandal</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-mandal-gradient shadow-2xl transform transition-transform duration-300 flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>

      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-[17rem] bg-mandal-gradient flex-col shadow-sidebar border-r border-white/5">
        <NavContent />
      </aside>
    </>
  );
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const active = pathname === item.href;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        active ? "nav-item-active" : "nav-item-inactive"
      )}
    >
      <Icon size={17} className={active ? "text-mandal-gold-light" : ""} />
      {item.label}
    </Link>
  );
}
