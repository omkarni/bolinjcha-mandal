import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DonatorsClient } from "@/components/modules/DonatorsClient";

export default async function DonatorsPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const [donators, societies] = await Promise.all([
    prisma.donator.findMany({
      where: { managementYearId: year.id },
      include: {
        society: true,
        _count: { select: { collections: true, exceptions: true, recoveries: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.society.findMany({
      where: { managementYearId: year.id },
      orderBy: { buildingName: "asc" },
    }),
  ]);

  return (
    <DonatorsClient
      donators={donators.map((d) => ({
        id: d.id,
        name: d.name,
        mobile: d.mobile,
        wing: d.wing,
        flatNo: d.flatNo,
        societyId: d.societyId,
        expectedAmount: d.expectedAmount,
        referredBy: d.referredBy,
        society: d.society,
        paymentCount: d._count.collections,
        linkedCount: d._count.exceptions + d._count.recoveries,
      }))}
      societies={societies}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
