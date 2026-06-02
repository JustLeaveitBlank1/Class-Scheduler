// src/App.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import WeekCalendar, {
  type WeekCalendarHandle,
  type CalendarView,
} from "./components/WeekCalendar";
import LoginPage from "./components/auth/LoginPage";
import { AuthAPI } from "./components/auth/AuthAPI";
import AccountMenu from "./components/account/AccountMenu";
import AdminDashboard from "./components/admin/AdminDashboard";

import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { useStore } from "./store"; // 👈 NEW

type Me = { email: string; full_name?: string } | null;
type AppView = "calendar" | "admin";

export default function App() {
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<CalendarView>("week");
  const calRef = useRef<WeekCalendarHandle>(null);

  const [openSidebar, setOpenSidebar] = useState(false);
  const [appView, setAppView] = useState<AppView>("calendar");

  // --- Filters UI state (for the dropdown) ---
  const [filtersOpen, setFiltersOpen] = useState(false);

  // data + filter setters from store
  const {
    rooms,
    instructors,
    filters,
    setMode,
    setRooms,
    setInstructors,
  } = useStore();

  useEffect(() => {
    (async () => {
      try {
        setMe(await AuthAPI.me());
      } catch {
        setMe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await AuthAPI.logout?.();
    } catch {
      // ignore error, still log out locally
    } finally {
      setMe(null);
      setAppView("calendar");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-950">
        <div className="text-neutral-500">Loading…</div>
      </div>
    );
  }

  if (!me) return <LoginPage onLoggedIn={setMe} />;

  // called when sidebar "+ Create" is pressed
  const handleSidebarCreate = (date: Date) => {
    calRef.current?.openCreate(date);
    setOpenSidebar(false);
  };

  // helpers to toggle individual filter chips
  const toggleRoom = (id: number) => {
    setRooms(
      filters.rooms.includes(id)
        ? filters.rooms.filter((r) => r !== id)
        : [...filters.rooms, id]
    );
  };

  const toggleInstructor = (id: number) => {
    setInstructors(
      filters.instructors.includes(id)
        ? filters.instructors.filter((i) => i !== id)
        : [...filters.instructors, id]
    );
  };

  const clearFilters = () => {
    setRooms([]);
    setInstructors([]);
  };

  const isRoomsMode = filters.mode === "rooms";

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      {/* ======= TOP BAR ======= */}
      <header className="sticky top-0 z-20 px-3 py-2 flex items-center gap-3 bg-neutral-900 text-neutral-200 border-b border-neutral-800">
        {/* Account menu in top-left */}
        <AccountMenu
          userLabel={me?.email ?? "Admin"}
          onManageAccount={() => setAppView("admin")}
          onLogout={handleLogout}
        />

        {appView === "calendar" && (
          <>
            {/* Hamburger */}
            <button
              aria-label="Main menu"
              onClick={() => setOpenSidebar(true)}
              className="w-11 h-11 rounded-full border border-neutral-700 hover:bg-neutral-800 inline-flex items-center justify-center text-neutral-200"
              title="Main menu"
            >
              <span className="text-2xl leading-none relative top-[-1px]">
                ≡
              </span>
            </button>

            {/* Prev */}
            <button
              aria-label="Previous"
              onClick={() => calRef.current?.prev()}
              className="w-11 h-11 rounded-full border border-neutral-700 hover:bg-neutral-800 inline-flex items-center justify-center text-neutral-200"
              title="Previous"
            >
              <span className="text-2xl leading-none relative top-[-1px]">
                ‹
              </span>
            </button>

            {/* Next */}
            <button
              aria-label="Next"
              onClick={() => calRef.current?.next()}
              className="w-11 h-11 rounded-full border border-neutral-700 hover:bg-neutral-800 inline-flex items-center justify-center text-neutral-200"
              title="Next"
            >
              <span className="text-2xl leading-none relative top-[-1px]">
                ›
              </span>
            </button>

            {/* Today chip */}
            <button
              onClick={() => calRef.current?.today()}
              className="px-6 h-11 rounded-full border border-neutral-700 hover:bg-neutral-800 inline-flex items-center justify-center text-base font-medium"
              title="Jump to today"
            >
              <span className="relative top-[-1px]">Today</span>
            </button>

            {/* Right side: Filters + View chip */}
            <div className="ml-auto flex items-center gap-3 relative">
              {/* Filters button */}
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                className="px-5 h-10 rounded-full border border-neutral-700 hover:bg-neutral-800 inline-flex items-center justify-center text-sm font-medium"
                title="Filter by room or instructor"
              >
                Filters
                {(filters.rooms.length > 0 || filters.instructors.length > 0) && (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-xs leading-none px-2 py-0.5">
                    {filters.rooms.length + filters.instructors.length}
                  </span>
                )}
              </button>

              {/* Filters dropdown panel */}
              {filtersOpen && (
                <div className="absolute right-40 top-11 mt-2 w-80 rounded-xl border border-neutral-700 bg-neutral-900 shadow-xl z-30">
                  {/* Mode toggle */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800">
                    <div className="text-sm font-medium">Filters</div>
                    <div className="inline-flex text-xs rounded-full bg-neutral-800 p-1">
                      <button
                        type="button"
                        onClick={() => setMode("rooms")}
                        className={[
                          "px-3 py-1 rounded-full",
                          isRoomsMode ? "bg-blue-600 text-white" : "text-neutral-200",
                        ].join(" ")}
                      >
                        Rooms
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode("instructors")}
                        className={[
                          "px-3 py-1 rounded-full",
                          !isRoomsMode ? "bg-blue-600 text-white" : "text-neutral-200",
                        ].join(" ")}
                      >
                        Instructors
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="max-h-72 overflow-auto px-3 py-2 text-sm">
                    {isRoomsMode ? (
                      <>
                        {rooms.map((r) => (
                          <label
                            key={r.id}
                            className="flex items-center gap-2 py-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="accent-blue-500"
                              checked={filters.rooms.includes(r.id)}
                              onChange={() => toggleRoom(r.id)}
                            />
                            <span className="text-xs">
                            {r.room_number}
                            </span>

                          </label>
                        ))}
                        {rooms.length === 0 && (
                          <div className="text-xs text-neutral-500 py-1">
                            No rooms loaded.
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {instructors.map((ins) => (
                          <label
                            key={ins.id}
                            className="flex items-center gap-2 py-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="accent-blue-500"
                              checked={filters.instructors.includes(ins.id)}
                              onChange={() => toggleInstructor(ins.id)}
                            />
                            <span>{ins.name}</span>
                          </label>
                        ))}
                        {instructors.length === 0 && (
                          <div className="text-xs text-neutral-500 py-1">
                            No instructors loaded.
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-3 py-2 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs text-neutral-300 hover:text-white"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setFiltersOpen(false)}
                      className="text-xs px-3 py-1 rounded-full border border-neutral-700 hover:bg-neutral-800"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* View dropdown (existing) */}
              <details className="relative">
                <summary
                  className="list-none cursor-pointer select-none px-5 h-10 rounded-full border border-neutral-700 hover:bg-neutral-800 inline-flex items-center justify-center leading-none text-base"
                  title="Change view"
                >
                  {view[0].toUpperCase() + view.slice(1)}
                  <svg
                    className="ml-1"
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.24 4.25a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" />
                  </svg>
                </summary>
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-neutral-700 bg-neutral-900 shadow-lg overflow-hidden z-30">
                  {(["day", "week", "month", "year"] as CalendarView[]).map(
                    (v) => (
                      <button
                        key={v}
                        onClick={() => {
                          setView(v);
                          calRef.current?.setView(v);
                          (document.activeElement as HTMLElement)?.blur();
                        }}
                        className={[
                          "w-full text-left px-3 py-2 hover:bg-neutral-800",
                          view === v ? "bg-blue-600 hover:bg-blue-600" : "",
                        ].join(" ")}
                      >
                        {v[0].toUpperCase() + v.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </details>
            </div>
          </>
        )}

        {appView === "admin" && (
          <div className="ml-auto">
            <button
              type="button"
              onClick={() => setAppView("calendar")}
              className="px-4 h-10 rounded-full border border-neutral-700 hover:bg-neutral-800 text-sm font-medium"
            >
              Back to calendar
            </button>
          </div>
        )}
      </header>

      {/* Sidebar drawer (calendar only) */}
      {appView === "calendar" && (
        <Sidebar
          open={openSidebar}
          onClose={() => setOpenSidebar(false)}
          onCreate={handleSidebarCreate}
        />
      )}

      {/* Main content */}
      {appView === "calendar" ? (
        <WeekCalendar ref={calRef} hideToolbar viewOverride={view} />
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
}

/* ---------------- Sidebar (drawer) ---------------- */

function Sidebar({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (date: Date) => void;
}) {
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date>(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 });
    const end = startOfWeek(addDays(endOfMonth(anchor), 7), {
      weekStartsOn: 0,
    });
    const out: Date[] = [];
    for (let d = start; d < end; d = addDays(d, 1)) out.push(d);
    return out;
  }, [anchor]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed inset-y-0 left-0 z-40 w-80 max-w=[85vw] bg-neutral-900 text-neutral-100 border-r border-neutral-800 shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800">
          <div className="font-semibold">Menu</div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-neutral-700 hover:bg-neutral-800 inline-flex items-center justify-center"
            aria-label="Close menu"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-3 space-y-4 overflow-auto">
          {/* + Create uses the selected date */}
          <button
            className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
            onClick={() => onCreate(selected)}
          >
            + Create
          </button>

          <div className="rounded-xl border border-neutral-800 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-neutral-800">
              <button
                onClick={() => setAnchor((d) => addMonths(d, -1))}
                className="w-8 h-8 rounded-full hover:bg-neutral-700 inline-flex items-center justify-center"
                aria-label="Previous month"
                title="Previous month"
              >
                ‹
              </button>
              <div className="text-sm font-medium">
                {format(anchor, "MMMM yyyy")}
              </div>
              <button
                onClick={() => setAnchor((d) => addMonths(d, 1))}
                className="w-8 h-8 rounded-full hover:bg-neutral-700 inline-flex items-center justify-center"
                aria-label="Next month"
                title="Next month"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 text-center text-xs bg-neutral-900/70 px-2 py-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-1 opacity-70">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 p-2">
              {days.map((d) => {
                const inMonth = isSameMonth(d, anchor);
                const isTodayCell = isSameDay(d, new Date());
                const isSelected = isSameDay(d, selected);

                return (
                  <button
                    type="button"
                    key={d.toISOString()}
                    onClick={() => {
                      setSelected(d);
                      if (!isSameMonth(d, anchor)) {
                        setAnchor(d);
                      }
                    }}
                    className={[
                      "h-8 flex items-center justify-center rounded-md text-sm transition-colors",
                      inMonth ? "text-neutral-100" : "text-neutral-500",
                      "hover:bg-neutral-800",
                      isSelected ? "bg-blue-600 text-white" : "",
                      !isSelected && isTodayCell
                        ? "border border-blue-500"
                        : "",
                    ].join(" ")}
                    title={format(d, "EEE, MMM d")}
                  >
                    {format(d, "d")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
