"use client";

import { useState } from "react";
import { createExpense, deleteExpense } from "@/lib/actions";
import { Button, Input, Modal, EmptyState, Select } from "@/components/ui";
import { Plus, Trash2, Wallet, Receipt } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type Member = { id: string; name: string };
type Expense = {
  id: string;
  name: string;
  amount: number;
  date: string;
  doneByName: string | null;
  member: { name: string } | null;
};

export function ExpensesClient({
  expenses,
  members,
  summary,
  isAdmin,
}: {
  expenses: Expense[];
  members: Member[];
  summary: {
    totalCollection: number;
    totalExpense: number;
    availableFund: number;
    totalPending: number;
  };
  isAdmin: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;
    const member = members.find((m) => m.id === data.memberId);
    if (member) data.doneByName = member.name;
    await createExpense(data);
    setModalOpen(false);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Expenses</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={18} className="inline mr-1" /> Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 text-green-600">
            <Wallet size={18} />
            <span className="text-sm">Total Collection</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(summary.totalCollection)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-red-600">
            <Receipt size={18} />
            <span className="text-sm">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(summary.totalExpense)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-mandal-saffron">
            <Wallet size={18} />
            <span className="text-sm">Available Fund</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(summary.availableFund)}</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <EmptyState message="No expenses recorded yet" />
      ) : (
        <div className="space-y-3">
          {expenses.map((ex) => (
            <div key={ex.id} className="card flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{ex.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(ex.date)}
                  {(ex.member?.name || ex.doneByName) &&
                    ` · By: ${ex.member?.name || ex.doneByName}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(ex.amount)}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => deleteExpense(ex.id)}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Expense Name" name="name" required />
          <Input label="Amount" name="amount" type="number" required />
          <Input
            label="Date"
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
          />
          <Select label="Done By (Member)" name="memberId">
            <option value="">Select Member</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Add Expense"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
