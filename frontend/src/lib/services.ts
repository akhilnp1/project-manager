import api from "./api";
import type {
  LoginResponse, User, Project, Task,
  PaginatedResponse, TaskStatus,
} from "@/types";

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { email, password }).then((r) => r.data),
  me: () => api.get<User>("/auth/me").then((r) => r.data),
};

// Users
export const usersApi = {
  list: (page = 1, size = 50) =>
    api.get<PaginatedResponse<User>>("/users", { params: { page, size } }).then((r) => r.data),
  get: (id: number) => api.get<User>(`/users/${id}`).then((r) => r.data),
  create: (data: { name: string; email: string; password: string; role: string }) =>
    api.post<User>("/users", data).then((r) => r.data),
};

// Projects
export const projectsApi = {
  list: (page = 1, size = 10) =>
    api.get<PaginatedResponse<Project>>("/projects", { params: { page, size } }).then((r) => r.data),
  get: (id: number) => api.get<Project>(`/projects/${id}`).then((r) => r.data),
  create: (data: { name: string; description?: string }) =>
    api.post<Project>("/projects", data).then((r) => r.data),
  update: (id: number, data: { name?: string; description?: string }) =>
    api.patch<Project>(`/projects/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};

// Tasks
export const tasksApi = {
  list: (params: {
    page?: number; size?: number;
    project_id?: number; status?: TaskStatus; assigned_to?: number;
  }) => api.get<PaginatedResponse<Task>>("/tasks", { params }).then((r) => r.data),
  get: (id: number) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),
  create: (data: {
    title: string; description?: string; project_id: number;
    assigned_to?: number; due_date?: string; status?: TaskStatus;
  }) => api.post<Task>("/tasks", data).then((r) => r.data),
  update: (id: number, data: Partial<{
    title: string; description: string; assigned_to: number;
    due_date: string; status: TaskStatus;
  }>) => api.patch<Task>(`/tasks/${id}`, data).then((r) => r.data),
  assign: (id: number, assigned_to: number) =>
    api.patch<Task>(`/tasks/${id}/assign`, { assigned_to }).then((r) => r.data),
  updateStatus: (id: number, status: TaskStatus) =>
    api.patch<Task>(`/tasks/${id}/status`, { status }).then((r) => r.data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};
