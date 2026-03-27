"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { usersApi, projectsApi } from "@/lib/services";
import type { Task, User, Project, TaskStatus } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  project_id: z.coerce.number().min(1, "Project is required"),
  assigned_to: z.coerce.number().optional(),
  due_date: z.string().optional(),
  status: z.enum(["todo", "in_progress", "in_review", "done"]).default("todo"),
});
type FormData = z.infer<typeof schema>;

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  task?: Task | null;
  loading?: boolean;
  defaultProjectId?: number;
}

export default function TaskModal({ open, onClose, onSubmit, task, loading, defaultProjectId }: TaskModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!open) return;
    usersApi.list(1, 100).then((r) => setUsers(r.items)).catch(() => {});
    projectsApi.list(1, 100).then((r) => setProjects(r.items)).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || "",
        project_id: task.project_id,
        assigned_to: task.assigned_to || undefined,
        due_date: task.due_date || "",
        status: task.status,
      });
    } else {
      reset({
        title: "",
        description: "",
        project_id: defaultProjectId || (undefined as any),
        assigned_to: undefined,
        due_date: "",
        status: "todo",
      });
    }
  }, [task, reset, open, defaultProjectId]);

  return (
    <Modal open={open} onClose={onClose} title={task ? "Edit Task" : "New Task"} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input {...register("title")} className="input" placeholder="Task title" />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea {...register("description")} rows={2} className="input resize-none" placeholder="Optional description…" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Project *</label>
            <select {...register("project_id")} className="input">
              <option value="">Select project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.project_id && <p className="text-xs text-red-500 mt-1">{errors.project_id.message}</p>}
          </div>

          <div>
            <label className="label">Status</label>
            <select {...register("status")} className="input">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Assign To</label>
            <select {...register("assigned_to")} className="input">
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Due Date</label>
            <input {...register("due_date")} type="date" className="input" />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary text-sm flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
