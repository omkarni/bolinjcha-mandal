import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InventoryClient } from "@/components/modules/InventoryClient";

export default async function InventoryPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const items = await prisma.inventoryItem.findMany({
    where: { managementYearId: year.id },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <InventoryClient items={items} isAdmin={session?.role === "ADMIN"} />
  );
}
