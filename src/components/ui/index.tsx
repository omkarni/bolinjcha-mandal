"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
  };
  return (
    <button className={cn(variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function Input({
  label,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <input className={cn("input-field", className)} {...props} />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <select className={cn("input-field", className)} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Textarea({
  label,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea
        className={cn("input-field min-h-[80px] resize-y", className)}
        {...props}
      />
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl mx-0 sm:mx-4">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-semibold text-mandal-maroon">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-lg">{message}</p>
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const styles = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={cn(
        "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
        styles[variant]
      )}
    >
      {children}
    </span>
  );
}

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  onAddNew,
  placeholder = "Search...",
}: {
  label?: string;
  options: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
  onAddNew?: (name: string) => void;
  placeholder?: string;
}) {
  const [search, setSearch] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showAddNew, setShowAddNew] = React.useState(false);
  const [newName, setNewName] = React.useState("");

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const selected = options.find((o) => o.id === value);

  return (
    <div className="space-y-1 relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className="input-field"
        placeholder={selected?.name || placeholder}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
      />
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((o) => (
            <button
              key={o.id}
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-mandal-cream text-sm"
              onClick={() => {
                onChange(o.id);
                setSearch("");
                setShowDropdown(false);
              }}
            >
              {o.name}
            </button>
          ))}
          {filtered.length === 0 && search && onAddNew && (
            <button
              type="button"
              className="w-full text-left px-4 py-2 text-mandal-saffron hover:bg-mandal-cream text-sm font-medium"
              onClick={() => {
                setShowAddNew(true);
                setNewName(search);
                setShowDropdown(false);
              }}
            >
              + Add &quot;{search}&quot; as new
            </button>
          )}
        </div>
      )}
      {showAddNew && onAddNew && (
        <div className="mt-2 p-3 bg-mandal-cream rounded-lg space-y-2">
          <p className="text-sm text-gray-600">Adding new entry: <strong>{newName}</strong></p>
          <Input
            label="Mobile (optional)"
            placeholder="Mobile number"
            id="new-mobile"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => {
                onAddNew(newName);
                setShowAddNew(false);
                setSearch("");
              }}
            >
              Confirm Add
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowAddNew(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
