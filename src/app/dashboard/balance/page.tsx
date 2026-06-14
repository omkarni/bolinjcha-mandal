import { getActiveYear } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  groupCollectionsByDonator,
  sumGroupedPending,
} from "@/lib/collection-utils";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { Scale } from "lucide-react";

export default async function BalancePage() {
  const year = await getActiveYear();
  const collections = await prisma.collection.findMany({
    where: { managementYearId: year.id },
    include: { donator: true },
    orderBy: { date: "desc" },
  });

  const grouped = groupCollectionsByDonator(collections).filter(
    (g) => g.hasPending
  );
  const totalPending = sumGroupedPending(grouped);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Balance Overview</h1>
      </div>

      <div className="stat-card mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-lg">
            <Scale size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Pending Balance</p>
            <p className="text-3xl font-bold text-amber-600">
              {formatCurrency(totalPending)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {grouped.length} donators with balance for {year.label}
            </p>
          </div>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p>All collections are fully paid! 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map((g) => (
            <div key={g.donatorId} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{g.donatorName}</h3>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Total paid: {formatCurrency(g.totalPaid)}
                    {g.paymentCount > 1 && (
                      <span className="text-gray-400">
                        {" "}
                        &middot; {g.paymentCount} installments
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-lg font-bold text-amber-600">
                    {formatCurrency(g.balancePending)}
                  </p>
                  <p className="text-xs text-gray-400">balance due</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
