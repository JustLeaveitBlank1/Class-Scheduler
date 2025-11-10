import React, { useState } from "react";
import { AuthAPI } from "./AuthAPI";
import "./login.css";

type Mode = "login" | "register" | "forgot";
type Props = { onLoggedIn?: (me: { email: string; full_name?: string } | null) => void };

export default function LoginPage({ onLoggedIn }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await AuthAPI.login({ email, password });
        const me = await AuthAPI.me();           // fetch session user
        onLoggedIn?.(me);                        // lift state to App (no reload)
        // fallback if no prop provided:
        if (!onLoggedIn) location.href = location.href;
      } else if (mode === "register") {
        await AuthAPI.signup({ full_name: name || undefined, email, password });
        setMsg("Account created. You can sign in now.");
        setMode("login");
      } else {
        const r = await AuthAPI.forgot(email);
        setMsg(r?.message ?? "If that email exists, a reset link was sent.");
      }
    } catch (err: any) {
      setMsg(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card" role="dialog" aria-labelledby="auth-title" aria-describedby="auth-desc">
        <header className="auth-header">
          <div className="dot dot-red" />
          <div className="dot dot-yellow" />
          <div className="dot dot-green" />
        </header>

        <h1 id="auth-title" className="auth-title">
          {mode === "login" ? "Sign in" : mode === "register" ? "Create your account" : "Forgot password"}
        </h1>
        <p id="auth-desc" className="auth-sub">
          {mode === "login" ? "Use your work or school email" :
           mode === "register" ? "Just a few quick details" :
           "Enter your email to receive a reset link"}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label className="field">
              <span>Full name (optional)</span>
              <input type="text" autoComplete="name" value={name}
                     onChange={(e) => setName(e.target.value)} placeholder="John Smith" />
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input type="email" required autoFocus autoComplete="email"
                   value={email} onChange={(e) => setEmail(e.target.value)}
                   placeholder="you@school.edu" />
          </label>

          {mode !== "forgot" && (
            <label className="field">
              <span>Password</span>
              <input type="password" required
                     autoComplete={mode === "login" ? "current-password" : "new-password"}
                     value={password} onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••" minLength={6} />
            </label>
          )}

          {msg && <div className="note" role="status">{msg}</div>}

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Please wait…" :
             mode === "login" ? "Sign in" :
             mode === "register" ? "Create account" :
             "Send reset link"}
          </button>
        </form>

        <div className="auth-links">
          {mode !== "login" && <button className="link" onClick={() => setMode("login")}>Back to sign in</button>}
          {mode === "login" && (
            <>
              <button className="link" onClick={() => setMode("forgot")}>Forgot password?</button>
              <span className="sep">·</span>
              <button className="link" onClick={() => setMode("register")}>Create account</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
