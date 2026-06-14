"use client";

import { useState } from "react";
import { createEvent, updateEvent, deleteEvent } from "@/lib/actions";
import { Button, Input, Modal, EmptyState, Select, Textarea, Badge } from "@/components/ui";
import { Plus, Pencil, Trash2, MapPin, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

const EVENT_TYPES = [
  { value: "AARTI", label: "Aarti" },
  { value: "VISARJAN", label: "Visarjan" },
  { value: "CULTURAL", label: "Cultural Program" },
  { value: "POOJA", label: "Pooja" },
  { value: "OTHER", label: "Other" },
];

const TYPE_COLORS: Record<string, "default" | "success" | "warning" | "danger"> = {
  AARTI: "warning",
  VISARJAN: "danger",
  CULTURAL: "success",
  POOJA: "default",
  OTHER: "default",
};

type Event = {
  id: string;
  title: string;
  eventType: string;
  date: string;
  time: string | null;
  location: string | null;
  description: string | null;
};

export function EventsClient({
  events,
  isAdmin,
}: {
  events: Event[];
  isAdmin: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    if (editing) await updateEvent(editing.id, data);
    else await createEvent(data);
    setModalOpen(false);
    setEditing(null);
    setLoading(false);
  }

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Event Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Aarti, Visarjan & cultural programs</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={18} className="inline mr-1" /> Add Event
          </Button>
        )}
      </div>

      {sorted.length === 0 ? (
        <EmptyState message="No events scheduled yet" />
      ) : (
        <div className="space-y-3">
          {sorted.map((ev) => (
            <div key={ev.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{ev.title}</h3>
                    <Badge variant={TYPE_COLORS[ev.eventType] || "default"}>
                      {EVENT_TYPES.find((t) => t.value === ev.eventType)?.label || ev.eventType}
                    </Badge>
                  </div>
                  <p className="text-sm text-mandal-saffron font-medium">{formatDate(ev.date)}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    {ev.time && (
                      <span className="flex items-center gap-1"><Clock size={14} /> {ev.time}</span>
                    )}
                    {ev.location && (
                      <span className="flex items-center gap-1"><MapPin size={14} /> {ev.location}</span>
                    )}
                  </div>
                  {ev.description && (
                    <p className="text-sm text-gray-600 mt-2">{ev.description}</p>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setEditing(ev); setModalOpen(true); }} className="p-2 hover:bg-gray-100 rounded-lg">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => deleteEvent(ev.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? "Edit Event" : "Add Event"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" required defaultValue={editing?.title} />
          <Select label="Event Type" name="eventType" defaultValue={editing?.eventType || "AARTI"}>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
          <Input label="Date" name="date" type="date" required defaultValue={editing?.date} />
          <Input label="Time" name="time" type="time" defaultValue={editing?.time || ""} />
          <Input label="Location" name="location" defaultValue={editing?.location || ""} />
          <Textarea label="Description" name="description" defaultValue={editing?.description || ""} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : editing ? "Update" : "Add Event"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
