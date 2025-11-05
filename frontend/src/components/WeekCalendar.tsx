// src/components/WeekCalendar.tsx
import { useMemo, useState, useEffect } from "react";
import {
  getWeekStart,
  getWeekDays,
  formatDayLabel,
  isToday,
  isThisWeek,
  nowLinePct,
  prevWeek,
  nextWeek,
  DAY_START,
  DAY_END,
} from "../utils/time";
import { useStore } from "../store";
import type { ViewMode } from "../types";
import WeekView from "./calendar/WeekView";
import DayView from "./calendar/DayView";
import MonthView from "./calendar/MonthView";
import YearView from "./calendar/YearView";
import { instructors, rooms } from "../data";

type CalendarView = "day" | "week" | "month" | "year";
const dayKeys = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// helper: minutes -> "HH:MM"
const toHHMM = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

export default function WeekCalendar() {
  const { sections, filters } = useStore();

  const [view, setView] = useState<CalendarView>("week");
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date(), 0));
  const [, setTick] = useState(0);

  // popover state
  const [creator, setCreator] = useState<null | {
    date: Date;
    startMin: number;
    endMin: number;
    x: number;
    y: number;
  }>(null);

  // keep the now line moving + roll week
  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
      const fresh = getWeekStart(new Date(), 0);
      if (fresh.getTime() !== weekStart.getTime()) setWeekStart(fresh);
    }, 60_000);
    return () => clearInterval(id);
  }, [weekStart]);

  // allow clicking anywhere on a day column to MOVE the popover (even when it’s open)
  useEffect(() => {
    const onGlobalPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const pop = document.getElementById("create-popover");
      if (pop && pop.contains(target)) return; // clicks inside popover stay inside

      // clicked on a day column?
      const col = target?.closest("[data-day-col]") as HTMLElement | null;
      if (col) {
        const iso = col.getAttribute("data-date");
        if (!iso) return;
        const date = new Date(iso);

        const rect = col.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const pct = Math.min(1, Math.max(0, y / rect.height));

        // map pct -> minutes window, snap to 30 mins
        const total = DAY_END - DAY_START;
        const raw = DAY_START + Math.round(pct * total);
        {
          const snapped = Math.round(raw / 30) * 30;
          const startMin = Math.max(DAY_START, Math.min(DAY_END - 60, snapped));
          const endMin = Math.min(DAY_END, startMin + 60);
          setCreator({ date, startMin, endMin, x: e.clientX, y: e.clientY });
        }
        return;
      }

      // clicked completely outside grid and popover -> close it
      if (creator) setCreator(null);
    };

    window.addEventListener("pointerdown", onGlobalPointerDown, true); // capture phase
    return () => window.removeEventListener("pointerdown", onGlobalPointerDown, true);
  }, [creator]);

  // sections to show
  const visible = useMemo(() => {
    const mode: ViewMode = filters.mode;
    if (mode === "rooms") return sections;
    return sections;
  }, [sections, filters.mode]);

  // Sun–Sat header
  const weekDays = useMemo(() => {
    const all7 = getWeekDays(weekStart);
    return all7.map((d, i) => ({
      key: dayKeys[i],
      label: formatDayLabel(d),
      date: d,
    }));
  }, [weekStart]);

  // nav
  const gotoPrev = () => setWeekStart((w) => prevWeek(w));
  const gotoNext = () => setWeekStart((w) => nextWeek(w));
  const gotoToday = () => setWeekStart(getWeekStart(new Date(), 0));

  // direct onEmptyClick from WeekView (still works when popover is closed)
  const handleEmptyClick: NonNullable<
    Parameters<typeof WeekView>[0]["onEmptyClick"]
  > = ({ date, pct, clientX, clientY }) => {
    const total = DAY_END - DAY_START;
    const raw = DAY_START + Math.round(pct * total);
    const snapped = Math.round(raw / 30) * 30;
    const startMin = Math.max(DAY_START, Math.min(DAY_END - 60, snapped));
    const endMin = Math.min(DAY_END, startMin + 60);
    setCreator({ date, startMin, endMin, x: clientX, y: clientY });
  };

  return (
    <div className="p-4">
      {/* Controls */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={gotoPrev}
            className="px-3 py-1.5 rounded-md border border-neutral-300
                       bg-white text-neutral-800 hover:bg-neutral-50
                       dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={gotoToday}
            className="px-3 py-1.5 rounded-md border border-neutral-300
                       bg-white text-neutral-800 hover:bg-neutral-50
                       dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Today
          </button>
          <button
            type="button"
            onClick={gotoNext}
            className="px-3 py-1.5 rounded-md border border-neutral-300
                       bg-white text-neutral-800 hover:bg-neutral-50
                       dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Next →
          </button>
        </div>

        {/* View dropdown + avatar */}
        <div className="flex items-center gap-2">
          <details className="relative">
            <summary
              className="list-none cursor-pointer select-none px-3 py-1.5 rounded-full border
                         bg-neutral-900 text-white dark:bg-black hover:bg-neutral-800"
            >
              {view[0].toUpperCase() + view.slice(1)} ▼
            </summary>
            <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-neutral-900 text-white shadow-lg overflow-hidden z-20">
              {(["day", "week", "month", "year"] as CalendarView[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setView(v);
                    (document.activeElement as HTMLElement)?.blur();
                  }}
                  className={[
                    "w-full text-left px-3 py-2 hover:bg-neutral-800",
                    view === v ? "bg-blue-600 hover:bg-blue-600" : "",
                  ].join(" ")}
                >
                  <span className="inline-block w-16">
                    {v[0].toUpperCase() + v.slice(1)}
                  </span>
                  <span className="opacity-70 float-right">
                    {v === "day" ? "D" : v === "week" ? "W" : v === "month" ? "M" : "Y"}
                  </span>
                </button>
              ))}
            </div>
          </details>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700"
            title="Account"
            aria-label="Account"
          />
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-120px)]">
        {view === "week" && (
          <WeekView
            weekDays={weekDays}
            /* weekStart prop removed in cleaned WeekView */
            sections={visible}
            onEmptyClick={handleEmptyClick}
          />
        )}
        {view === "day" && <DayView date={new Date()} sections={visible} />}
        {view === "month" && <MonthView anchor={weekStart} />}
        {view === "year" && <YearView year={new Date().getFullYear()} />}
      </div>

      {/* Create popover */}
      {creator && (
        <CreatePopover
          data={creator}
          onClose={() => setCreator(null)}
          onSave={(payload) => {
            console.log("Create section payload", payload);
            // TODO: call store/back-end (POST /sections), then refresh state.
            setCreator(null);
          }}
        />
      )}
    </div>
  );
}

