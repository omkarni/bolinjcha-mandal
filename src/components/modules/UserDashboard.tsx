import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Wallet,
  CalendarDays,
  QrCode,
  Trophy,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui";

type Collection = {
  id: string;
  amount: number;
  date: string;
  paymentStatus: string;
  balanceAmount: number;
};

export function UserDashboard({
  userName,
  yearLabel,
  totalPaid,
  totalPending,
  recentPayments,
}: {
  userName: string;
  yearLabel: string;
  totalPaid: number;
  totalPending: number;
  recentPayments: Collection[];
}) {
  const quickLinks = [
    {
      href: "/dashboard/my-payments",
      label: "My Payments",
      icon: Wallet,
      desc: "Submit & view donations",
    },
    {
      href: "/dashboard/events",
      label: "Event Calendar",
      icon: CalendarDays,
      desc: "Aarti & programs",
    },
    {
      href: "/dashboard/qr-donations",
      label: "Donate via QR",
      icon: QrCode,
      desc: "Scan UPI QR code",
    },
    {
      href: "/dashboard/activities",
      label: "Activities",
      icon: Trophy,
      desc: "Competitions & results",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="hero-banner">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-mandal-gold-light text-sm font-medium mb-2">
            <Sparkles size={16} />
            Member Portal
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Welcome, {userName}
          </h1>
          <p className="text-white/70 mt-1">{yearLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
              <Wallet size={22} />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              Paid
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-4">{formatCurrency(totalPaid)}</p>
          <p className="text-sm text-gray-500 font-medium">Total Paid</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
              <AlertCircle size={22} />
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              Pending
            </span>
          </div>
          <p className="text-3xl font-bold text-amber-600 mt-4">
            {formatCurrency(totalPending)}
          </p>
          <p className="text-sm text-gray-500 font-medium">Balance Pending</p>
        </div>
      </div>

      <div>
        <h2 className="section-title">
          <Sparkles size={20} className="text-mandal-saffron" />
          Quick Access
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="card-elevated text-center py-6 group"
              >
                <div className="inline-flex p-4 rounded-2xl bg-mandal-cream group-hover:bg-saffron-gradient transition-all duration-300 mb-3">
                  <Icon
                    size={24}
                    className="text-mandal-saffron group-hover:text-white transition-colors"
                  />
                </div>
                <p className="font-semibold text-mandal-maroon text-sm">{link.label}</p>
                <p className="text-xs text-gray-400 mt-1">{link.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {recentPayments.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title mb-0">
              <Wallet size={20} className="text-mandal-saffron" />
              Recent Payments
            </h2>
            <Link
              href="/dashboard/my-payments"
              className="text-sm text-mandal-saffron font-semibold hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentPayments.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-mandal-cream/50 hover:bg-mandal-cream transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-800">{formatCurrency(c.amount)}</p>
                  <p className="text-xs text-gray-500">{formatDate(c.date)}</p>
                </div>
                <Badge variant={c.paymentStatus === "FULL" ? "success" : "warning"}>
                  {c.paymentStatus === "FULL"
                    ? "Paid"
                    : `Pending ${formatCurrency(c.balanceAmount)}`}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalPaid === 0 && totalPending === 0 && (
        <div className="card text-center py-12">
          <div className="inline-flex p-4 rounded-full bg-mandal-cream mb-4">
            <Wallet size={32} className="text-mandal-saffron/50" />
          </div>
          <p className="text-gray-600 font-medium">No donation records found yet</p>
          <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
            Contact the mandal office if you have made a donation. Your records
            will appear here once linked.
          </p>
        </div>
      )}
    </div>
  );
}
