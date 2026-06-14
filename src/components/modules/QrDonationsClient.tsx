"use client";

import { useState } from "react";
import { createQrDonation, deleteQrDonation, uploadFile } from "@/lib/actions";
import { Button, Input, Modal, EmptyState } from "@/components/ui";
import { Plus, Trash2, QrCode } from "lucide-react";

type QrDonation = {
  id: string;
  title: string;
  imageUrl: string;
  upiId: string | null;
  isActive: boolean;
};

export function QrDonationsClient({
  qrCodes,
  isAdmin,
}: {
  qrCodes: QrDonation[];
  isAdmin: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const file = form.get("file") as File;
    let imageUrl = form.get("existingImageUrl") as string;
    if (file && file.size > 0) {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      imageUrl = (await uploadFile(uploadForm, "qr-codes")) || imageUrl;
    }
    await createQrDonation({
      title: form.get("title") as string,
      imageUrl,
      upiId: (form.get("upiId") as string) || "",
      isActive: "true",
    });
    setModalOpen(false);
    setLoading(false);
  }

  const activeCodes = qrCodes.filter((q) => q.isActive);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">QR Donations</h1>
          <p className="text-sm text-gray-500 mt-1">UPI QR codes for quick donations</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={18} className="inline mr-1" /> Upload QR
          </Button>
        )}
      </div>

      {activeCodes.length === 0 ? (
        <EmptyState message="No QR codes uploaded yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCodes.map((qr) => (
            <div key={qr.id} className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white border-2 border-mandal-cream-dark rounded-xl inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qr.imageUrl}
                    alt={qr.title}
                    className="w-48 h-48 object-contain mx-auto"
                  />
                </div>
              </div>
              <h3 className="font-semibold text-mandal-maroon">{qr.title}</h3>
              {qr.upiId && (
                <p className="text-sm text-gray-500 mt-1">UPI: {qr.upiId}</p>
              )}
              <p className="text-xs text-mandal-saffron mt-2">Scan to donate</p>
              {isAdmin && (
                <button
                  onClick={() => deleteQrDonation(qr.id)}
                  className="mt-3 text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdmin && qrCodes.length > activeCodes.length && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-gray-500 mb-3">Inactive QR Codes</h2>
          <div className="space-y-2">
            {qrCodes.filter((q) => !q.isActive).map((qr) => (
              <div key={qr.id} className="card flex items-center justify-between opacity-60">
                <span>{qr.title}</span>
                <button onClick={() => deleteQrDonation(qr.id)} className="text-red-500 text-sm">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Upload QR Code">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" required placeholder="e.g. UPI - Ganesh Utsav 2026" />
          <Input label="UPI ID (optional)" name="upiId" placeholder="name@upi" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Image</label>
            <input type="file" name="file" className="input-field" accept="image/*" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <QrCode size={16} className="inline mr-1" />
            {loading ? "Uploading..." : "Upload QR Code"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
