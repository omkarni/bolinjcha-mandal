import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SocietiesClient } from "@/components/modules/SocietiesClient";

export default async function SocietiesPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const societies = await prisma.society.findMany({
    where: { managementYearId: year.id },
    orderBy: { buildingName: "asc" },
  });

  return (
    <SocietiesClient
      societies={societies}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
