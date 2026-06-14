import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { YearsClient } from "@/components/modules/YearsClient";
import { redirect } from "next/navigation";

export default async function YearsPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/dashboard");

  const years = await prisma.managementYear.findMany({
    orderBy: { year: "desc" },
    include: {
      _count: {
        select: {
          collections: true,
          expenses: true,
          donators: true,
          members: true,
        },
      },
    },
  });

  return <YearsClient years={years} />;
}
