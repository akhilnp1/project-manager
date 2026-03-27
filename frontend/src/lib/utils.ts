import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TaskStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700 border-slate-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  in_review: "bg-amber-50 text-amber-700 border-amber-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
