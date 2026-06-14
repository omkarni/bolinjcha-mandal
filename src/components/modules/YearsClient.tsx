"use client";

import { useState } from "react";
import { createNewYear, switchYear } from "@/lib/actions";
import { Button, Input, Badge } from "@/components/ui";
import { Calendar, Plus } from "lucide-react";

type Year = {
  id: string;
  year: string;
  label: string;
  isActive: boolean;
  _count: {
    collections: number;
    expenses: number;
    donators: number;
    members: number;
  };
};

export function YearsClient({ years }: { years: Year[] }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await createNewYear(
      form.get("year") as string,
      form.get("label") as string
    );
    setShowForm(false);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Management Years</h1>
          <p className="text-gray-500 text-sm mt-1">
            Switch between years or start a new management year
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={18} className="inline mr-1" /> New Year
        </Button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h3 className="font-semibold text-mandal-maroon mb-4">
            Start New Management Year
          </h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Year"
              name="year"
              required
              placeholder="e.g. 2026"
              defaultValue={new Date().getFullYear().toString()}
            />
            <Input
              label="Label"
              name="label"
              required
              placeholder="e.g. Ganesh Utsav 2026"
            />
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create & Activate"}
              </Button>
            </div>
          </form>
          <p className="text-xs text-gray-400 mt-3">
            Creating a new year starts fresh entries. Previous year data remains accessible.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {years.map((y) => (
          <div
            key={y.id}
            className={`card ${y.isActive ? "ring-2 ring-mandal-saffron" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-mandal-cream rounded-lg">
                  <Calendar size={20} className="text-mandal-maroon" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{y.label}</h3>
                    {y.isActive && <Badge variant="success">Active</Badge>}
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>{y._count.members} members</span>
                    <span>{y._count.donators} donators</span>
                    <span>{y._count.collections} collections</span>
                    <span>{y._count.expenses} expenses</span>
                  </div>
                </div>
              </div>
              {!y.isActive && (
                <Button
                  variant="secondary"
                  onClick={() => switchYear(y.id)}
                >
                  Switch to this year
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
