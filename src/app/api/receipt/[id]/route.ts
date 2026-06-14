import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collection = await prisma.collection.findUnique({
    where: { id: params.id },
    include: { donator: true, managementYear: true },
  });

  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.role !== "ADMIN") {
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user?.mobile || collection.donator.mobile !== user.mobile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const doc = new jsPDF();
  const mandalName = "Bolinjcha Vighnaharta Sarvajanik Utsav Mandal";

  doc.setFillColor(255, 107, 0);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("Donation Receipt", 105, 18, { align: "center" });
  doc.setFontSize(10);
  doc.text(mandalName, 105, 28, { align: "center" });
  doc.text(collection.managementYear.label, 105, 35, { align: "center" });

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(11);
  let y = 55;

  const rows = [
    ["Receipt No.", collection.id.slice(-8).toUpperCase()],
    ["Date", collection.date],
    ["Donator Name", collection.donator.name],
    ["Amount", `Rs. ${collection.amount.toLocaleString("en-IN")}`],
    [
      "Payment Status",
      collection.paymentStatus === "FULL" ? "Paid in Full" : "Balance Pending",
    ],
  ];

  if (collection.paymentStatus === "PENDING") {
    rows.push(["Balance Due", `Rs. ${collection.balanceAmount.toLocaleString("en-IN")}`]);
  }

  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), 80, y);
    y += 10;
  });

  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Thank you for your generous contribution!", 105, y, { align: "center" });
  doc.text("Ganpati Bappa Morya!", 105, y + 8, { align: "center" });

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${collection.id.slice(-8)}.pdf"`,
    },
  });
}
