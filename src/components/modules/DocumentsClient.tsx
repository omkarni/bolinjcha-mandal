"use client";

import { useState } from "react";
import { createDocument, deleteDocument, uploadFile } from "@/lib/actions";
import { Button, Input, Modal, EmptyState } from "@/components/ui";
import { Plus, Trash2, FileText, ExternalLink } from "lucide-react";

type Document = {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string | null;
  createdAt: Date;
};

export function DocumentsClient({
  documents,
  isAdmin,
}: {
  documents: Document[];
  isAdmin: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const file = form.get("file") as File;
    let fileUrl = "";
    if (file && file.size > 0) {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      fileUrl = (await uploadFile(uploadForm, "documents")) || "";
    }
    await createDocument({
      name: form.get("name") as string,
      fileUrl,
      fileType: file?.type || "",
    });
    setModalOpen(false);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Mandal Documents</h1>
        {isAdmin && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={18} className="inline mr-1" /> Upload
          </Button>
        )}
      </div>

      {documents.length === 0 ? (
        <EmptyState message="No documents uploaded yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="card group">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-mandal-cream rounded-lg">
                  <FileText size={24} className="text-mandal-maroon" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{doc.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                  </p>
                  {doc.fileUrl && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-mandal-saffron mt-2 hover:underline"
                    >
                      View <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Upload Document">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Document Name" name="name" required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File
            </label>
            <input
              type="file"
              name="file"
              className="input-field"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Uploading..." : "Upload Document"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
