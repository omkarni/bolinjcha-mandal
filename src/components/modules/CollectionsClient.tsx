"use client";

import { useState, useMemo } from "react";
import { createCollection, updateCollection, deleteCollection } from "@/lib/actions";
import {
  calculatePaymentBalance,
  groupCollectionsByDonator,
  sumTotalCollected,
} from "@/lib/collection-utils";
import { Button, Input, Modal, EmptyState, Select } from "@/components/ui";
import { GroupedCollectionsList } from "@/components/modules/GroupedCollectionsList";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, IndianRupee } from "lucide-react";

type DonatorInfo = {
  id: string;
  name: string;
  expectedAmount: number | null;
  totalPaid: number;
};
type Collection = {
  id: string;
  amount: number;
  date: string;
  paymentStatus: string;
  balanceAmount: number;
  donatorId: string;
  donator: { id: string; name: string; expectedAmount?: number | null };
};

export function CollectionsClient({
  collections,
  donators,
  isAdmin,
}: {
  collections: Collection[];
  donators: DonatorInfo[];
  isAdmin: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("FULL");
  const [donatorSearch, setDonatorSearch] = useState("");
  const [selectedDonator, setSelectedDonator] = useState("");
  const [showNewDonator, setShowNewDonator] = useState(false);
  const [listSearch, setListSearch] = useState("");
  const [amountInput, setAmountInput] = useState("");

  const grouped = useMemo(
    () => groupCollectionsByDonator(collections),
    [collections]
  );

  const totalCollected = useMemo(
    () => sumTotalCollected(collections),
    [collections]
  );

  const filteredGroups = useMemo(() => {
    if (!listSearch.trim()) return grouped;
    const q = listSearch.toLowerCase();
    return grouped.filter((g) => g.donatorName.toLowerCase().includes(q));
  }, [grouped, listSearch]);

  const filteredDonators = donators.filter((d) =>
    d.name.toLowerCase().includes(donatorSearch.toLowerCase())
  );

  const selectedDonatorInfo = donators.find((d) => d.id === selectedDonator);
  const editingDonatorInfo = editing
    ? donators.find((d) => d.id === editing.donatorId)
    : null;
  const activeDonator = editing ? editingDonatorInfo : selectedDonatorInfo;
  const hasExpected =
    activeDonator?.expectedAmount != null && activeDonator.expectedAmount > 0;

  const previewBalance = useMemo(() => {
    if (!activeDonator || !amountInput) return null;
    const amount = parseFloat(amountInput);
    if (isNaN(amount)) return null;
    const totalBefore = editing
      ? activeDonator.totalPaid - (editing?.amount || 0)
      : activeDonator.totalPaid;
    const manual =
      !hasExpected && paymentStatus === "PENDING"
        ? undefined
        : 0;
    return calculatePaymentBalance(
      activeDonator.expectedAmount,
      totalBefore,
      amount,
      manual,
      !hasExpected
    );
  }, [activeDonator, amountInput, editing, hasExpected, paymentStatus]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;
    data.paymentStatus = paymentStatus;
    if (showNewDonator) {
      data.newDonatorName = donatorSearch;
      data.newDonatorMobile = data.newDonatorMobile || "";
    } else {
      data.donatorId = selectedDonator;
    }
    if (editing) await updateCollection(editing.id, data);
    else await createCollection(data);
    setModalOpen(false);
    setEditing(null);
    setLoading(false);
    setDonatorSearch("");
    setSelectedDonator("");
    setShowNewDonator(false);
    setAmountInput("");
  }

  function openEdit(paymentId: string) {
    const c = collections.find((x) => x.id === paymentId);
    if (c) {
      setEditing(c);
      setPaymentStatus(c.paymentStatus);
      setAmountInput(String(c.amount));
      setModalOpen(true);
    }
  }

  function openAdd() {
    setEditing(null);
    setPaymentStatus("FULL");
    setAmountInput("");
    setDonatorSearch("");
    setSelectedDonator("");
    setShowNewDonator(false);
    setModalOpen(true);
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="page-title">Collections</h1>
          <p className="text-sm text-gray-500 mt-1">
            Grouped by donator — balance auto-calculated from expected vargani
          </p>
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus size={18} className="inline mr-1" /> Add Collection
        </Button>
      </div>

      <div className="stat-card mb-4">
        <div className="flex items-center gap-2 text-green-600 mb-1">
          <IndianRupee size={20} />
          <span className="text-sm font-medium">Total Collection (This Year)</span>
        </div>
        <p className="text-3xl font-bold text-gray-800">
          {formatCurrency(totalCollected)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {grouped.length} donators &middot; {collections.length} payments
        </p>
      </div>

      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          className="input-field pl-10"
          placeholder="Search donator by name..."
          value={listSearch}
          onChange={(e) => setListSearch(e.target.value)}
        />
      </div>

      {collections.length === 0 ? (
        <EmptyState message="No collections recorded yet" />
      ) : filteredGroups.length === 0 ? (
        <EmptyState message={`No donators matching "${listSearch}"`} />
      ) : (
        <GroupedCollectionsList
          groups={filteredGroups}
          isAdmin={isAdmin}
          onEdit={(id) => openEdit(id)}
          onDelete={(id) => deleteCollection(id)}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Payment" : "Add Collection"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Donator Name
              </label>
              <input
                className="input-field"
                placeholder="Search donator..."
                value={donatorSearch}
                onChange={(e) => {
                  setDonatorSearch(e.target.value);
                  setShowNewDonator(false);
                  setSelectedDonator("");
                }}
              />
              {donatorSearch && !showNewDonator && (
                <div className="border rounded-lg max-h-36 overflow-y-auto">
                  {filteredDonators.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-mandal-cream ${
                        selectedDonator === d.id ? "bg-mandal-cream font-medium" : ""
                      }`}
                      onClick={() => {
                        setSelectedDonator(d.id);
                        setDonatorSearch(d.name);
                      }}
                    >
                      {d.name}
                      {d.expectedAmount
                        ? ` · Vargani ${formatCurrency(d.expectedAmount)}`
                        : ""}
                    </button>
                  ))}
                  {filteredDonators.length === 0 && (
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm text-mandal-saffron font-medium"
                      onClick={() => setShowNewDonator(true)}
                    >
                      + Add &quot;{donatorSearch}&quot; as new donator
                    </button>
                  )}
                </div>
              )}
              {showNewDonator && (
                <>
                  <Input label="Mobile (optional)" name="newDonatorMobile" type="tel" />
                  <Input
                    label="Expected Vargani (optional)"
                    name="newDonatorExpected"
                    type="number"
                    placeholder="e.g. 5000 — balance auto-calculated"
                  />
                </>
              )}
            </div>
          )}

          {editing && (
            <p className="text-sm text-gray-500 bg-mandal-cream p-3 rounded-lg">
              Editing payment for <strong>{editing.donator.name}</strong>
              {hasExpected && (
                <span className="block text-xs mt-1">
                  Expected vargani: {formatCurrency(activeDonator!.expectedAmount!)}
                </span>
              )}
            </p>
          )}

          {selectedDonatorInfo?.expectedAmount && !editing && (
            <p className="text-sm bg-mandal-cream p-3 rounded-lg text-mandal-maroon">
              Expected vargani: <strong>{formatCurrency(selectedDonatorInfo.expectedAmount)}</strong>
              {" · "}Already paid: {formatCurrency(selectedDonatorInfo.totalPaid)}
            </p>
          )}

          <Input
            label="Amount"
            name="amount"
            type="number"
            required
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
          />

          {hasExpected && previewBalance && (
            <div className="p-3 bg-green-50 rounded-lg text-sm">
              <p>
                Remaining balance after this payment:{" "}
                <strong className="text-amber-600">
                  {formatCurrency(previewBalance.balanceAmount)}
                </strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">Auto-calculated from expected vargani</p>
            </div>
          )}

          {!hasExpected && (
            <>
              <Select
                label="Payment Status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="FULL">Paid Full</option>
                <option value="PENDING">Balance Pending (manual)</option>
              </Select>
              {paymentStatus === "PENDING" && (
                <Input
                  label="Remaining Balance (manual)"
                  name="balanceAmount"
                  type="number"
                  required
                  defaultValue={editing?.balanceAmount}
                  placeholder="For fresh donators without expected vargani"
                />
              )}
            </>
          )}

          <Input
            label="Date"
            name="date"
            type="date"
            required
            defaultValue={editing?.date || new Date().toISOString().split("T")[0]}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : editing ? "Update" : "Add Collection"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
