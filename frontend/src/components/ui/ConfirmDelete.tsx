"use client";
import Modal from "./Modal";
import { Loader2, Trash2 } from "lucide-react";

interface ConfirmDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  description?: string;
}

export default function ConfirmDelete({ open, onClose, onConfirm, loading, title = "Delete item", description = "This action cannot be undone." }: ConfirmDeleteProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-500 mb-5">{description}</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger text-sm flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </button>
      </div>
    </Modal>
  );
}
