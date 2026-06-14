import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, CalendarDays, QrCode, Trophy, AlertCircle } from "lucide-react";
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
    { href: "/dashboard/my-payments", label: "My Payments", icon: Wallet, desc: "Submit & view donations" },
    { href: "/dashboard/events", label: "Event Calendar", icon: CalendarDays, desc: "Aarti & programs" },
    { href: "/dashboard/qr-donations", label: "Donate via QR", icon: QrCode, desc: "Scan UPI QR code" },
    { href: "/dashboard/activities", label: "Activities", icon: Trophy, desc: "Competitions & results" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Welcome, {userName}</h1>
        <p className="text-gray-500 mt-1">{yearLabel}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Wallet size={18} />
            <span className="text-sm">Total Paid</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <AlertCircle size={18} />
            <span className="text-sm">Balance Pending</span>
          </div>
          <p className="text-3xl font-bold text-amber-600">
            {formatCurrency(totalPending)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="card hover:shadow-card-hover transition-shadow text-center py-5"
            >
              <div className="inline-flex p-3 bg-mandal-cream rounded-lg mb-2">
                <Icon size={22} className="text-mandal-saffron" />
              </div>
              <p className="font-medium text-mandal-maroon text-sm">{link.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{link.desc}</p>
            </Link>
          );
        })}
      </div>

      {recentPayments.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-mandal-maroon">Recent Payments</h2>
            <Link href="/dashboard/my-payments" className="text-sm text-mandal-saffron hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentPayments.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium">{formatCurrency(c.amount)}</p>
                  <p className="text-xs text-gray-500">{formatDate(c.date)}</p>
                </div>
                <Badge variant={c.paymentStatus === "FULL" ? "success" : "warning"}>
                  {c.paymentStatus === "FULL" ? "Paid" : `Pending ${formatCurrency(c.balanceAmount)}`}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalPaid === 0 && totalPending === 0 && (
        <div className="card text-center py-8 text-gray-500">
          <p>No donation records found for your mobile number yet.</p>
          <p className="text-sm mt-2">
            Contact the mandal office if you have made a donation.
          </p>
        </div>
      )}
    </div>
  );
}
