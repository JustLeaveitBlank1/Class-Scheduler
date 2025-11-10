// src/components/auth/AuthAPI.ts
import { api } from "../../api/client";

export type SignupPayload = { email: string; password: string; full_name?: string };
export type LoginPayload  = { email: string; password: string };
export type Me = { email: string; full_name?: string } | null;

export const AuthAPI = {
  me:     () => api<Me>("/auth/me"),
  signup: (p: SignupPayload) => api("/auth/signup", { method: "POST", body: JSON.stringify(p) }),
  login:  (p: LoginPayload)  => api("/auth/login",  { method: "POST", body: JSON.stringify(p) }),
  logout: () => api<void>("/auth/logout", { method: "POST" }),
  forgot: (email: string) =>
    api<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};
