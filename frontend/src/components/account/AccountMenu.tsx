import { useState } from "react";

type Props = {
  userLabel?: string; // e.g. "Austin Sprunk" or "austinsprunk77@gmail.com"
  onManageAccount: () => void;
  onLogout: () => void;
};

// Get initials from a name or email
function getInitials(label?: string) {
  if (!label) return "SC"; // fallback: Scheduleith

  let base = label;

  // If it's an email, use the part before "@"
  if (base.includes("@")) {
    base = base.split("@")[0]; // "austinsprunk77"
  }

  // Keep only letters and spaces, split into words
  base = base.replace(/[^a-zA-Z ]+/g, " ").trim();
  const parts = base.split(/\s+/).filter(Boolean);

  // First + last name => AS
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // Single word => first two letters, e.g. "Austin" -> AU
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return "SC";
}

export default function AccountMenu({
  userLabel = "Admin",
  onManageAccount,
  onLogout,
}: Props) {
  const [open, setOpen] = useState(false);
  const initials = getInitials(userLabel);

  return (
    <div className="relative">
      {/* Top-left button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1.5
                   text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50
                   dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
          {initials}
        </span>
        <span className="hidden sm:inline">Scheduleith</span>
        <span className="text-xs text-neutral-500">▼</span>
      </button>

      {open && (
        <div
          className="absolute left-0 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200
                     bg-white shadow-lg dark:bg-neutral-900 dark:border-neutral-700 z-50"
        >
          <div className="px-3 py-2 text-xs text-neutral-500">
            Signed in as
            <div className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-50 truncate">
              {userLabel}
            </div>
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-700" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onManageAccount();
            }}
            className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50
                       dark:hover:bg-neutral-800"
          >
            Manage account
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50
                       dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
