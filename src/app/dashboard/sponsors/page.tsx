import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SponsorsClient } from "@/components/modules/SponsorsClient";

export default async function SponsorsPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const sponsors = await prisma.sponsor.findMany({
    where: { managementYearId: year.id },
    orderBy: { name: "asc" },
  });

  return (
    <SponsorsClient
      sponsors={sponsors}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
