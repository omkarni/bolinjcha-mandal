import { getActiveYear } from "@/lib/auth";
import { getFinancialSummary } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { ReportsClient } from "@/components/modules/ReportsClient";

export default async function ReportsPage() {
  const year = await getActiveYear();
  const summary = await getFinancialSummary(year.id);
  const recoveryCount = await prisma.recovery.count({
    where: { managementYearId: year.id },
  });
  const totalRecovered = await prisma.recovery.aggregate({
    where: { managementYearId: year.id },
    _sum: { amount: true },
  });

  return (
    <ReportsClient
      yearLabel={year.label}
      summary={{
        ...summary,
        recoveryCount,
        totalRecovered: totalRecovered._sum.amount || 0,
      }}
    />
  );
}
