"use client";

import { useState } from "react";
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/actions";
import { Button, Input, Modal, EmptyState, Select, Textarea, Badge } from "@/components/ui";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

const CATEGORIES = [
  { value: "POOJA_SAMAGRI", label: "Pooja Samagri" },
  { value: "DECORATION", label: "Decoration" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "OTHER", label: "Other" },
];

type Item = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  notes: string | null;
};

export function InventoryClient({
  items,
  isAdmin,
}: {
  items: Item[];
  isAdmin: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL" ? items : items.filter((i) => i.category === filter);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    if (editing) await updateInventoryItem(editing.id, data);
    else await createInventoryItem(data);
    setModalOpen(false);
    setEditing(null);
    setLoading(false);
  }

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: filtered.filter((i) => i.category === cat.value),
  }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Pooja samagri & decoration items</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={18} className="inline mr-1" /> Add Item
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === "ALL" ? "bg-mandal-saffron text-white" : "bg-mandal-cream text-gray-600"
          }`}
        >
          All ({items.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = items.filter((i) => i.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === cat.value ? "bg-mandal-saffron text-white" : "bg-mandal-cream text-gray-600"
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No inventory items yet" />
      ) : filter === "ALL" ? (
        <div className="space-y-6">
          {grouped.filter((g) => g.items.length > 0).map((group) => (
            <div key={group.value}>
              <h2 className="text-sm font-semibold text-mandal-maroon mb-3 uppercase tracking-wide">
                {group.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.items.map((item) => (
                  <InventoryCard key={item.id} item={item} isAdmin={isAdmin} onEdit={() => { setEditing(item); setModalOpen(true); }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <InventoryCard key={item.id} item={item} isAdmin={isAdmin} onEdit={() => { setEditing(item); setModalOpen(true); }} />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? "Edit Item" : "Add Inventory Item"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Item Name" name="name" required defaultValue={editing?.name} />
          <Select label="Category" name="category" defaultValue={editing?.category || "POOJA_SAMAGRI"}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantity" name="quantity" type="number" required defaultValue={editing?.quantity} />
            <Input label="Unit" name="unit" defaultValue={editing?.unit || "pcs"} placeholder="pcs, kg, box" />
          </div>
          <Textarea label="Notes" name="notes" defaultValue={editing?.notes || ""} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : editing ? "Update" : "Add Item"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function InventoryCard({
  item,
  isAdmin,
  onEdit,
}: {
  item: Item;
  isAdmin: boolean;
  onEdit: () => void;
}) {
  const catLabel = CATEGORIES.find((c) => c.value === item.category)?.label || item.category;
  return (
    <div className="card group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-mandal-cream rounded-lg">
            <Package size={18} className="text-mandal-maroon" />
          </div>
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-lg font-bold text-mandal-saffron">
              {item.quantity} <span className="text-sm font-normal text-gray-500">{item.unit}</span>
            </p>
            <Badge variant="default">{catLabel}</Badge>
            {item.notes && <p className="text-xs text-gray-400 mt-1">{item.notes}</p>}
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-1">
            <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded">
              <Pencil size={14} />
            </button>
            <button onClick={() => deleteInventoryItem(item.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
