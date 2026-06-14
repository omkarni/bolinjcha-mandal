"use client";

import { useState } from "react";
import {
  createBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
  createBudgetRequest,
  reviewBudgetRequest,
} from "@/lib/actions";
import { Button, Input, Modal, EmptyState, Select, Textarea, Badge } from "@/components/ui";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type BudgetRequest = {
  id: string;
  requestedAmount: number;
  reason: string;
  status: string;
  requestedBy: string | null;
  reviewedBy: string | null;
  reviewNote: string | null;
  category: { name: string };
};

type Category = {
  id: string;
  name: string;
  allocatedAmount: number;
  requests: { status: string; requestedAmount: number }[];
};

export function BudgetClient({
  categories,
  requests,
  isAdmin,
}: {
  categories: Category[];
  requests: BudgetRequest[];
  isAdmin: boolean;
}) {
  const [catModal, setCatModal] = useState(false);
  const [reqModal, setReqModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  const approvedByCategory = categories.map((cat) => {
    const approved = cat.requests
      .filter((r) => r.status === "APPROVED")
      .reduce((s, r) => s + r.requestedAmount, 0);
    return { ...cat, used: approved, remaining: cat.allocatedAmount - approved };
  });

  async function handleCatSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    if (editing) await updateBudgetCategory(editing.id, data);
    else await createBudgetCategory(data);
    setCatModal(false);
    setEditing(null);
    setLoading(false);
  }

  async function handleReqSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    await createBudgetRequest(data);
    setReqModal(false);
    setLoading(false);
  }

  const statusVariant = (s: string) =>
    s === "APPROVED" ? "success" : s === "REJECTED" ? "danger" : "warning";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Budget Planning</h1>
          <p className="text-sm text-gray-500 mt-1">Category limits & approval flow</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setReqModal(true)}>
            <Plus size={16} className="inline mr-1" /> Request
          </Button>
          {isAdmin && (
            <Button onClick={() => { setEditing(null); setCatModal(true); }}>
              <Plus size={16} className="inline mr-1" /> Add Category
            </Button>
          )}
        </div>
      </div>

      {approvedByCategory.length === 0 ? (
        <EmptyState message="No budget categories set up yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedByCategory.map((cat) => (
            <div key={cat.id} className="stat-card relative">
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-1">
                  <button onClick={() => { setEditing(cat); setCatModal(true); }} className="p-1 hover:bg-gray-100 rounded">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteBudgetCategory(cat.id)} className="p-1 hover:bg-red-50 text-red-500 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
              <h3 className="font-semibold text-mandal-maroon">{cat.name}</h3>
              <p className="text-2xl font-bold mt-1">{formatCurrency(cat.allocatedAmount)}</p>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Approved</span>
                  <span>{formatCurrency(cat.used)}</span>
                </div>
                <div className="flex justify-between font-medium text-green-600">
                  <span>Remaining</span>
                  <span>{formatCurrency(cat.remaining)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                  <div
                    className="bg-mandal-saffron h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (cat.used / cat.allocatedAmount) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-mandal-maroon mb-4">Approval Requests</h2>
        {requests.length === 0 ? (
          <EmptyState message="No budget requests yet" />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{req.category.name}</h3>
                      <Badge variant={statusVariant(req.status)}>{req.status}</Badge>
                    </div>
                    <p className="text-lg font-bold text-mandal-saffron mt-1">
                      {formatCurrency(req.requestedAmount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{req.reason}</p>
                    {req.requestedBy && (
                      <p className="text-xs text-gray-400 mt-1">Requested by: {req.requestedBy}</p>
                    )}
                    {req.reviewNote && (
                      <p className="text-xs text-gray-500 mt-1">Note: {req.reviewNote}</p>
                    )}
                  </div>
                  {isAdmin && req.status === "PENDING" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => reviewBudgetRequest(req.id, "APPROVED")}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => reviewBudgetRequest(req.id, "REJECTED")}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={catModal} onClose={() => { setCatModal(false); setEditing(null); }} title={editing ? "Edit Category" : "Add Budget Category"}>
        <form onSubmit={handleCatSubmit} className="space-y-4">
          <Input label="Category Name" name="name" required defaultValue={editing?.name} placeholder="e.g. Decoration, Prasad" />
          <Input label="Allocated Amount" name="allocatedAmount" type="number" required defaultValue={editing?.allocatedAmount} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : editing ? "Update" : "Add Category"}
          </Button>
        </form>
      </Modal>

      <Modal open={reqModal} onClose={() => setReqModal(false)} title="Request Budget Approval">
        <form onSubmit={handleReqSubmit} className="space-y-4">
          <Select label="Category" name="categoryId" required>
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Input label="Requested Amount" name="requestedAmount" type="number" required />
          <Textarea label="Reason" name="reason" required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
