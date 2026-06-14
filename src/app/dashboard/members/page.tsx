import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MembersClient } from "@/components/modules/MembersClient";

export default async function MembersPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const members = await prisma.member.findMany({
    where: { managementYearId: year.id },
    include: {
      _count: { select: { expenses: true, volunteerDuties: true, recoveries: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <MembersClient
      members={members.map((m) => ({
        id: m.id,
        name: m.name,
        designation: m.designation,
        dob: m.dob,
        mobile: m.mobile,
        address: m.address,
        profilePic: m.profilePic,
        linkedCount:
          m._count.expenses + m._count.volunteerDuties + m._count.recoveries,
        expenseCount: m._count.expenses,
        recoveryCount: m._count.recoveries,
      }))}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
