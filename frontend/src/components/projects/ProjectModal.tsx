"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Project } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  project?: Project | null;
  loading?: boolean;
}

export default function ProjectModal({ open, onClose, onSubmit, project, loading }: ProjectModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (project) reset({ name: project.name, description: project.description || "" });
    else reset({ name: "", description: "" });
  }, [project, reset, open]);

  return (
    <Modal open={open} onClose={onClose} title={project ? "Edit Project" : "New Project"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Project Name *</label>
          <input {...register("name")} className="input" placeholder="e.g. Website Redesign" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className="input resize-none"
            placeholder="Optional project description…"
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary text-sm flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {project ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
