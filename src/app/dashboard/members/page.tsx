import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MembersClient } from "@/components/modules/MembersClient";

export default async function MembersPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const members = await prisma.member.findMany({
    where: { managementYearId: year.id },
    orderBy: { name: "asc" },
  });

  return (
    <MembersClient
      members={members}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
