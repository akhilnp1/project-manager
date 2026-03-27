export type UserRole = "admin" | "developer";
export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: User;
  task_count?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  project_id: number;
  assigned_to: number | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  assignee?: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}
