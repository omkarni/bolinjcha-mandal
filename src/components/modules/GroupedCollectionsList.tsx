"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { GroupedCollection } from "@/lib/collection-utils";
import { ChevronDown, ChevronUp, Download, Pencil, Trash2 } from "lucide-react";

export function GroupedCollectionsList({
  groups,
  isAdmin,
  onEdit,
  onDelete,
}: {
  groups: GroupedCollection[];
  isAdmin?: boolean;
  onEdit?: (paymentId: string, payment: GroupedCollection["payments"][0]) => void;
  onDelete?: (paymentId: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isOpen = expanded.has(group.donatorId);
        const multi = group.paymentCount > 1;

        return (
          <div key={group.donatorId} className="card overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-lg">{group.donatorName}</h3>
                  {group.hasPending ? (
                    <Badge variant="warning">Balance Pending</Badge>
                  ) : (
                    <Badge variant="success">Paid Full</Badge>
                  )}
                  {multi && (
                    <span className="text-xs text-gray-400">
                      {group.paymentCount} payments
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                  {group.expectedAmount != null && group.expectedAmount > 0 && (
                    <span>
                      <span className="text-gray-400">Vargani: </span>
                      <span className="font-medium">{formatCurrency(group.expectedAmount)}</span>
                    </span>
                  )}
                  <span>
                    <span className="text-gray-400">Total paid: </span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(group.totalPaid)}
                    </span>
                  </span>
                  {group.hasPending && (
                    <span>
                      <span className="text-gray-400">Balance due: </span>
                      <span className="font-semibold text-amber-600">
                        {formatCurrency(group.balancePending)}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {multi && (
                <button
                  type="button"
                  onClick={() => toggle(group.donatorId)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-mandal-saffron bg-mandal-cream rounded-lg hover:bg-mandal-cream-dark shrink-0 w-full sm:w-auto"
                >
                  {isOpen ? (
                    <>
                      <ChevronUp size={16} /> Hide payments
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} /> View {group.paymentCount} payments
                    </>
                  )}
                </button>
              )}
            </div>

            {(isOpen || !multi) && (
              <div className={`space-y-2 ${multi ? "mt-4 pt-4 border-t border-gray-100" : "mt-3"}`}>
                {group.payments.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 px-3 bg-mandal-cream/50 rounded-lg"
                  >
                    <div>
                      {multi && (
                        <p className="text-xs text-gray-400 mb-0.5">
                          Payment {group.paymentCount - idx}
                        </p>
                      )}
                      <p className="font-medium">{formatCurrency(p.amount)}</p>
                      <p className="text-sm text-gray-500">{formatDate(p.date)}</p>
                      {!multi && p.paymentStatus === "PENDING" && (
                        <p className="text-xs text-amber-600 mt-0.5">
                          Balance: {formatCurrency(p.balanceAmount)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <a
                        href={`/api/receipt/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-white text-mandal-saffron rounded-lg text-sm font-medium hover:bg-mandal-cream border border-mandal-cream-dark"
                        title="Download Receipt"
                      >
                        <Download size={14} />
                        Receipt
                      </a>
                      {isAdmin && onEdit && (
                        <button
                          onClick={() => onEdit(p.id, p)}
                          className="p-2 hover:bg-white rounded-lg"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {isAdmin && onDelete && (
                        <button
                          onClick={() => onDelete(p.id)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
