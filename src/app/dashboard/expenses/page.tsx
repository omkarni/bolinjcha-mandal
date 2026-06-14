import { getActiveYear, getSession } from "@/lib/auth";
import { getFinancialSummary } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { ExpensesClient } from "@/components/modules/ExpensesClient";

export default async function ExpensesPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const [expenses, members, summary] = await Promise.all([
    prisma.expense.findMany({
      where: { managementYearId: year.id },
      include: { member: true },
      orderBy: { date: "desc" },
    }),
    prisma.member.findMany({
      where: { managementYearId: year.id },
      orderBy: { name: "asc" },
    }),
    getFinancialSummary(year.id),
  ]);

  return (
    <ExpensesClient
      expenses={expenses}
      members={members}
      summary={summary}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
