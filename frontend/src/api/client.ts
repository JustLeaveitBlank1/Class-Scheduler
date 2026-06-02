// src/api/client.ts

// Accept either env name, default to 127.0.0.1, trim trailing slash.
const API_BASE = (
  import.meta.env.VITE_API_BASE ??
  import.meta.env.VITE_API_URL ??
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

export function getApiBase() {
  return API_BASE;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    let message: string | null = null;

    // 1) Try to read FastAPI-style JSON: {"detail": "..."}
    try {
      const data = await res.json();
      const detail = (data as any)?.detail;

      if (typeof detail === "string") {
        message = detail;
      }
    } catch {
      // ignore JSON parse errors and fall through
    }

    // 2) Friendly overrides for auth endpoints
    if (!message) {
      if (res.status === 401 && path.startsWith("/auth/login")) {
        message = "Incorrect email or password.";
      } else if (res.status === 400 && path.startsWith("/auth/signup")) {
        message = "An account with this email already exists.";
      }
    }

    // 3) Fallback to text body or generic message
    if (!message) {
      const text = await res.text().catch(() => "");
      if (text && !text.startsWith("HTTP ")) {
        message = text;
      } else {
        message = "Something went wrong while talking to the server.";
      }
    }

    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
