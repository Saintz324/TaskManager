const API = process.env.NEXT_PUBLIC_API_URL + "/api";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tasklab_token");
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("tasklab_user");
  return u ? JSON.parse(u) : null;
}

export function logout() {
  localStorage.removeItem("tasklab_token");
  localStorage.removeItem("tasklab_user");
  window.location.href = "/login";
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  localStorage.setItem("tasklab_token", data.token);
  localStorage.setItem("tasklab_user", JSON.stringify(data.user));
  return data;
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Register failed");
  localStorage.setItem("tasklab_token", data.token);
  localStorage.setItem("tasklab_user", JSON.stringify(data.user));
  return data;
}
