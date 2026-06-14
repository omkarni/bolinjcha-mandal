import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentApprovalsClient } from "@/components/modules/PaymentApprovalsClient";
import { redirect } from "next/navigation";

export default async function PaymentApprovalsPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/dashboard");

  const year = await getActiveYear();
  const submissions = await prisma.paymentSubmission.findMany({
    where: { managementYearId: year.id },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const pending = submissions.filter((s) => s.status === "PENDING");
  const processed = submissions.filter((s) => s.status !== "PENDING");

  return <PaymentApprovalsClient pending={pending} processed={processed} />;
}
