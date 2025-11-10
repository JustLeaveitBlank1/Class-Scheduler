// src/components/WeekCalendar.tsx
// After
import {
  forwardRef, useEffect, useImperativeHandle, useMemo, useState,
} from "react";
 "react";
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
import { meetingSlots } from "../data";
import { useStore } from "../store";
import type { ViewMode, MeetingSlotId } from "../types";
import WeekView from "./calendar/WeekView";
import DayView from "./calendar/DayView";
import MonthView from "./calendar/MonthView";
import YearView from "./calendar/YearView";

export type CalendarView = "day" | "week" | "month" | "year";
export type WeekCalendarHandle = {
  prev: () => void;
  next: () => void;
  today: () => void;
  setView: (v: CalendarView) => void;
};

type Props = {
  /** Hide the internal toolbar so the parent (App.tsx) can render controls in the top bar. */
  hideToolbar?: boolean;
  /** If provided, force the view to this value (kept in sync with the top bar). */
  viewOverride?: CalendarView;
};

const dayKeys = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// helper: minutes -> "HH:MM"
const toHHMM = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const WeekCalendar = forwardRef<WeekCalendarHandle, Props>(function WeekCalendar(
  { hideToolbar = false, viewOverride },
  ref
) {
  const {
    sections,
    filters,
    loading,
    error,
    loadCatalog,
    loadSections,
  } = useStore();

  // initial fetch for catalog + sections
  useEffect(() => {
    (async () => {
      await loadCatalog();
      await loadSections();
    })();
  }, [loadCatalog, loadSections]);

  const [view, setView] = useState<CalendarView>("week");
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date(), 0));
  const [, setTick] = useState(0);

  // sync view from parent
  useEffect(() => {
    if (viewOverride && viewOverride !== view) setView(viewOverride);
  }, [viewOverride, view]);

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
      if (pop && pop.contains(target)) return;

      const col = target?.closest("[data-day-col]") as HTMLElement | null;
      if (col) {
        const iso = col.getAttribute("data-date");
        if (!iso) return;
        const date = new Date(iso);

        const rect = col.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const pct = Math.min(1, Math.max(0, y / rect.height));

        const total = DAY_END - DAY_START;
        const raw = DAY_START + Math.round(pct * total);
        const snapped = Math.round(raw / 30) * 30;
        const startMin = Math.max(DAY_START, Math.min(DAY_END - 60, snapped));
        const endMin = Math.min(DAY_END, startMin + 60);
        setCreator({ date, startMin, endMin, x: e.clientX, y: e.clientY });
        return;
      }

      if (creator) setCreator(null);
    };

    window.addEventListener("pointerdown", onGlobalPointerDown, true);
    return () => window.removeEventListener("pointerdown", onGlobalPointerDown, true);
  }, [creator]);

  // sections to show (apply filters)
  const visible = useMemo(() => {
    const mode: ViewMode = filters.mode;
    return sections.filter(s => {
      if (mode === "rooms" && filters.rooms.length > 0) {
        if (!filters.rooms.includes(s.roomId)) return false;
      }
      if (mode === "instructors" && filters.instructors.length > 0) {
        if (!filters.instructors.includes(s.instructorId)) return false;
      }
      return true;
    });
  }, [sections, filters]);

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

  // expose handlers to parent
  useImperativeHandle(ref, () => ({
    prev: gotoPrev,
    next: gotoNext,
    today: gotoToday,
    setView: (v: CalendarView) => setView(v),
  }), []);

  // direct onEmptyClick from WeekView
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
      {/* Top status */}
      {loading && <div className="mb-2 text-sm text-neutral-500">Loading…</div>}
      {error && <div className="mb-2 text-sm text-red-600">Error: {error}</div>}

      {/* Internal controls (hidden when parent provides toolbar) */}
      {!hideToolbar && (
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
      )}

      {/* Content */}
      <div className="h-[calc(100vh-120px)]">
        {view === "week" && (
          <WeekView
            weekDays={weekDays}
            sections={visible}
            onEmptyClick={handleEmptyClick}
          />
        )}
        {view === "day" && <DayView date={new Date()} sections={visible} />}
        {view === "month" && <MonthView anchor={weekStart} />}
        {view === "year" && <YearView year={new Date().getFullYear()} />}
      </div>

      {/* Create popover */}
      {creator && <CreatePopover data={creator} onClose={() => setCreator(null)} />}
    </div>
  );
});

export default WeekCalendar;

// re-exports for other views (still useful elsewhere)
export { isToday, isThisWeek, nowLinePct };

/* ---------- Inline Create Popover (uses catalog + slots) ---------- */

function CreatePopover({
  data,
  onClose,
}: {
  data: { date: Date; startMin: number; endMin: number; x: number; y: number };
  onClose: () => void;
}) {
  const {
    courses,
    instructors,
    rooms,
    addSection,
  } = useStore();

  // default selections
  const [courseId, setCourseId] = useState<string>(courses[0]?.id ?? "");
  const [instructorId, setInstructorId] = useState<number>(instructors[0]?.id ?? 1);
  const [roomId, setRoomId] = useState<number>(rooms[0]?.id ?? 1);
  const [seats, setSeats] = useState<number>(30);

  // Filter meeting slots to those that include the clicked day
  const weekdayShort = data.date.toLocaleDateString(undefined, { weekday: "short" }) as "Sun"|"Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat";
  const dayKey = weekdayShort;
  const daySlots = meetingSlots.filter(s => s.pattern.includes(dayKey as any));

  // Prefer a slot that matches the clicked time range; else first option
  const initialSlotId: MeetingSlotId | undefined = useMemo(() => {
    const clickedStart = toHHMM(data.startMin);
    const clickedEnd = toHHMM(data.endMin);
    const byTime = daySlots.find(s => s.start === clickedStart && s.end === clickedEnd);
    return (byTime ?? daySlots[0])?.id;
  }, [data.startMin, data.endMin, daySlots]);

  const [meetingSlotId, setMeetingSlotId] = useState<MeetingSlotId | "">(
    initialSlotId ?? ""
  );

  // contain + flip above if near bottom
  const POPOVER_W = 360;
  const POPOVER_H = 300;
  const willOverflowBottom = data.y + 12 + POPOVER_H > window.innerHeight;
  const top = willOverflowBottom ? data.y - 12 - POPOVER_H : data.y + 12;
  const left = Math.min(window.innerWidth - POPOVER_W - 12, data.x + 12);

  const save = async () => {
    if (!courseId || !meetingSlotId) return;
    await addSection({
      courseId,
      instructorId,
      roomId,
      seats,
      meetingSlotId,
    });
    onClose();
  };

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

      <label className="block text-sm mb-2">
        Course
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="mt-1 w-full border rounded px-2 py-1"
        >
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.title}
            </option>
          ))}
        </select>
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

      <label className="block text-sm mb-2">
        Meeting Slot ({dayKey})
        <select
          value={meetingSlotId}
          onChange={(e) => setMeetingSlotId(e.target.value as MeetingSlotId)}
          className="mt-1 w-full border rounded px-2 py-1"
        >
          {daySlots.map(s => (
            <option key={s.id} value={s.id}>
              {s.label} ({s.start}–{s.end})
            </option>
          ))}
          {daySlots.length === 0 && (
            <option value="">No slots for this day</option>
          )}
        </select>
      </label>

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
          disabled={!courseId || !meetingSlotId}
          className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}
