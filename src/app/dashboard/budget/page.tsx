import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BudgetClient } from "@/components/modules/BudgetClient";

export default async function BudgetPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const [categories, requests] = await Promise.all([
    prisma.budgetCategory.findMany({
      where: { managementYearId: year.id },
      include: { requests: true },
      orderBy: { name: "asc" },
    }),
    prisma.budgetRequest.findMany({
      where: { managementYearId: year.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <BudgetClient
      categories={categories}
      requests={requests}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