// re-exports for other views (still useful elsewhere)
export { isToday, isThisWeek, nowLinePct };

/* ---------- Inline Create Popover (auto-flip & contain) ---------- */

function CreatePopover({
  data,
  onClose,
  onSave,
}: {
  data: { date: Date; startMin: number; endMin: number; x: number; y: number };
  onClose: () => void;
  onSave: (payload: {
    date: Date;
    start: string; // "HH:MM"
    end: string;
    courseId: string;
    instructorId: number;
    roomId: number;
    seats: number;
  }) => void;
}) {
  const [courseId, setCourseId] = useState<string>("");
  const [instructorId, setInstructorId] = useState<number>(instructors[0]?.id ?? 1);
  const [roomId, setRoomId] = useState<number>(rooms[0]?.id ?? 1);
  const [seats, setSeats] = useState<number>(30);
  const [startMin, setStartMin] = useState<number>(data.startMin);
  const [endMin, setEndMin] = useState<number>(data.endMin);

  // 🔄 Sync start/end when user clicks a different day/time while popover is open
  useEffect(() => {
    setStartMin(data.startMin);
    setEndMin(data.endMin);
  }, [data.startMin, data.endMin, data.date]);

  const save = () =>
    onSave({
      date: data.date,
      start: toHHMM(startMin),
      end: toHHMM(endMin),
      courseId,
      instructorId,
      roomId,
      seats,
    });

  // contain + flip above if near bottom
  const POPOVER_W = 340;
  const POPOVER_H = 260;
  const willOverflowBottom = data.y + 12 + POPOVER_H > window.innerHeight;
  const top = willOverflowBottom ? data.y - 12 - POPOVER_H : data.y + 12;
  const left = Math.min(window.innerWidth - POPOVER_W - 12, data.x + 12);

  return (
    <div
      id="create-popover"
      style={{
        position: "fixed",
        top: Math.max(12, top),
        left: Math.max(12, left),
        zIndex: 50,
        width: POPOVER_W,
      }}
      className="rounded-xl border bg-white shadow-xl p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">
          {data.date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </div>
        <button onClick={onClose} className="px-2 py-1 text-sm rounded-md border hover:bg-neutral-50">
          ✕
        </button>
      </div>

      <div className="flex gap-2 mb-2">
        <label className="flex-1 text-sm">
          Start
          <input
            type="time"
            value={toHHMM(startMin)}
            onChange={(e) => {
              const [h, m] = e.target.value.split(":").map(Number);
              const v = Math.max(DAY_START, Math.min(DAY_END - 30, h * 60 + m));
              setStartMin(v);
              if (v >= endMin) setEndMin(Math.min(v + 60, DAY_END));
            }}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>
        <label className="flex-1 text-sm">
          End
          <input
            type="time"
            value={toHHMM(endMin)}
            onChange={(e) => {
              const [h, m] = e.target.value.split(":").map(Number);
              const v = Math.min(DAY_END, h * 60 + m);
              setEndMin(Math.max(startMin + 30, v));
            }}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>
      </div>

      <label className="block text-sm mb-2">
        Course
        <input
          placeholder="e.g., CHEM 101"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="mt-1 w-full border rounded px-2 py-1"
        />
      </label>

      <div className="flex gap-2 mb-2">
        <label className="flex-1 text-sm">
          Instructor
          <select
            value={instructorId}
            onChange={(e) => setInstructorId(Number(e.target.value))}
            className="mt-1 w-full border rounded px-2 py-1"
          >
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 text-sm">
          Room
          <select
            value={roomId}
            onChange={(e) => setRoomId(Number(e.target.value))}
            className="mt-1 w-full border rounded px-2 py-1"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name ?? `Room ${r.id}`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm mb-3">
        Seats
        <input
          type="number"
          min={1}
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          className="mt-1 w-full border rounded px-2 py-1"
        />
      </label>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-1.5 border rounded-md hover:bg-neutral-50">
          Cancel
        </button>
        <button
          onClick={save}
          className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
