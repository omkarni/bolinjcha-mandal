"use client";

import { useState } from "react";
import { createActivity, updateActivity, deleteActivity } from "@/lib/actions";
import { Button, Input, Modal, EmptyState, Select, Textarea, Badge } from "@/components/ui";
import { Plus, Pencil, Trash2, Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils";

const STATUSES = [
  { value: "PLANNED", label: "Planned", variant: "default" as const },
  { value: "ONGOING", label: "Ongoing", variant: "warning" as const },
  { value: "COMPLETED", label: "Completed", variant: "success" as const },
];

type Activity = {
  id: string;
  name: string;
  date: string;
  location: string | null;
  description: string | null;
  status: string;
  results: string | null;
};

export function ActivitiesClient({
  activities,
  isAdmin,
}: {
  activities: Activity[];
  isAdmin: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    if (editing) await updateActivity(editing.id, data);
    else await createActivity(data);
    setModalOpen(false);
    setEditing(null);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Activities & Results</h1>
          <p className="text-sm text-gray-500 mt-1">Competitions and cultural programs</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={18} className="inline mr-1" /> Add Activity
          </Button>
        )}
      </div>

      {activities.length === 0 ? (
        <EmptyState message="No activities planned yet" />
      ) : (
        <div className="space-y-4">
          {activities.map((act) => {
            const statusInfo = STATUSES.find((s) => s.value === act.status);
            return (
              <div key={act.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{act.name}</h3>
                      <Badge variant={statusInfo?.variant || "default"}>
                        {statusInfo?.label || act.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-mandal-saffron mt-1">
                      {formatDate(act.date)}
                      {act.location && ` · ${act.location}`}
                    </p>
                    {act.description && (
                      <p className="text-sm text-gray-600 mt-2">{act.description}</p>
                    )}
                    {act.results && (
                      <div className="mt-3 p-3 bg-mandal-cream rounded-lg">
                        <div className="flex items-center gap-2 text-mandal-maroon font-medium text-sm mb-1">
                          <Trophy size={16} /> Results
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{act.results}</p>
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditing(act); setModalOpen(true); }} className="p-2 hover:bg-gray-100 rounded-lg">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteActivity(act.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? "Edit Activity" : "Add Activity"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Activity Name" name="name" required defaultValue={editing?.name} placeholder="e.g. Rangoli Competition" />
          <Input label="Date" name="date" type="date" required defaultValue={editing?.date} />
          <Input label="Location" name="location" defaultValue={editing?.location || ""} />
          <Select label="Status" name="status" defaultValue={editing?.status || "PLANNED"}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
          <Textarea label="Description" name="description" defaultValue={editing?.description || ""} />
          <Textarea
            label="Results (winners, prizes, scores)"
            name="results"
            defaultValue={editing?.results || ""}
            placeholder="1st: Society A - Rs. 5000&#10;2nd: Society B - Rs. 3000"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : editing ? "Update" : "Add Activity"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
