"use client";
import { useCallback, useEffect, useState } from "react";
import { projectsApi } from "@/lib/services";
import type { Project } from "@/types";
import ProjectModal from "@/components/projects/ProjectModal";
import ConfirmDelete from "@/components/ui/ConfirmDelete";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import {
  FolderKanban, Plus, Pencil, Trash2, CheckSquare,
  Calendar, User, RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen]       = useState(false);
  const [editProject, setEditProject]   = useState<Project | null>(null);
  const [deleteId, setDeleteId]         = useState<number | null>(null);
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res = await projectsApi.list(p, 9);
      setProjects(res.items);
      setPages(res.pages);
      setTotal(res.total);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(page); }, [page]);

  const openCreate = () => { setEditProject(null); setModalOpen(true); };
  const openEdit   = (p: Project) => { setEditProject(p); setModalOpen(true); };

  const handleSubmit = async (data: { name: string; description?: string }) => {
    setSaving(true);
    try {
      if (editProject) await projectsApi.update(editProject.id, data);
      else             await projectsApi.create(data);
      setModalOpen(false);
      load(editProject ? page : 1);
      if (!editProject) setPage(1);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await projectsApi.delete(deleteId);
      setDeleteId(null);
      load(page);
    } finally { setDeleting(false); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} project{total !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => load(page)} className="btn-secondary text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-full mb-1" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to get started tracking work."
            action={
              <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Project
              </button>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow animate-fade-in">
                {/* Top */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(project)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(project.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5" />
                    {project.task_count ?? 0} task{project.task_count !== 1 ? "s" : ""}
                  </span>
                  {project.creator && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {project.creator.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1 ml-auto">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(project.created_at)}
                  </span>
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={`/dashboard/tasks?project_id=${project.id}`}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    View tasks →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 card">
            <Pagination page={page} pages={pages} total={total} size={9} onChange={setPage} />
          </div>
        </>
      )}

      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        project={editProject}
        loading={saving}
      />

      <ConfirmDelete
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Project"
        description="Deleting this project will also remove all its tasks. This cannot be undone."
      />
    </div>
  );
}
