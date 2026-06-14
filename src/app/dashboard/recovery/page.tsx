import { getActiveYear } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecoveryClient } from "@/components/modules/RecoveryClient";
import {
  groupCollectionsByDonator,
  sumGroupedPending,
} from "@/lib/collection-utils";

export default async function RecoveryPage() {
  const year = await getActiveYear();
  const [collections, members, recoveries] = await Promise.all([
    prisma.collection.findMany({
      where: { managementYearId: year.id },
      include: { donator: { include: { society: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.member.findMany({
      where: { managementYearId: year.id },
      orderBy: { name: "asc" },
    }),
    prisma.recovery.findMany({
      where: { managementYearId: year.id },
      include: {
        donator: true,
        recoveredByMember: true,
      },
      orderBy: { date: "desc" },
    }),
  ]);

  const grouped = groupCollectionsByDonator(collections).filter((g) => g.hasPending);
  const totalPending = sumGroupedPending(grouped);

  return (
    <RecoveryClient
      pendingGroups={grouped}
      totalPending={totalPending}
      yearLabel={year.label}
      members={members.map((m) => ({ id: m.id, name: m.name }))}
      recoveries={recoveries.map((r) => ({
        id: r.id,
        amount: r.amount,
        date: r.date,
        donatorName: r.donator.name,
        recoveredBy:
          r.recoveredByMember?.name || r.recoveredByName || "—",
        notes: r.notes,
      }))}
    />
  );
}
