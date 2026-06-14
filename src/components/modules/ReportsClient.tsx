"use client";

import { formatCurrency } from "@/lib/utils";
import {
  FileSpreadsheet,
  Download,
  TrendingUp,
  Receipt,
  Users,
  HandCoins,
  IndianRupee,
} from "lucide-react";

type Summary = {
  totalCollection: number;
  totalExpense: number;
  totalPending: number;
  availableFund: number;
  recoveryCount: number;
  totalRecovered: number;
};

const exports = [
  {
    type: "collections",
    label: "Collections",
    desc: "All donation payments with donator details",
    icon: IndianRupee,
    color: "from-green-500 to-emerald-600",
  },
  {
    type: "members",
    label: "Members",
    desc: "Member list with designation and fees",
    icon: Users,
    color: "from-blue-500 to-indigo-600",
  },
  {
    type: "expenses",
    label: "Expenses",
    desc: "All mandal expenses for the year",
    icon: Receipt,
    color: "from-red-500 to-rose-600",
  },
  {
    type: "recovery",
    label: "Recovery Report",
    desc: "Field recovery records with recovered-by",
    icon: HandCoins,
    color: "from-amber-500 to-orange-500",
  },
  {
    type: "pnl",
    label: "P&L Summary",
    desc: "Profit & loss — collection vs expenses",
    icon: TrendingUp,
    color: "from-mandal-saffron to-mandal-gold",
  },
];

export function ReportsClient({
  yearLabel,
  summary,
}: {
  yearLabel: string;
  summary: Summary;
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Export data & financial summaries — {yearLabel}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-500">Total Collection</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(summary.totalCollection)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {formatCurrency(summary.totalExpense)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">Net Fund (P&L)</p>
          <p className="text-2xl font-bold text-mandal-saffron mt-1">
            {formatCurrency(summary.availableFund)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">Recovery Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {formatCurrency(summary.totalPending)}
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">
          <FileSpreadsheet size={20} className="text-mandal-saffron" />
          P&L Overview
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Total Collection</span>
            <span className="font-semibold text-green-600">
              + {formatCurrency(summary.totalCollection)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Total Expenses</span>
            <span className="font-semibold text-red-600">
              − {formatCurrency(summary.totalExpense)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Recovery Pending (not yet collected)</span>
            <span className="font-semibold text-amber-600">
              {formatCurrency(summary.totalPending)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Total Recovered (field collections)</span>
            <span className="font-semibold text-green-700">
              {formatCurrency(summary.totalRecovered)} ({summary.recoveryCount} records)
            </span>
          </div>
          <div className="flex justify-between py-3 bg-mandal-cream rounded-xl px-4 mt-2">
            <span className="font-semibold text-mandal-maroon">Net Available Fund</span>
            <span className="font-bold text-lg text-mandal-saffron">
              {formatCurrency(summary.availableFund)}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="section-title">
          <Download size={20} className="text-mandal-saffron" />
          Export CSV
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exports.map((exp) => {
            const Icon = exp.icon;
            return (
              <a
                key={exp.type}
                href={`/api/export/${exp.type}`}
                download
                className="card-elevated flex items-start gap-4 group"
              >
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${exp.color} text-white shadow-md shrink-0`}
                >
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-mandal-maroon group-hover:text-mandal-saffron transition-colors">
                    {exp.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{exp.desc}</p>
                  <p className="text-xs text-mandal-saffron font-medium mt-2 flex items-center gap-1">
                    <Download size={12} /> Download CSV
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
