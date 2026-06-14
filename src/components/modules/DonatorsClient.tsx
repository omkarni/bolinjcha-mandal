"use client";

import { useState } from "react";
import { createDonator, updateDonator, deleteDonator } from "@/lib/actions";
import { Button, Input, Modal, EmptyState, Select } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Society = { id: string; buildingName: string };
type Donator = {
  id: string;
  name: string;
  mobile: string | null;
  expectedAmount: number | null;
  referredBy: string | null;
  society: { buildingName: string } | null;
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

  const filtered = donators.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.mobile?.includes(search)
  );

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
                  {d.expectedAmount != null && d.expectedAmount > 0 && (
                    <p className="text-sm text-mandal-saffron font-medium mt-1">
                      Vargani: {formatCurrency(d.expectedAmount)}
                    </p>
                  )}
                  {d.society && (
                    <p className="text-xs text-gray-500 mt-1">
                      {d.society.buildingName}
                    </p>
                  )}
                  {d.referredBy && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Referred by: {d.referredBy}
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
                      onClick={() => deleteDonator(d.id)}
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
          <Input label="Mobile" name="mobile" type="tel" defaultValue={editing?.mobile || ""} />
          <Input
            label="Expected Vargani (₹)"
            name="expectedAmount"
            type="number"
            placeholder="e.g. 5000"
            defaultValue={editing?.expectedAmount ?? ""}
          />
          <p className="text-xs text-gray-400 -mt-2">
            Balance will be auto-calculated: Expected − Total Paid
          </p>
          <Select label="Society" name="societyId" defaultValue="">
            <option value="">Select Society</option>
            {societies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.buildingName}
              </option>
            ))}
          </Select>
          <Input label="Referred By" name="referredBy" defaultValue={editing?.referredBy || ""} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : editing ? "Update" : "Add Donator"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
