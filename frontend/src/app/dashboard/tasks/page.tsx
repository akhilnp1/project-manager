"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { tasksApi, projectsApi, usersApi } from "@/lib/services";
import type { Task, Project, User, TaskStatus } from "@/types";
import TaskModal from "@/components/tasks/TaskModal";
import ConfirmDelete from "@/components/ui/ConfirmDelete";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate, getInitials, STATUS_LABELS } from "@/lib/utils";
import {
  CheckSquare, Plus, Pencil, Trash2, RefreshCw,
  Filter, X, Calendar, User as UserIcon,
} from "lucide-react";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "in_review", "done"];

export default function TasksPage() {
  const searchParams  = useSearchParams();
  const router        = useRouter();

  const [tasks, setTasks]         = useState<Task[]>([]);
  const [projects, setProjects]   = useState<Project[]>([]);
  const [users, setUsers]         = useState<User[]>([]);
  const [page, setPage]           = useState(1);
  const [pages, setPages]         = useState(1);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);

  // Filters from URL
  const [projectFilter, setProjectFilter] = useState<number | "">( Number(searchParams.get("project_id")) || "");
  const [statusFilter, setStatusFilter]   = useState<TaskStatus | "">(searchParams.get("status") as TaskStatus || "");
  const [userFilter, setUserFilter]       = useState<number | "">( Number(searchParams.get("assigned_to")) || "");

  const [modalOpen, setModalOpen]     = useState(false);
  const [editTask, setEditTask]       = useState<Task | null>(null);
  const [deleteId, setDeleteId]       = useState<number | null>(null);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);

  // Load filter options
  useEffect(() => {
    projectsApi.list(1, 100).then((r) => setProjects(r.items)).catch(() => {});
    usersApi.list(1, 100).then((r)   => setUsers(r.items)).catch(() => {});
  }, []);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params: any = { page: p, size: 10 };
      if (projectFilter) params.project_id = projectFilter;
      if (statusFilter)  params.status = statusFilter;
      if (userFilter)    params.assigned_to = userFilter;
      const res = await tasksApi.list(params);
      setTasks(res.items);
      setPages(res.pages);
      setTotal(res.total);
    } finally { setLoading(false); }
  }, [page, projectFilter, statusFilter, userFilter]);

  useEffect(() => { load(page); }, [page, projectFilter, statusFilter, userFilter]);

  const clearFilters = () => {
    setProjectFilter(""); setStatusFilter(""); setUserFilter(""); setPage(1);
    router.replace("/dashboard/tasks");
  };

  const hasFilters = projectFilter !== "" || statusFilter !== "" || userFilter !== "";

  const openCreate = () => { setEditTask(null); setModalOpen(true); };
  const openEdit   = (t: Task) => { setEditTask(t); setModalOpen(true); };

  const handleSubmit = async (data: any) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        assigned_to: data.assigned_to || null,
        due_date: data.due_date || null,
      };
      if (editTask) await tasksApi.update(editTask.id, payload);
      else          await tasksApi.create(payload);
      setModalOpen(false);
      load(page);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await tasksApi.delete(deleteId); setDeleteId(null); load(page); }
    finally { setDeleting(false); }
  };

  const handleStatusChange = async (taskId: number, status: TaskStatus) => {
    await tasksApi.updateStatus(taskId, status);
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
  };

  const projectName = (id: number) => projects.find((p) => p.id === id)?.name ?? `#${id}`;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} task{total !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => load(page)} className="btn-secondary text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Filter className="w-4 h-4" /> Filters:
          </div>

          <select
            value={projectFilter}
            onChange={(e) => { setProjectFilter(e.target.value ? Number(e.target.value) : ""); setPage(1); }}
            className="input w-auto text-sm py-1.5"
          >
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as TaskStatus | ""); setPage(1); }}
            className="input w-auto text-sm py-1.5"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>

          <select
            value={userFilter}
            onChange={(e) => { setUserFilter(e.target.value ? Number(e.target.value) : ""); setPage(1); }}
            className="input w-auto text-sm py-1.5"
          >
            <option value="">All Assignees</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors ml-1">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex gap-3">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-1/5 ml-auto" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description={hasFilters ? "Try adjusting your filters." : "Create your first task to get started."}
            action={
              !hasFilters ? (
                <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" /> New Task
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span>Task</span>
              <span>Project</span>
              <span>Status</span>
              <span>Assignee</span>
              <span>Due</span>
              <span></span>
            </div>

            <div className="divide-y divide-slate-50">
              {tasks.map((task) => (
                <div key={task.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3.5 items-center hover:bg-slate-50 transition-colors animate-fade-in">
                  {/* Title */}
                  <div>
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>
                    )}
                  </div>

                  {/* Project */}
                  <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md truncate">
                    {projectName(task.project_id)}
                  </span>

                  {/* Status dropdown */}
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white outline-none focus:border-brand-400 cursor-pointer"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>

                  {/* Assignee */}
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(task.assignee.name)}
                      </div>
                      <span className="text-xs text-slate-600 truncate">{task.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}

                  {/* Due date */}
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    {task.due_date ? (
                      <>
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.due_date)}
                      </>
                    ) : "—"}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination page={page} pages={pages} total={total} size={10} onChange={setPage} />
          </>
        )}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        task={editTask}
        loading={saving}
        defaultProjectId={projectFilter || undefined}
      />

      <ConfirmDelete
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Task"
        description="This task will be permanently deleted."
      />
    </div>
  );
}
