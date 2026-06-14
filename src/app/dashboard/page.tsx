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
      color: "text-green-600 bg-green-50",
      href: "/dashboard/collections",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(summary.totalExpense),
      icon: Receipt,
      color: "text-red-600 bg-red-50",
      href: "/dashboard/expenses",
    },
    {
      label: "Available Fund",
      value: formatCurrency(summary.availableFund),
      icon: Wallet,
      color: "text-mandal-saffron bg-orange-50",
      href: "/dashboard/expenses",
    },
    {
      label: "Pending Balance",
      value: formatCurrency(summary.totalPending),
      icon: AlertCircle,
      color: "text-amber-600 bg-amber-50",
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome, {session?.name} &middot; {year.label}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-mandal-saffron/10 text-mandal-saffron px-4 py-2 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-mandal-saffron rounded-full animate-pulse" />
          Active Year: {year.year}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="stat-card group">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-lg ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {counts.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="card flex items-center gap-3 hover:shadow-card-hover transition-shadow"
            >
              <div className="p-2 rounded-lg bg-mandal-cream-dark">
                <Icon size={18} className="text-mandal-maroon" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{item.count}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-mandal-maroon mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Add Collection", href: "/dashboard/collections" },
            { label: "Membership Fees", href: "/dashboard/membership-fees" },
            { label: "Payment Approvals", href: "/dashboard/payment-approvals" },
            { label: "Approve Users", href: "/dashboard/users" },
            { label: "Add Donator", href: "/dashboard/donators" },
            { label: "View Balance", href: "/dashboard/balance" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="text-center py-3 px-4 bg-mandal-cream hover:bg-mandal-cream-dark rounded-lg text-sm font-medium text-mandal-maroon transition-colors"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
