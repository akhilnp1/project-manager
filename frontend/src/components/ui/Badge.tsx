import { cn, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import type { TaskStatus } from "@/types";

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      role === "admin" ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-slate-100 text-slate-600 border border-slate-200"
    )}>
      {role}
    </span>
  );
}
