// src/components/account/AccountButton.tsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AuthAPI } from "../auth/AuthAPI";

type Me = { email: string; full_name?: string } | null;

export default function AccountButton() {
  const [me, setMe] = useState<Me>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => { AuthAPI.me().then(setMe).catch(() => setMe(null)); }, []);

  const initials =
    (me?.full_name || me?.email || "?")
      .split(/\s+/).map(s => s[0]?.toUpperCase()).slice(0, 2).join("") || "U";

  function openMenu() {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const width = 260; // menu width
    const margin = 10;
    const left = Math.min(Math.max(r.left, margin), window.innerWidth - width - margin);
    const top = r.bottom + 8; // 8px gap below button
    setPos({ top, left });
    setOpen(true);
  }

  function closeMenu() { setOpen(false); }

  async function onLogout() {
    try { await AuthAPI.logout(); } finally { location.reload(); }
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => (open ? closeMenu() : openMenu())}
        aria-haspopup="menu"
        aria-expanded={open}
        title={me?.email || "Account"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          borderRadius: 9999,
          padding: "6px 10px",
          background: "#222",
          color: "white",
          border: "1px solid #444"
        }}
      >
        <span
          aria-hidden
          style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "#4b5563", display: "grid", placeItems: "center",
            fontWeight: 700
          }}
        >
          {initials}
        </span>
        <span style={{ fontSize: 14 }}>{me?.full_name || me?.email || "Account"}</span>
      </button>

      {/* PORTAL MENU */}
      {open &&
        createPortal(
          <>
            {/* click-catcher/backdrop (transparent) */}
            <div
              onClick={closeMenu}
              style={{
                position: "fixed", inset: 0, zIndex: 10000, // above everything
                background: "transparent"
              }}
            />
            {/* the popover card */}
            <div
              role="menu"
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                width: 260,
                zIndex: 10001,
                background: "#111",            // opaque background → no bleed-through
                color: "white",
                border: "1px solid #333",
                borderRadius: 14,
                padding: 8,
                boxShadow: "0 14px 32px rgba(0,0,0,.55)"
              }}
            >
              <div style={{ padding: "8px 10px", fontSize: 12, color: "#9ca3af" }}>
                Signed in as
                <div style={{ color: "white", fontWeight: 700 }}>{me?.email}</div>
              </div>
              <hr style={{ borderColor: "#2a2a2a" }} />
              {/* Add more items here later (Profile, Settings, etc.) */}
              <button
                role="menuitem"
                onClick={onLogout}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: "transparent", color: "white",
                  border: "none", padding: "12px 12px", borderRadius: 10,
                  cursor: "pointer"
                }}
              >
                Logout
              </button>
            </div>
          </>,
          document.body
        )
      }
    </>
  );
}
