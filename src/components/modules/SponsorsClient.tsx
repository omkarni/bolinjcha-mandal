"use client";

import { useState } from "react";
import { createSponsor, updateSponsor, deleteSponsor } from "@/lib/actions";
import { Button, Input, Modal, EmptyState, Textarea } from "@/components/ui";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Sponsor = {
  id: string;
  name: string;
  address: string | null;
  mobile: string | null;
};

export function SponsorsClient({
  sponsors,
  isAdmin,
}: {
  sponsors: Sponsor[];
  isAdmin: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;
    if (editing) await updateSponsor(editing.id, data);
    else await createSponsor(data);
    setModalOpen(false);
    setEditing(null);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Sponsors</h1>
        {isAdmin && (
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={18} className="inline mr-1" /> Add New
          </Button>
        )}
      </div>

      {sponsors.length === 0 ? (
        <EmptyState message="No sponsors added yet" />
      ) : (
        <div className="space-y-3">
          {sponsors.map((s) => (
            <div key={s.id} className="card flex items-center justify-between group">
              <div className="flex-1">
                <h3 className="font-semibold">{s.name}</h3>
                {s.mobile && <p className="text-sm text-gray-500">{s.mobile}</p>}
                {s.address && <p className="text-xs text-gray-400 mt-1">{s.address}</p>}
              </div>
              {isAdmin && (
                <div className="flex gap-1 ml-3">
                  <button
                    onClick={() => { setEditing(s); setModalOpen(true); }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteSponsor(s.id)}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? "Edit Sponsor" : "Add Sponsor"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Sponsor Name" name="name" required defaultValue={editing?.name} />
          <Input label="Mobile" name="mobile" type="tel" defaultValue={editing?.mobile || ""} />
          <Textarea label="Address" name="address" defaultValue={editing?.address || ""} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : editing ? "Update" : "Add"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
