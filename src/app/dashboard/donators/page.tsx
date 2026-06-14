import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DonatorsClient } from "@/components/modules/DonatorsClient";

export default async function DonatorsPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const [donators, societies] = await Promise.all([
    prisma.donator.findMany({
      where: { managementYearId: year.id },
      include: { society: true },
      orderBy: { name: "asc" },
    }),
    prisma.society.findMany({
      where: { managementYearId: year.id },
      orderBy: { buildingName: "asc" },
    }),
  ]);

  return (
    <DonatorsClient
      donators={donators}
      societies={societies}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
