"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  size: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, pages, total, size, onChange }: PaginationProps) {
  if (pages <= 1) return null;
  const from = (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <span className="text-sm text-slate-500">
        Showing <b>{from}–{to}</b> of <b>{total}</b>
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className={cn("p-1.5 rounded-lg transition-colors", page === 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:bg-slate-100")}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "w-8 h-8 text-sm rounded-lg transition-colors",
              p === page ? "bg-brand-600 text-white font-medium" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className={cn("p-1.5 rounded-lg transition-colors", page === pages ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:bg-slate-100")}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
