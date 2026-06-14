"use client";

import { useState, useMemo } from "react";
import { submitPayment } from "@/lib/actions";
import { groupCollectionsByDonator } from "@/lib/collection-utils";
import { GroupedCollectionsList } from "@/components/modules/GroupedCollectionsList";
import { Badge, Button, Input, Modal, Select, Textarea } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calculatePaymentBalance } from "@/lib/collection-utils";
import { Wallet, AlertCircle, Plus, Clock, Image as ImageIcon } from "lucide-react";

type Collection = {
  id: string;
  amount: number;
  date: string;
  paymentStatus: string;
  balanceAmount: number;
  donatorId: string;
  donator: { id: string; name: string };
};

type Submission = {
  id: string;
  amount: number;
  date: string;
  paymentStatus: string;
  balanceAmount: number;
  screenshotUrl: string;
  status: string;
  rejectReason: string | null;
  createdAt: Date;
};

export function MyPaymentsClient({
  collections,
  submissions,
  totalPaid,
  totalPending,
  yearLabel,
  userMobile,
  expectedAmount,
}: {
  collections: Collection[];
  submissions: Submission[];
  totalPaid: number;
  totalPending: number;
  yearLabel: string;
  userMobile?: string | null;
  expectedAmount?: number | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [useManualBalance, setUseManualBalance] = useState(false);
  const [amountInput, setAmountInput] = useState("");

  const hasExpected = expectedAmount != null && expectedAmount > 0;
  const previewBalance =
    hasExpected && amountInput
      ? calculatePaymentBalance(
          expectedAmount,
          totalPaid,
          parseFloat(amountInput) || 0,
          0,
          false
        )
      : null;

  const pendingSubmissions = submissions.filter((s) => s.status === "PENDING");
  const grouped = useMemo(
    () => groupCollectionsByDonator(collections),
    [collections]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const formData = new FormData(e.currentTarget);
    if (useManualBalance) formData.set("useManualBalance", "true");
    const result = await submitPayment(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Payment submitted! Admin will review and approve shortly.");
      setModalOpen(false);
      (e.target as HTMLFormElement).reset();
      setUseManualBalance(false);
      setAmountInput("");
    }
    setLoading(false);
  }

  const submissionBadge = (status: string) => {
    if (status === "APPROVED") return "success" as const;
    if (status === "REJECTED") return "danger" as const;
    return "warning" as const;
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">My Payments</h1>
          <p className="text-gray-500 mt-1">{yearLabel}</p>
          {userMobile && (
            <p className="text-xs text-gray-400 mt-1">Linked mobile: {userMobile}</p>
          )}
        </div>
        <Button onClick={() => { setModalOpen(true); setError(""); setSuccess(""); }}>
          <Plus size={18} className="inline mr-1" />
          Submit Payment
        </Button>
      </div>

      {success && (
        <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{success}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 text-green-600">
            <Wallet size={18} />
            <span className="text-sm">Total Paid (Approved)</span>
          </div>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle size={18} />
            <span className="text-sm">Balance Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {formatCurrency(totalPending)}
          </p>
        </div>
      </div>

      {pendingSubmissions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-amber-600 mb-3 flex items-center gap-2">
            <Clock size={18} />
            Awaiting Admin Approval ({pendingSubmissions.length})
          </h2>
          <div className="space-y-3">
            {pendingSubmissions.map((s) => (
              <div key={s.id} className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">{formatCurrency(s.amount)}</p>
                    <Badge variant="warning">Pending Review</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(s.date)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted {new Date(s.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewUrl(s.screenshotUrl)}
                  className="flex items-center gap-1.5 text-sm text-mandal-saffron hover:underline shrink-0"
                >
                  <ImageIcon size={16} />
                  View screenshot
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {submissions.filter((s) => s.status !== "PENDING").length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            Submission History
          </h2>
          <div className="space-y-2">
            {submissions
              .filter((s) => s.status !== "PENDING")
              .map((s) => (
                <div
                  key={s.id}
                  className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{formatCurrency(s.amount)}</span>
                      <Badge variant={submissionBadge(s.status)}>{s.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(s.date)}</p>
                    {s.rejectReason && (
                      <p className="text-xs text-red-500 mt-1">{s.rejectReason}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-mandal-maroon mb-3">
          Approved Payments
        </h2>
        {!userMobile ? (
          <div className="card text-center py-8 text-gray-500">
            <p>No mobile number on your account.</p>
            <p className="text-sm mt-2">Contact admin to link your donations.</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            <p>No approved payments yet.</p>
            <p className="text-sm mt-2">
              Submit a payment with screenshot for admin approval.
            </p>
          </div>
        ) : (
          <GroupedCollectionsList groups={grouped} />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Submit Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          {hasExpected && (
            <div className="p-3 bg-mandal-cream rounded-lg text-sm">
              <p>
                Your expected vargani: <strong>{formatCurrency(expectedAmount!)}</strong>
              </p>
              <p className="text-gray-500 mt-1">
                Already paid: {formatCurrency(totalPaid)} · Balance:{" "}
                {formatCurrency(Math.max(0, expectedAmount! - totalPaid))}
              </p>
            </div>
          )}

          <Input
            label="Amount Paid (₹)"
            name="amount"
            type="number"
            required
            min="1"
            placeholder="e.g. 1000"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
          />

          {hasExpected && previewBalance && (
            <div className="p-3 bg-green-50 rounded-lg text-sm">
              Balance after this payment:{" "}
              <strong className="text-amber-600">
                {formatCurrency(previewBalance.balanceAmount)}
              </strong>
              <p className="text-xs text-gray-500 mt-1">Auto-calculated — no need to enter balance</p>
            </div>
          )}

          {!hasExpected && (
            <div className="space-y-3 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                No expected vargani set yet. Admin will verify your payment.
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useManualBalance}
                  onChange={(e) => setUseManualBalance(e.target.checked)}
                />
                This is a partial payment with balance remaining
              </label>
              {useManualBalance && (
                <Input
                  label="Remaining Balance (₹)"
                  name="balanceAmount"
                  type="number"
                  required
                  min="1"
                  placeholder="Amount still pending"
                />
              )}
            </div>
          )}

          <Input
            label="Payment Date"
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Screenshot *
            </label>
            <input
              type="file"
              name="screenshot"
              className="input-field"
              accept="image/*"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Upload UPI/bank payment screenshot
            </p>
          </div>
          <Textarea
            label="Notes (optional)"
            name="notes"
            placeholder="Transaction ID, UPI ref, etc."
          />
          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit for Approval"}
          </Button>
        </form>
      </Modal>

      <Modal
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        title="Payment Screenshot"
      >
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Screenshot" className="w-full rounded-lg" />
        )}
      </Modal>
    </div>
  );
}
