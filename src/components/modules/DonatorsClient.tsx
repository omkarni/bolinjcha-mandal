"use client";

import { useState } from "react";
import { createDonator, updateDonator, deleteDonator } from "@/lib/actions";
import {
  Button,
  Input,
  Modal,
  EmptyState,
  Select,
  ConfirmDialog,
  InfoDialog,
} from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Society = { id: string; buildingName: string };
type Donator = {
  id: string;
  name: string;
  mobile: string | null;
  wing: string | null;
  flatNo: string | null;
  societyId: string | null;
  expectedAmount: number | null;
  referredBy: string | null;
  society: { buildingName: string } | null;
  paymentCount: number;
  linkedCount: number;
};

export function DonatorsClient({
  donators,
  societies,
  isAdmin,
}: {
  donators: Donator[];
  societies: Society[];
  isAdmin: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Donator | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Donator | null>(null);
  const [blockedDelete, setBlockedDelete] = useState<Donator | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = donators.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.mobile?.includes(search) ||
      d.wing?.toLowerCase().includes(search.toLowerCase()) ||
      d.flatNo?.includes(search)
  );

  function handleDeleteClick(d: Donator) {
    if (d.paymentCount > 0) {
      setBlockedDelete(d);
      return;
    }
    if (d.linkedCount > 0) {
      setBlockedDelete(d);
      return;
    }
    setConfirmDelete(d);
  }

  function blockedMessage(d: Donator) {
    if (d.paymentCount > 0) {
      return `"${d.name}" has ${d.paymentCount} payment(s) recorded. Remove all collection entries first before deleting this donator.`;
    }
    return `"${d.name}" is linked to exception or recovery records and cannot be deleted.`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;
    if (editing) await updateDonator(editing.id, data);
    else await createDonator(data);
    setModalOpen(false);
    setEditing(null);
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    const result = await deleteDonator(confirmDelete.id);
    if (result.error) {
      setConfirmDelete(null);
      setBlockedDelete(confirmDelete);
    } else {
      setConfirmDelete(null);
    }
    setDeleteLoading(false);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="page-title">Donators</h1>
          <p className="text-sm text-gray-500 mt-1">
            Set expected vargani — balance auto-calculates on payments
          </p>
        </div>
        <div className="flex gap-2">
          <input
            className="input-field max-w-xs"
            placeholder="Search donators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isAdmin && (
            <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
              <Plus size={18} className="inline mr-1" /> Add
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No donators found" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <div key={d.id} className="card group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{d.name}</h3>
                  {d.mobile && <p className="text-sm text-gray-500">{d.mobile}</p>}
                  {(d.wing || d.flatNo) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[d.wing && `Wing ${d.wing}`, d.flatNo && `Flat ${d.flatNo}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {d.expectedAmount != null && d.expectedAmount > 0 && (
                    <p className="text-sm text-mandal-saffron font-medium mt-1">
                      Vargani: {formatCurrency(d.expectedAmount)}
                    </p>
                  )}
                  {d.society && (
                    <p className="text-xs text-gray-500 mt-1">{d.society.buildingName}</p>
                  )}
                  {d.referredBy && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Referred by: {d.referredBy}
                    </p>
                  )}
                  {d.paymentCount > 0 && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      {d.paymentCount} payment(s) on record
                    </p>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditing(d); setModalOpen(true); }}
                      className="p-1.5 hover:bg-gray-100 rounded"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(d)}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? "Edit Donator" : "Add Donator"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" required defaultValue={editing?.name} />
          <Input
            label="Mobile (optional)"
            name="mobile"
            type="tel"
            defaultValue={editing?.mobile || ""}
          />
          <Select
            label="Society (optional)"
            name="societyId"
            defaultValue={editing?.societyId || ""}
          >
            <option value="">Select Society</option>
            {societies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.buildingName}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Wing (optional)"
              name="wing"
              placeholder="e.g. A"
              defaultValue={editing?.wing || ""}
            />
            <Input
              label="Flat No (optional)"
              name="flatNo"
              placeholder="e.g. 101"
              defaultValue={editing?.flatNo || ""}
            />
          </div>
          <Input
            label="Expected Vargani (₹)"
            name="expectedAmount"
            type="number"
            placeholder="e.g. 5000"
            defaultValue={editing?.expectedAmount ?? ""}
          />
          <Input label="Referred By (optional)" name="referredBy" defaultValue={editing?.referredBy || ""} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : editing ? "Update" : "Add Donator"}
          </Button>
        </form>
      </Modal>

      <InfoDialog
        open={!!blockedDelete}
        title="Cannot Delete Donator"
        message={blockedDelete ? blockedMessage(blockedDelete) : ""}
        onClose={() => setBlockedDelete(null)}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Donator?"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
