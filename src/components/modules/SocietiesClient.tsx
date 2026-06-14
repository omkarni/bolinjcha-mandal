"use client";

import { useState } from "react";
import { createSociety, updateSociety, deleteSociety } from "@/lib/actions";
import { Button, Input, Modal, EmptyState, Textarea, ConfirmDialog } from "@/components/ui";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Society = {
  id: string;
  buildingName: string;
  address: string | null;
  secretary: string | null;
  chairman: string | null;
  totalFlats: number | null;
};

export function SocietiesClient({
  societies,
  isAdmin,
}: {
  societies: Society[];
  isAdmin: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Society | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Society | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;
    if (editing) await updateSociety(editing.id, data);
    else await createSociety(data);
    setModalOpen(false);
    setEditing(null);
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    setDeleteError("");
    const result = await deleteSociety(confirmDelete.id);
    if (result.error) setDeleteError(result.error);
    else setConfirmDelete(null);
    setDeleteLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Societies</h1>
        {isAdmin && (
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={18} className="inline mr-1" /> Add New
          </Button>
        )}
      </div>

      {deleteError && (
        <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl">
          {deleteError}
        </div>
      )}

      {societies.length === 0 ? (
        <EmptyState message="No societies added yet" />
      ) : (
        <div className="space-y-3">
          {societies.map((s) => (
            <div key={s.id} className="card flex items-center justify-between group">
              <div className="flex-1">
                <h3 className="font-semibold">{s.buildingName}</h3>
                <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                  {s.secretary && <p>Secretary: {s.secretary}</p>}
                  {s.chairman && <p>Chairman: {s.chairman}</p>}
                  {s.totalFlats != null && <p>Flats: {s.totalFlats}</p>}
                </div>
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
                    onClick={() => { setDeleteError(""); setConfirmDelete(s); }}
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
        title={editing ? "Edit Society" : "Add Society"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Building Name" name="buildingName" required defaultValue={editing?.buildingName} />
          <Textarea label="Address" name="address" defaultValue={editing?.address || ""} />
          <Input label="Secretary" name="secretary" defaultValue={editing?.secretary || ""} />
          <Input label="Chairman" name="chairman" defaultValue={editing?.chairman || ""} />
          <Input
            label="Total Flats"
            name="totalFlats"
            type="number"
            defaultValue={editing?.totalFlats?.toString() || ""}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : editing ? "Update" : "Add"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Society?"
        message={`Delete "${confirmDelete?.buildingName}"? Societies with linked donators cannot be deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
