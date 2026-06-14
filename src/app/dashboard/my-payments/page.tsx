import { getActiveYear, getSession } from "@/lib/auth";
import { getUserPayments } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { MyPaymentsClient } from "@/components/modules/MyPaymentsClient";

export default async function MyPaymentsPage() {
  const session = await getSession();
  const year = await getActiveYear();

  if (!session) return null;

  const [{ collections, totalPaid, totalPending, donators }, submissions] =
    await Promise.all([
      getUserPayments(session.id, year.id),
      prisma.paymentSubmission.findMany({
        where: { userId: session.id, managementYearId: year.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const primaryDonator = donators[0];

  return (
    <MyPaymentsClient
      collections={collections}
      submissions={submissions}
      totalPaid={totalPaid}
      totalPending={totalPending}
      yearLabel={year.label}
      userMobile={session.mobile}
      expectedAmount={primaryDonator?.expectedAmount ?? null}
    />
  );
}
