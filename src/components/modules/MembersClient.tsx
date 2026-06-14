"use client";

import { useState } from "react";
import { createMember, updateMember, deleteMember } from "@/lib/actions";
import { Button, Input, Modal, EmptyState, Textarea, ConfirmDialog, InfoDialog } from "@/components/ui";
import { Plus, Pencil, Trash2, Phone, MapPin } from "lucide-react";

type Member = {
  id: string;
  name: string;
  designation: string;
  dob: string | null;
  mobile: string | null;
  address: string | null;
  profilePic: string | null;
  linkedCount: number;
  expenseCount: number;
  recoveryCount: number;
};

export function MembersClient({
  members,
  isAdmin,
}: {
  members: Member[];
  isAdmin: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Member | null>(null);
  const [blockedDelete, setBlockedDelete] = useState<Member | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function handleDeleteClick(m: Member) {
    if (m.linkedCount > 0) {
      setBlockedDelete(m);
      return;
    }
    setConfirmDelete(m);
  }

  function blockedMessage(m: Member) {
    const parts: string[] = [];
    if (m.expenseCount > 0) parts.push(`${m.expenseCount} expense(s)`);
    if (m.recoveryCount > 0) parts.push(`${m.recoveryCount} recovery record(s)`);
    const extra = m.linkedCount - m.expenseCount - m.recoveryCount;
    if (extra > 0) parts.push(`${extra} volunteer duty record(s)`);
    return `"${m.name}" is linked to ${parts.join(", ")}. Remove those records first before deleting this member.`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;
    if (editing) await updateMember(editing.id, data);
    else await createMember(data);
    setModalOpen(false);
    setEditing(null);
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    const result = await deleteMember(confirmDelete.id);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Members</h1>
        {isAdmin && (
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={18} className="inline mr-1" /> Add Member
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <EmptyState message="No members added yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div key={m.id} className="card group">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mandal-saffron to-mandal-gold flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {m.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{m.name}</h3>
                  <p className="text-sm text-mandal-saffron">{m.designation}</p>
                  {m.mobile && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Phone size={12} /> {m.mobile}
                    </p>
                  )}
                  {m.address && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {m.address}
                    </p>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditing(m); setModalOpen(true); }}
                      className="p-1.5 hover:bg-gray-100 rounded"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(m)}
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
        title={editing ? "Edit Member" : "Add Member"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" required defaultValue={editing?.name} />
          <Input label="Designation" name="designation" required defaultValue={editing?.designation} />
          <Input label="Date of Birth" name="dob" type="date" defaultValue={editing?.dob || ""} />
          <Input label="Mobile" name="mobile" type="tel" defaultValue={editing?.mobile || ""} />
          <Textarea label="Address" name="address" defaultValue={editing?.address || ""} />
          <Input label="Profile Pic URL" name="profilePic" defaultValue={editing?.profilePic || ""} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : editing ? "Update" : "Add Member"}
          </Button>
        </form>
      </Modal>

      <InfoDialog
        open={!!blockedDelete}
        title="Cannot Delete Member"
        message={blockedDelete ? blockedMessage(blockedDelete) : ""}
        onClose={() => setBlockedDelete(null)}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Member?"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
