"use client";

import React, { type ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

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
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
      )}
      <input className={cn("input-field", className)} {...props} />
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
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
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
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
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-mandal-maroon-deep/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-display font-semibold text-mandal-maroon">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-mandal-cream rounded-xl transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex p-4 rounded-full bg-mandal-cream mb-4">
        <span className="text-3xl opacity-40">📋</span>
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
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
    default: "bg-gray-100 text-gray-700 border border-gray-200",
    success: "bg-green-50 text-green-700 border border-green-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
  };
  return (
    <span
      className={cn(
        "inline-flex px-3 py-1 rounded-full text-xs font-semibold",
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
    <div className="space-y-1.5 relative">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
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
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-100 rounded-xl shadow-card max-h-48 overflow-y-auto">
          {filtered.map((o) => (
            <button
              key={o.id}
              type="button"
              className="w-full text-left px-4 py-2.5 hover:bg-mandal-cream text-sm transition-colors"
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
              className="w-full text-left px-4 py-2.5 text-mandal-saffron hover:bg-mandal-cream text-sm font-semibold"
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
        <div className="mt-2 p-4 bg-mandal-cream rounded-xl space-y-3 border border-mandal-maroon/5">
          <p className="text-sm text-gray-600">
            Adding new entry: <strong>{newName}</strong>
          </p>
          <Input label="Mobile (optional)" placeholder="Mobile number" id="new-mobile" />
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
