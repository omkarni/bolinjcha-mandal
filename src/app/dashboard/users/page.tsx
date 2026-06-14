import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersClient } from "@/components/modules/UsersClient";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: [{ isApproved: "asc" }, { createdAt: "desc" }],
  });

  return <UsersClient users={users} />;
}
