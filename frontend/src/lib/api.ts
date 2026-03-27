const API = process.env.NEXT_PUBLIC_API_URL + "/api";

async function apiFetch(path: string, options?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("tasklab_token") : null;
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API error");
  return data;
}

export const api = {
  getProjects: () => apiFetch("/projects"),
  createProject: (data: { title: string; description?: string }) =>
    apiFetch("/projects", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id: string, data: object) =>
    apiFetch(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProject: (id: string) =>
    apiFetch(`/projects/${id}`, { method: "DELETE" }),

  getTasks: (params?: { project_id?: string; status?: string }) => {
    const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : "";
    return apiFetch(`/tasks${qs ? "?" + qs : ""}`);
  },
  createTask: (data: object) =>
    apiFetch("/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id: string, data: object) =>
    apiFetch(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTask: (id: string) =>
    apiFetch(`/tasks/${id}`, { method: "DELETE" }),

  getStats: () => apiFetch("/stats"),
  getMe: () => apiFetch("/users/me"),
  updateMe: (data: object) =>
    apiFetch("/users/me", { method: "PUT", body: JSON.stringify(data) }),

  getTeam: () => apiFetch("/team"),
  createTeamMember: (data: { name: string; role?: string; email?: string }) =>
    apiFetch("/team", { method: "POST", body: JSON.stringify(data) }),
  updateTeamMember: (id: string, data: object) =>
    apiFetch(`/team/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTeamMember: (id: string) =>
    apiFetch(`/team/${id}`, { method: "DELETE" }),
};
