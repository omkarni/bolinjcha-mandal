import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VolunteersClient } from "@/components/modules/VolunteersClient";

export default async function VolunteersPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const [volunteers, duties, members] = await Promise.all([
    prisma.volunteer.findMany({
      where: { managementYearId: year.id },
      orderBy: { name: "asc" },
    }),
    prisma.volunteerDuty.findMany({
      where: { managementYearId: year.id },
      include: { volunteer: true },
      orderBy: { date: "asc" },
    }),
    prisma.member.findMany({
      where: { managementYearId: year.id },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <VolunteersClient
      volunteers={volunteers}
      duties={duties}
      members={members}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
