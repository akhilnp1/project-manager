"use client";
import { Suspense } from "react";
import TasksPage from "./page";

export default function TasksLayout() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400 text-sm">Loading tasks…</div>}>
      <TasksPage />
    </Suspense>
  );
}
