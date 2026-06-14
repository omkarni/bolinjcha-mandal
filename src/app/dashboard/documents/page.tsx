import { getActiveYear, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentsClient } from "@/components/modules/DocumentsClient";

export default async function DocumentsPage() {
  const session = await getSession();
  const year = await getActiveYear();
  const documents = await prisma.mandalDocument.findMany({
    where: { managementYearId: year.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DocumentsClient
      documents={documents}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
