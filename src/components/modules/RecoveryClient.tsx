"use client";

import { useState } from "react";
import { createRecovery } from "@/lib/actions";
import { Button, Input, Modal, Badge, Select } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { GroupedCollection } from "@/lib/collection-utils";
import { HandCoins, Plus, History } from "lucide-react";

type Member = { id: string; name: string };
type RecoveryRow = {
  id: string;
  amount: number;
  date: string;
  donatorName: string;
  recoveredBy: string;
  notes: string | null;
};

export function RecoveryClient({
  pendingGroups,
  totalPending,
  yearLabel,
  members,
  recoveries,
}: {
  pendingGroups: GroupedCollection[];
  totalPending: number;
  yearLabel: string;
  members: Member[];
  recoveries: RecoveryRow[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupedCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  function openRecovery(group: GroupedCollection) {
    setSelectedGroup(group);
    setAmount(String(group.balancePending));
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedGroup) return;
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;
    data.donatorId = selectedGroup.donatorId;
    const result = await createRecovery(data);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setModalOpen(false);
    setSelectedGroup(null);
    setLoading(false);
  }

  const maxAmount = selectedGroup?.balancePending ?? 0;

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      <div>
        <h1 className="page-title">Recovery</h1>
        <p className="page-subtitle">
          Track pending vargani recovery — {yearLabel}
        </p>
      </div>

      <div className="stat-card">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
            <HandCoins size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Recovery Pending</p>
            <p className="text-3xl font-bold text-amber-600">
              {formatCurrency(totalPending)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {pendingGroups.length} donators with pending recovery
            </p>
          </div>
        </div>
      </div>

      {pendingGroups.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 font-medium">All recoveries complete!</p>
          <p className="text-sm text-gray-400 mt-1">No pending balance for this year.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingGroups.map((g) => (
            <div key={g.donatorId} className="card-elevated">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-lg">{g.donatorName}</h3>
                    <Badge variant="warning">Recovery Pending</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Paid: {formatCurrency(g.totalPaid)}
                    {g.expectedAmount != null && g.expectedAmount > 0 && (
                      <span> · Vargani: {formatCurrency(g.expectedAmount)}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xl font-bold text-amber-600">
                      {formatCurrency(g.balancePending)}
                    </p>
                    <p className="text-xs text-gray-400">pending</p>
                  </div>
                  <Button onClick={() => openRecovery(g)} className="shrink-0">
                    <Plus size={16} className="inline mr-1" />
                    Add Recovery
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="section-title w-full text-left mb-0 hover:text-mandal-saffron transition-colors"
        >
          <History size={20} className="text-mandal-saffron" />
          Recovery History ({recoveries.length})
        </button>
        {showHistory && (
          <div className="mt-4 space-y-2">
            {recoveries.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No recoveries recorded yet.</p>
            ) : (
              recoveries.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3.5 rounded-xl bg-mandal-cream/50"
                >
                  <div>
                    <p className="font-semibold">{r.donatorName}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(r.date)} · Recovered by {r.recoveredBy}
                    </p>
                    {r.notes && (
                      <p className="text-xs text-gray-400 mt-0.5">{r.notes}</p>
                    )}
                  </div>
                  <p className="font-bold text-green-600">{formatCurrency(r.amount)}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Recovery"
      >
        {selectedGroup && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-mandal-cream rounded-xl text-sm">
              <p>
                Donator: <strong>{selectedGroup.donatorName}</strong>
              </p>
              <p className="mt-1 text-amber-700 font-semibold">
                Pending recovery: {formatCurrency(selectedGroup.balancePending)}
              </p>
            </div>

            <Input
              label="Recovery Amount"
              name="amount"
              type="number"
              required
              min={1}
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-gray-400 -mt-2">
              Partial recovery allowed — remaining balance will update automatically.
            </p>

            <Select label="Recovered By (Member)" name="recoveredByMemberId" defaultValue="">
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
            <Input
              label="Or enter name (if not a member)"
              name="recoveredByName"
              placeholder="e.g. volunteer name"
            />

            <Input
              label="Date"
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
            />
            <Input label="Notes (optional)" name="notes" placeholder="Any remarks" />

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Record Recovery"}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
