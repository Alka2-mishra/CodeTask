import type { AuthResponse, Task, TaskPriority, TaskStatus, User } from "../types";

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers
    }
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message ?? "Request failed.");
  }

  return body as T;
}

export const authApi = {
  register: (payload: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  me: (token: string) => request<{ user: User }>("/auth/me", { token })
};

export const taskApi = {
  list: (token: string) => request<{ tasks: Task[] }>("/tasks", { token }),
  create: (token: string, payload: TaskInput) =>
    request<{ task: Task }>("/tasks", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }),
  update: (token: string, id: string, payload: TaskInput) =>
    request<{ task: Task }>(`/tasks/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload)
    }),
  setStatus: (token: string, id: string, status: TaskStatus) =>
    request<{ task: Task }>(`/tasks/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status })
    }),
  remove: (token: string, id: string) =>
    request<void>(`/tasks/${id}`, {
      method: "DELETE",
      token
    })
};

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
}
