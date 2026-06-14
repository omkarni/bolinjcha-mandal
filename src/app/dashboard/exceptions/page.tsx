import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExceptionsClient } from "@/components/modules/ExceptionsClient";

export default async function ExceptionsPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const [exceptions, donators] = await Promise.all([
    prisma.donatorException.findMany({
      where: { managementYearId: year.id },
      include: { donator: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.donator.findMany({
      where: { managementYearId: year.id },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <ExceptionsClient
      exceptions={exceptions}
      donators={donators}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
