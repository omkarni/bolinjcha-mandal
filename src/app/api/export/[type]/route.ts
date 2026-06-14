import { NextRequest, NextResponse } from "next/server";
import { getSession, getActiveYear } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  groupCollectionsByDonator,
  sumGroupedPending,
  sumTotalCollected,
} from "@/lib/collection-utils";
import type { CollectionRow } from "@/lib/collection-utils";

function toCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? "");
          if (s.includes(",") || s.includes('"') || s.includes("\n")) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(",")
    )
    .join("\n");
}

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const year = await getActiveYear();
  const type = params.type;
  let csv = "";
  let filename = `export-${type}-${year.year}.csv`;

  if (type === "collections") {
    const collections = await prisma.collection.findMany({
      where: { managementYearId: year.id },
      include: { donator: { include: { society: true } } },
      orderBy: { date: "desc" },
    });
    const rows: string[][] = [
      ["Donator", "Society", "Wing", "Flat", "Mobile", "Amount", "Date", "Status", "Balance"],
    ];
    for (const c of collections) {
      rows.push([
        c.donator.name,
        c.donator.society?.buildingName || "",
        c.donator.wing || "",
        c.donator.flatNo || "",
        c.donator.mobile || "",
        String(c.amount),
        c.date,
        c.paymentStatus,
        String(c.balanceAmount),
      ]);
    }
    csv = toCsv(rows);
  } else if (type === "members") {
    const members = await prisma.member.findMany({
      where: { managementYearId: year.id },
      orderBy: { name: "asc" },
    });
    const rows: string[][] = [
      ["Name", "Designation", "Mobile", "DOB", "Address", "Membership Fee Paid", "Fee Amount"],
    ];
    for (const m of members) {
      rows.push([
        m.name,
        m.designation,
        m.mobile || "",
        m.dob || "",
        m.address || "",
        m.membershipFeePaid ? "Yes" : "No",
        String(m.membershipFeeAmount),
      ]);
    }
    csv = toCsv(rows);
  } else if (type === "expenses") {
    const expenses = await prisma.expense.findMany({
      where: { managementYearId: year.id },
      include: { member: true },
      orderBy: { date: "desc" },
    });
    const rows: string[][] = [["Name", "Amount", "Date", "Done By", "Member"]];
    for (const e of expenses) {
      rows.push([
        e.name,
        String(e.amount),
        e.date,
        e.doneByName || "",
        e.member?.name || "",
      ]);
    }
    csv = toCsv(rows);
  } else if (type === "recovery") {
    const recoveries = await prisma.recovery.findMany({
      where: { managementYearId: year.id },
      include: { donator: true, recoveredByMember: true },
      orderBy: { date: "desc" },
    });
    const rows: string[][] = [
      ["Donator", "Amount", "Date", "Recovered By", "Notes"],
    ];
    for (const r of recoveries) {
      rows.push([
        r.donator.name,
        String(r.amount),
        r.date,
        r.recoveredByMember?.name || r.recoveredByName || "",
        r.notes || "",
      ]);
    }
    csv = toCsv(rows);
  } else if (type === "pnl") {
    const [collections, expenses] = await Promise.all([
      prisma.collection.findMany({
        where: { managementYearId: year.id },
        include: { donator: true },
      }),
      prisma.expense.findMany({ where: { managementYearId: year.id } }),
    ]);
    const totalCollection = sumTotalCollected(collections);
    const totalPending = sumGroupedPending(
      groupCollectionsByDonator(collections as CollectionRow[])
    );
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const netFund = totalCollection - totalExpense;
    csv = toCsv([
      ["Report", "Value (INR)", "Year"],
      ["Total Collection", String(totalCollection), year.label],
      ["Total Expenses", String(totalExpense), year.label],
      ["Net Fund (Collection - Expenses)", String(netFund), year.label],
      ["Recovery Pending", String(totalPending), year.label],
      ["Available Fund", String(netFund), year.label],
    ]);
    filename = `pnl-report-${year.year}.csv`;
  } else {
    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
