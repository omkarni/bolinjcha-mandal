import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CollectionsClient } from "@/components/modules/CollectionsClient";

export default async function CollectionsPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const [collections, donators, societies] = await Promise.all([
    prisma.collection.findMany({
      where: { managementYearId: year.id },
      include: { donator: { include: { society: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.donator.findMany({
      where: { managementYearId: year.id },
      include: { collections: true, society: true },
      orderBy: { name: "asc" },
    }),
    prisma.society.findMany({
      where: { managementYearId: year.id },
      orderBy: { buildingName: "asc" },
    }),
  ]);

  const donatorsWithPaid = donators.map((d) => ({
    id: d.id,
    name: d.name,
    expectedAmount: d.expectedAmount,
    totalPaid: d.collections.reduce((s, c) => s + c.amount, 0),
    societyName: d.society?.buildingName,
    wing: d.wing,
    flatNo: d.flatNo,
  }));

  return (
    <CollectionsClient
      collections={collections}
      donators={donatorsWithPaid}
      societies={societies}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
