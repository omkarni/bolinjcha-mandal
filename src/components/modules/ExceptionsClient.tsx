"use client";

import { useState } from "react";
import { createException, deleteException } from "@/lib/actions";
import { Button, Input, Modal, EmptyState, Select, Textarea } from "@/components/ui";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Donator = { id: string; name: string };
type Exception = {
  id: string;
  reason: string;
  amount: number | null;
  donator: { name: string };
};

export function ExceptionsClient({
  exceptions,
  donators,
  isAdmin,
}: {
  exceptions: Exception[];
  donators: Donator[];
  isAdmin: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;
    await createException(data);
    setModalOpen(false);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Donator Exceptions</h1>
        {isAdmin && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={18} className="inline mr-1" /> Add Exception
          </Button>
        )}
      </div>

      {exceptions.length === 0 ? (
        <EmptyState message="No exceptions recorded" />
      ) : (
        <div className="space-y-3">
          {exceptions.map((ex) => (
            <div key={ex.id} className="card flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{ex.donator.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{ex.reason}</p>
                {ex.amount && (
                  <p className="text-sm text-amber-600 mt-0.5">
                    Amount: {formatCurrency(ex.amount)}
                  </p>
                )}
              </div>
              {isAdmin && (
                <button
                  onClick={() => deleteException(ex.id)}
                  className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Exception">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Donator" name="donatorId" required>
            <option value="">Select Donator</option>
            {donators.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
          <Textarea label="Reason" name="reason" required />
          <Input label="Amount (optional)" name="amount" type="number" />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Add Exception"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
