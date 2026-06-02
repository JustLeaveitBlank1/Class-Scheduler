import React, { useState } from "react";
import { AuthAPI } from "./AuthAPI";
import "./login.css";

type Mode = "login" | "register" | "forgot";
type Props = {
  onLoggedIn?: (me: { email: string; full_name?: string } | null) => void;
};

type Strength = "weak" | "medium" | "strong";

function getPasswordStrength(pw: string): Strength {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

export default function LoginPage({ onLoggedIn }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const isRegister = mode === "register";

  const showPasswordStrength = isRegister && password.length > 0;
  const strength = showPasswordStrength ? getPasswordStrength(password) : null;
  const isWeak = strength === "weak";

  const showConfirmFeedback =
    isRegister && confirmPassword.length > 0 && password.length > 0;
  const passwordsMatch = !isRegister || password === confirmPassword;

  const disableSubmit =
    loading ||
    (isRegister &&
      (password.length < 6 ||
        !confirmPassword ||
        !passwordsMatch ||
        isWeak));

  const switchMode = (next: Mode) => {
    setMode(next);
    setMsg(null);
    setPassword("");
    setConfirmPassword("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (isRegister) {
      if (!passwordsMatch) {
        setMsg("Passwords do not match.");
        return;
      }
      if (isWeak) {
        setMsg("Please choose a stronger password before continuing.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await AuthAPI.login({ email, password });
        const me = await AuthAPI.me();
        onLoggedIn?.(me);
        if (!onLoggedIn) location.href = location.href;
      } else if (mode === "register") {
        await AuthAPI.signup({ full_name: name || undefined, email, password });
        setMsg("Account created. You can sign in now.");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
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
      {/* Brand logo in the far top-left of the screen */}
      <div className="auth-brand">
        {/* Replace this with <img src="/your-logo.svg" ...> if you have a real logo */}
        <div className="auth-logo-mark">SP</div>
        <div className="auth-logo-text">
          <div className="auth-logo-title">SchedulePro</div>
          <div className="auth-logo-sub">Southeastern Cmps_411</div>
        </div>
      </div>

      {/* Background glow blobs */}
      <div className="auth-bg-orb orb-1" aria-hidden="true" />
      <div className="auth-bg-orb orb-2" aria-hidden="true" />

      <div
        className="auth-card"
        role="dialog"
        aria-labelledby="auth-title"
        aria-describedby="auth-desc"
      >
        <header className="auth-header">
          <div className="dot dot-red" />
          <div className="dot dot-yellow" />
          <div className="dot dot-green" />
        </header>

        <h1 id="auth-title" className="auth-title">
          {mode === "login"
            ? "Sign in"
            : mode === "register"
            ? "Create your account"
            : "Forgot password"}
        </h1>
        <p id="auth-desc" className="auth-sub">
          {mode === "login"
            ? "Use your work or school email"
            : mode === "register"
            ? "Just a few quick details"
            : "Enter your email to receive a reset link"}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="field">
              <span>Full name (optional)</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
              />
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
            />
          </label>

          {mode !== "forgot" && (
            <>
              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  required
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />

                {showPasswordStrength && strength && (
                  <div className={`pw-meter pw-${strength}`}>
                    <div className="pw-meter-track">
                      <div className={`pw-meter-fill pw-${strength}`} />
                    </div>
                    <span className="pw-meter-label">
                      {strength === "weak" &&
                        "Weak — try a longer password with numbers & symbols."}
                      {strength === "medium" &&
                        "Medium — adding more length or symbols makes it stronger."}
                      {strength === "strong" && "Strong password ✔"}
                    </span>
                  </div>
                )}
              </label>

              {isRegister && (
                <label className="field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type your password"
                    minLength={6}
                  />
                  {showConfirmFeedback && (
                    <div
                      className={
                        passwordsMatch
                          ? "pw-match pw-match-ok"
                          : "pw-match pw-match-error"
                      }
                    >
                      {passwordsMatch
                        ? "Passwords match ✔"
                        : "Passwords do not match."}
                    </div>
                  )}
                </label>
              )}
            </>
          )}

          {msg && (
            <div className="note" role="status">
              {msg}
            </div>
          )}

          <button className="btn btn-primary" disabled={disableSubmit}>
            {loading
              ? "Please wait…"
              : mode === "login"
              ? "Sign in"
              : mode === "register"
              ? "Create account"
              : "Send reset link"}
          </button>
        </form>

        <div className="auth-links">
          {mode !== "login" && (
            <button className="link" onClick={() => switchMode("login")}>
              Back to sign in
            </button>
          )}
          {mode === "login" && (
            <>
              <button className="link" onClick={() => switchMode("forgot")}>
                Forgot password?
              </button>
              <span className="sep">·</span>
              <button className="link" onClick={() => switchMode("register")}>
                Create account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
