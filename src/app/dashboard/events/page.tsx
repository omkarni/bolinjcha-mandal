import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EventsClient } from "@/components/modules/EventsClient";

export default async function EventsPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const events = await prisma.event.findMany({
    where: { managementYearId: year.id },
    orderBy: { date: "asc" },
  });

  return (
    <EventsClient events={events} isAdmin={session?.role === "ADMIN"} />
  );
}
