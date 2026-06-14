import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CollectionsClient } from "@/components/modules/CollectionsClient";

export default async function CollectionsPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const [collections, donators] = await Promise.all([
    prisma.collection.findMany({
      where: { managementYearId: year.id },
      include: { donator: true },
      orderBy: { date: "desc" },
    }),
    prisma.donator.findMany({
      where: { managementYearId: year.id },
      include: { collections: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const donatorsWithPaid = donators.map((d) => ({
    id: d.id,
    name: d.name,
    expectedAmount: d.expectedAmount,
    totalPaid: d.collections.reduce((s, c) => s + c.amount, 0),
  }));

  return (
    <CollectionsClient
      collections={collections}
      donators={donatorsWithPaid}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
