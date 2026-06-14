import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActivitiesClient } from "@/components/modules/ActivitiesClient";

export default async function ActivitiesPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const activities = await prisma.activity.findMany({
    where: { managementYearId: year.id },
    orderBy: { date: "desc" },
  });

  return (
    <ActivitiesClient
      activities={activities}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
