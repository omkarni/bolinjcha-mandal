"use client";

import { useState } from "react";
import {
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  createVolunteerDuty,
  deleteVolunteerDuty,
} from "@/lib/actions";
import { Button, Input, Modal, EmptyState, Select, Textarea } from "@/components/ui";
import { Plus, Pencil, Trash2, UserCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Volunteer = { id: string; name: string; mobile: string | null };
type Duty = {
  id: string;
  dutyTitle: string;
  date: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  location: string | null;
  notes: string | null;
  volunteer: { name: string };
};
type Member = { id: string; name: string };

export function VolunteersClient({
  volunteers,
  duties,
  members,
  isAdmin,
}: {
  volunteers: Volunteer[];
  duties: Duty[];
  members: Member[];
  isAdmin: boolean;
}) {
  const [volModal, setVolModal] = useState(false);
  const [dutyModal, setDutyModal] = useState(false);
  const [editing, setEditing] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVolunteerSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    if (editing) await updateVolunteer(editing.id, data);
    else await createVolunteer(data);
    setVolModal(false);
    setEditing(null);
    setLoading(false);
  }

  async function handleDutySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    await createVolunteerDuty(data);
    setDutyModal(false);
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="page-title">Volunteer Roster</h1>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setDutyModal(true)}>
                <Plus size={16} className="inline mr-1" /> Assign Duty
              </Button>
              <Button onClick={() => { setEditing(null); setVolModal(true); }}>
                <Plus size={16} className="inline mr-1" /> Add Volunteer
              </Button>
            </div>
          )}
        </div>

        {volunteers.length === 0 ? (
          <EmptyState message="No volunteers added yet" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {volunteers.map((v) => (
              <div key={v.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-mandal-cream rounded-lg">
                    <UserCheck size={18} className="text-mandal-maroon" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{v.name}</h3>
                    {v.mobile && <p className="text-xs text-gray-500">{v.mobile}</p>}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(v); setVolModal(true); }} className="p-1.5 hover:bg-gray-100 rounded">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteVolunteer(v.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-mandal-maroon mb-4">Duty Schedule</h2>
        {duties.length === 0 ? (
          <EmptyState message="No duties assigned yet" />
        ) : (
          <div className="space-y-3">
            {duties.map((d) => (
              <div key={d.id} className="card flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{d.dutyTitle}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="text-mandal-saffron font-medium">{d.volunteer.name}</span>
                    {" · "}{formatDate(d.date)}
                    {d.shiftStart && ` · ${d.shiftStart}${d.shiftEnd ? ` - ${d.shiftEnd}` : ""}`}
                  </p>
                  {d.location && <p className="text-xs text-gray-500 mt-0.5">{d.location}</p>}
                </div>
                {isAdmin && (
                  <button onClick={() => deleteVolunteerDuty(d.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={volModal} onClose={() => { setVolModal(false); setEditing(null); }} title={editing ? "Edit Volunteer" : "Add Volunteer"}>
        <form onSubmit={handleVolunteerSubmit} className="space-y-4">
          <Input label="Name" name="name" required defaultValue={editing?.name} />
          <Input label="Mobile" name="mobile" type="tel" defaultValue={editing?.mobile || ""} />
          <Select label="Link to Member (optional)" name="memberId" defaultValue="">
            <option value="">None</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : editing ? "Update" : "Add Volunteer"}
          </Button>
        </form>
      </Modal>

      <Modal open={dutyModal} onClose={() => setDutyModal(false)} title="Assign Duty">
        <form onSubmit={handleDutySubmit} className="space-y-4">
          <Select label="Volunteer" name="volunteerId" required>
            <option value="">Select Volunteer</option>
            {volunteers.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </Select>
          <Input label="Duty Title" name="dutyTitle" required placeholder="e.g. Aarti Duty, Security" />
          <Input label="Date" name="date" type="date" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Shift Start" name="shiftStart" type="time" />
            <Input label="Shift End" name="shiftEnd" type="time" />
          </div>
          <Input label="Location" name="location" />
          <Textarea label="Notes" name="notes" />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Assign Duty"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
