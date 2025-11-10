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
    // Prefer FastAPI {"detail": "..."}
    try {
      const data = await res.json();
      if (typeof (data as any)?.detail === "string") {
        throw new Error((data as any).detail);
      }
    } catch {
      // ignore and fall through to text
    }
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
