"use client";

import { useState } from "react";
import {
  approvePaymentSubmission,
  rejectPaymentSubmission,
} from "@/lib/actions";
import { Button, Badge, Modal, Textarea } from "@/components/ui";
import { Check, X, Image as ImageIcon, User } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type Submission = {
  id: string;
  amount: number;
  date: string;
  paymentStatus: string;
  balanceAmount: number;
  screenshotUrl: string;
  notes: string | null;
  status: string;
  rejectReason: string | null;
  createdAt: Date;
  user: { name: string; email: string; mobile: string | null };
};

export function PaymentApprovalsClient({
  pending,
  processed,
}: {
  pending: Submission[];
  processed: Submission[];
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReject() {
    if (!rejectId) return;
    setLoading(true);
    await rejectPaymentSubmission(rejectId, rejectReason);
    setRejectId(null);
    setRejectReason("");
    setLoading(false);
  }

  const statusVariant = (s: string) =>
    s === "APPROVED" ? "success" : s === "REJECTED" ? "danger" : "warning";

  return (
    <div className="space-y-8 w-full max-w-full overflow-hidden">
      <div>
        <h1 className="page-title">Payment Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review user-submitted payments with screenshots
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-amber-600 mb-4">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="card text-center py-8 text-gray-400">
            No pending payment submissions
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((s) => (
              <div
                key={s.id}
                className="card flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(s.screenshotUrl)}
                    className="shrink-0 w-full sm:w-32 h-32 rounded-lg border-2 border-dashed border-mandal-cream-dark overflow-hidden bg-mandal-cream hover:opacity-90 transition-opacity"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.screenshotUrl}
                      alt="Payment screenshot"
                      className="w-full h-full object-cover"
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <User size={18} className="text-mandal-maroon mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-semibold">{s.user.name}</h3>
                        <p className="text-sm text-gray-500 break-all">{s.user.email}</p>
                        {s.user.mobile && (
                          <p className="text-xs text-gray-400">Mobile: {s.user.mobile}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Amount</span>
                        <p className="font-bold text-mandal-saffron text-lg">
                          {formatCurrency(s.amount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Date</span>
                        <p className="font-medium">{formatDate(s.date)}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant={s.paymentStatus === "FULL" ? "success" : "warning"}>
                        {s.paymentStatus === "FULL"
                          ? "Paid Full"
                          : `Balance: ${formatCurrency(s.balanceAmount)}`}
                      </Badge>
                    </div>
                    {s.notes && (
                      <p className="text-sm text-gray-600 mt-2 bg-mandal-cream p-2 rounded-lg">
                        {s.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Submitted {new Date(s.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                  <Button
                    onClick={() => approvePaymentSubmission(s.id)}
                    className="w-full sm:w-auto justify-center"
                  >
                    <Check size={16} className="inline mr-1" />
                    Approve & Add
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setRejectId(s.id)}
                    className="w-full sm:w-auto justify-center"
                  >
                    <X size={16} className="inline mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setPreviewUrl(s.screenshotUrl)}
                    className="col-span-2 sm:col-span-1 w-full sm:w-auto justify-center"
                  >
                    <ImageIcon size={16} className="inline mr-1" />
                    View Screenshot
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {processed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-mandal-maroon mb-4">
            Processed ({processed.length})
          </h2>
          <div className="space-y-2">
            {processed.map((s) => (
              <div
                key={s.id}
                className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{s.user.name}</span>
                    <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(s.amount)} &middot; {formatDate(s.date)}
                  </p>
                  {s.rejectReason && (
                    <p className="text-xs text-red-500 mt-1">Reason: {s.rejectReason}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewUrl(s.screenshotUrl)}
                  className="text-sm text-mandal-saffron hover:underline shrink-0"
                >
                  View screenshot
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        title="Payment Screenshot"
      >
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Payment screenshot"
            className="w-full rounded-lg"
          />
        )}
      </Modal>

      <Modal
        open={!!rejectId}
        onClose={() => { setRejectId(null); setRejectReason(""); }}
        title="Reject Payment"
      >
        <div className="space-y-4">
          <Textarea
            label="Reason (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Screenshot unclear, amount mismatch..."
          />
          <Button
            variant="danger"
            className="w-full"
            disabled={loading}
            onClick={handleReject}
          >
            {loading ? "Rejecting..." : "Confirm Reject"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
