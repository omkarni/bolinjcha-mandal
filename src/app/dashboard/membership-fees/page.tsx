import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MembershipFeesClient } from "@/components/modules/MembershipFeesClient";
import { redirect } from "next/navigation";

export default async function MembershipFeesPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/dashboard");

  const year = await getActiveYear();
  const members = await prisma.member.findMany({
    where: { managementYearId: year.id },
    orderBy: [{ membershipFeePaid: "asc" }, { name: "asc" }],
  });

  return <MembershipFeesClient members={members} />;
}
