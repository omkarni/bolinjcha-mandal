import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QrDonationsClient } from "@/components/modules/QrDonationsClient";

export default async function QrDonationsPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const qrCodes = await prisma.qrDonation.findMany({
    where: { managementYearId: year.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <QrDonationsClient qrCodes={qrCodes} isAdmin={session?.role === "ADMIN"} />
  );
}
