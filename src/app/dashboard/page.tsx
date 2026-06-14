import { getActiveYear, getSession } from "@/lib/auth";
import { getFinancialSummary, getUserPayments } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  IndianRupee,
  Receipt,
  Wallet,
  AlertCircle,
  Users,
  Heart,
  Building2,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { UserDashboard } from "@/components/modules/UserDashboard";

export default async function DashboardPage() {
  const session = await getSession();
  const year = await getActiveYear();

  if (session?.role === "USER") {
    const { collections, totalPaid, totalPending } = await getUserPayments(
      session.id,
      year.id
    );
    return (
      <UserDashboard
        userName={session.name}
        yearLabel={year.label}
        totalPaid={totalPaid}
        totalPending={totalPending}
        recentPayments={collections}
      />
    );
  }

  const summary = await getFinancialSummary(year.id);

  const [memberCount, donatorCount, societyCount, collectionCount] =
    await Promise.all([
      prisma.member.count({ where: { managementYearId: year.id } }),
      prisma.donator.count({ where: { managementYearId: year.id } }),
      prisma.society.count({ where: { managementYearId: year.id } }),
      prisma.collection.count({ where: { managementYearId: year.id } }),
    ]);

  const stats = [
    {
      label: "Total Collection",
      value: formatCurrency(summary.totalCollection),
      icon: IndianRupee,
      color: "from-green-500 to-emerald-600",
      bg: "bg-green-50",
      href: "/dashboard/collections",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(summary.totalExpense),
      icon: Receipt,
      color: "from-red-500 to-rose-600",
      bg: "bg-red-50",
      href: "/dashboard/expenses",
    },
    {
      label: "Available Fund",
      value: formatCurrency(summary.availableFund),
      icon: Wallet,
      color: "from-mandal-saffron to-mandal-gold",
      bg: "bg-orange-50",
      href: "/dashboard/expenses",
    },
    {
      label: "Pending Balance",
      value: formatCurrency(summary.totalPending),
      icon: AlertCircle,
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      href: "/dashboard/balance",
    },
  ];

  const counts = [
    { label: "Members", count: memberCount, icon: Users, href: "/dashboard/members" },
    { label: "Donators", count: donatorCount, icon: Heart, href: "/dashboard/donators" },
    { label: "Societies", count: societyCount, icon: Building2, href: "/dashboard/societies" },
    { label: "Collections", count: collectionCount, icon: IndianRupee, href: "/dashboard/collections" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="hero-banner">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-mandal-gold-light text-sm font-medium mb-2">
              <Sparkles size={16} />
              Admin Dashboard
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Welcome back, {session?.name}
            </h1>
            <p className="text-white/70 mt-1">{year.label}</p>
          </div>
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-full text-sm font-semibold self-start">
            <span className="w-2.5 h-2.5 bg-mandal-gold-light rounded-full animate-pulse shadow-glow" />
            Active Year: {year.year}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="stat-card group">
              <div className="flex items-start justify-between">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon size={22} />
                </div>
                <ArrowUpRight
                  size={18}
                  className="text-gray-300 group-hover:text-mandal-saffron transition-colors"
                />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-4 tracking-tight">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 font-medium mt-0.5">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="section-title">
          <Users size={20} className="text-mandal-saffron" />
          Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {counts.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="card-elevated flex items-center gap-4 group"
              >
                <div className="p-3 rounded-xl bg-mandal-cream group-hover:bg-saffron-gradient transition-all duration-300">
                  <Icon
                    size={20}
                    className="text-mandal-maroon group-hover:text-white transition-colors"
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{item.count}</p>
                  <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">
          <Sparkles size={20} className="text-mandal-gold" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Add Collection", href: "/dashboard/collections" },
            { label: "Membership Fees", href: "/dashboard/membership-fees" },
            { label: "Payment Approvals", href: "/dashboard/payment-approvals" },
            { label: "Approve Users", href: "/dashboard/users" },
            { label: "Add Donator", href: "/dashboard/donators" },
            { label: "View Balance", href: "/dashboard/balance" },
          ].map((action) => (
            <Link key={action.label} href={action.href} className="quick-action-btn">
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
