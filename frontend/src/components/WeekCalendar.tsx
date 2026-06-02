// src/components/WeekCalendar.tsx
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

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
import type { ViewMode, SectionStatus, Section } from "../types";

import WeekView from "./calendar/WeekView";
import DayView from "./calendar/DayView";
import MonthView from "./calendar/MonthView";
import YearView from "./calendar/YearView";
import type { CalendarSection } from "./calendar/DayColumn";

export type CalendarView = "day" | "week" | "month" | "year";

export type WeekCalendarHandle = {
  prev: () => void;
  next: () => void;
  today: () => void;
  setView: (v: CalendarView) => void;
  openCreate: (date?: Date) => void; // 👈 open create popover
};

type Props = {
  hideToolbar?: boolean;
  viewOverride?: CalendarView;
};

const dayKeys = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// helper: minutes -> "HH:MM"
const toHHMM = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

// helper: Date -> "YYYY-MM-DD" for <input type="date">
const toInputDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// how many weeks to repeat when "repeat weekly" is checked
const REPEAT_WEEKS = 15;
const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

// ---------- helpers for hidden [series:...] tag in notes ----------

function parseSeriesFromNotes(raw?: string | null): {
  seriesId: string | null;
  userNotes: string;
} {
  if (!raw) return { seriesId: null, userNotes: "" };

  const match = raw.match(/\[series:([a-zA-Z0-9-]+)\]/i);
  const seriesId = match ? match[1] : null;

  const userNotes = raw.replace(/\[series:[^\]]+\]\s*/i, "").trim();

  return { seriesId, userNotes };
}

function buildNotes(userNotes: string, seriesId: string | null): string {
  const trimmed = userNotes.trim();
  if (seriesId) {
    const tag = `[series:${seriesId}]`;
    return trimmed ? `${tag} ${trimmed}` : tag;
  }
  return trimmed;
}

function makeSeriesId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 12);
}

const WeekCalendar = forwardRef<WeekCalendarHandle, Props>(function WeekCalendar(
  { hideToolbar = false, viewOverride },
  ref
) {
  const {
    courses,
    sections,
    filters,
    loading,
    error,
    loadCatalog,
    loadSections,
    rooms,
    instructors,
    setFilterMode,
    setFilterRooms,
    setFilterInstructors,
    clearFilters,
  } = useStore();

  const [view, setView] = useState<CalendarView>("week");
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date(), 0));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [, setTick] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // for popup: which section (if editing) + base time info
  const [creator, setCreator] = useState<null | {
    date: Date;
    startMin: number;
    endMin: number;
    x: number;
    y: number;
  }>(null);
  const [editingSection, setEditingSection] = useState<CalendarSection | null>(
    null
  );

  // initial fetch for catalog + sections
  useEffect(() => {
    (async () => {
      await loadCatalog();
      await loadSections();
    })();
  }, [loadCatalog, loadSections]);

  // sync view from parent
  useEffect(() => {
    if (viewOverride && viewOverride !== view) setView(viewOverride);
  }, [viewOverride, view]);

  // keep the now line moving + roll week when the date changes
  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
      const fresh = getWeekStart(new Date(), 0);
      if (fresh.getTime() !== weekStart.getTime()) setWeekStart(fresh);
    }, 60_000);
    return () => window.clearInterval(id);
  }, [weekStart]);

  // sections to show (apply filters + attach displayLabel)
  const visible: CalendarSection[] = useMemo(() => {
    const mode: ViewMode = filters.mode;

    return sections
      .filter((s) => {
        if (mode === "rooms" && filters.rooms.length > 0) {
          if (!filters.rooms.includes(s.room_id)) return false;
        }
        if (mode === "instructors" && filters.instructors.length > 0) {
          if (!filters.instructors.includes(s.instructor_id)) return false;
        }
        return true;
      })
      .map((s) => {
        const course = courses.find((c) => c.id === s.course_id);
        const displayLabel = course
          ? `${course.code} — ${course.name}`
          : `Course ${s.course_id ?? ""}`;
        return { ...s, displayLabel } as CalendarSection;
      });
  }, [sections, filters, courses]);

  // Sun–Sat header
  const weekDays = useMemo(() => {
    const all7 = getWeekDays(weekStart);
    return all7.map((d, i) => ({
      key: dayKeys[i],
      label: formatDayLabel(d),
      date: d,
    }));
  }, [weekStart]);

  // ---------- navigation ----------

  const gotoPrev = () => {
    setWeekStart((w) => prevWeek(w));
    setSelectedDate((d) => addDays(d, -7));
  };

  const gotoNext = () => {
    setWeekStart((w) => nextWeek(w));
    setSelectedDate((d) => addDays(d, 7));
  };

  const gotoToday = () => {
    const today = new Date();
    setWeekStart(getWeekStart(today, 0));
    setSelectedDate(today);
  };

  // clicking a day in Month / Year
  const handleDaySelect = (date: Date) => {
    const onlyDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    setSelectedDate(onlyDate);
    setWeekStart(getWeekStart(onlyDate, 0));
    setView("day");
  };

  // open create popover from outside (sidebar button)
  const openCreate = (date?: Date) => {
    const base =
      date ??
      selectedDate ??
      new Date(); /* fallback: whatever day is currently selected */

    const baseDate = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate()
    );

    // default times: 9:00–10:00, clamped to calendar day
    let startMin = 9 * 60;
    startMin = Math.max(DAY_START, Math.min(DAY_END - 60, startMin));
    const endMin = Math.min(DAY_END, startMin + 60);

    setEditingSection(null);
    setSelectedDate(baseDate);
    setView("day");

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 3;

    setCreator({
      date: baseDate,
      startMin,
      endMin,
      x: centerX,
      y: centerY,
    });
  };

  // expose handlers to parent
  useImperativeHandle(
    ref,
    () => ({
      prev: gotoPrev,
      next: gotoNext,
      today: gotoToday,
      setView: (v: CalendarView) => setView(v),
      openCreate,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // click on an existing section → open edit/delete popover
  const handleSectionClick = (sec: CalendarSection) => {
    if (!sec.start || !sec.end) return; // ignore legacy demo sections

    const startDate = new Date(sec.start);
    const endDate = new Date(sec.end);
    const startMin = startDate.getHours() * 60 + startDate.getMinutes();
    const endMin = endDate.getHours() * 60 + endDate.getMinutes();

    const dayOnly = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );

    setEditingSection(sec);
    setSelectedDate(dayOnly);
    setView("day");

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 3;

    setCreator({
      date: dayOnly,
      startMin,
      endMin,
      x: centerX,
      y: centerY,
    });
  };

  const closePopover = () => {
    setCreator(null);
    setEditingSection(null);
  };

  // --- filter helpers for panel ---

  const toggleRoom = (id: number) => {
    const current = filters.rooms;
    if (current.includes(id)) {
      setFilterRooms(current.filter((r) => r !== id));
    } else {
      setFilterRooms([...current, id]);
    }
  };

  const toggleInstructor = (id: number) => {
    const current = filters.instructors;
    if (current.includes(id)) {
      setFilterInstructors(current.filter((r) => r !== id));
    } else {
      setFilterInstructors([...current, id]);
    }
  };

  const activeFilterCount =
    filters.rooms.length + filters.instructors.length;

  return (
    <div className="p-4">
      {/* Top status */}
      {loading && (
        <div className="mb-2 text-sm text-neutral-500">Loading…</div>
      )}
      {error && (
        <div className="mb-2 text-sm text-red-600">Error: {error}</div>
      )}

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

          <div className="flex items-center gap-2 relative">
            {/* View switcher */}
            <details className="relative">
              <summary
                className="list-none cursor-pointer select-none px-3 py-1.5 rounded-full border
                           bg-neutral-900 text-white dark:bg-black hover:bg-neutral-800"
              >
                {view[0].toUpperCase() + view.slice(1)} ▼
              </summary>
              <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-neutral-900 text-white shadow-lg overflow-hidden z-20">
                {(["day", "week", "month", "year"] as CalendarView[]).map(
                  (v) => (
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
                        {v === "day"
                          ? "D"
                          : v === "week"
                          ? "W"
                          : v === "month"
                          ? "M"
                          : "Y"}
                      </span>
                    </button>
                  )
                )}
              </div>
            </details>

            {/* Filters button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className="px-3 py-1.5 rounded-full border border-neutral-300
                           bg-white text-neutral-800 hover:bg-neutral-50
                           dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800
                           flex items-center gap-2 text-sm"
              >
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </button>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-72 rounded-lg border bg-white text-neutral-800 shadow-lg p-3 text-sm z-30 dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Filters</span>
                    <button
                      type="button"
                      onClick={() => {
                        clearFilters();
                      }}
                      className="text-xs px-2 py-1 rounded border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Mode toggle */}
                  <div className="mb-3">
                    <div className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1">
                      View by
                    </div>
                    <div className="inline-flex rounded-full border border-neutral-300 overflow-hidden dark:border-neutral-700">
                      <button
                        type="button"
                        onClick={() => setFilterMode("rooms")}
                        className={[
                          "px-3 py-1 text-xs",
                          filters.mode === "rooms"
                            ? "bg-blue-600 text-white"
                            : "bg-transparent text-neutral-700 dark:text-neutral-200",
                        ].join(" ")}
                      >
                        Rooms
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterMode("instructors")}
                        className={[
                          "px-3 py-1 text-xs",
                          filters.mode === "instructors"
                            ? "bg-blue-600 text-white"
                            : "bg-transparent text-neutral-700 dark:text-neutral-200",
                        ].join(" ")}
                      >
                        Instructors
                      </button>
                    </div>
                  </div>

                  {/* Rooms list */}
                  {filters.mode === "rooms" && (
                    <div className="mb-2 max-h-56 overflow-y-auto pr-1">
                      <div className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1">
                        Rooms
                      </div>
                      {rooms.map((r) => (
                        <label
                          key={r.id}
                          className="flex items-center gap-2 py-0.5 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filters.rooms.includes(r.id)}
                            onChange={() => toggleRoom(r.id)}
                          />
                          <span className="text-xs">
                            {r.room_number}
                          </span>
                        </label>
                      ))}
                      {rooms.length === 0 && (
                        <div className="text-xs text-neutral-500">
                          No rooms loaded.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Instructors list */}
                  {filters.mode === "instructors" && (
                    <div className="mb-2 max-h-56 overflow-y-auto pr-1">
                      <div className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1">
                        Instructors
                      </div>
                      {instructors.map((i) => (
                        <label
                          key={i.id}
                          className="flex items-center gap-2 py-0.5 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filters.instructors.includes(i.id)}
                            onChange={() => toggleInstructor(i.id)}
                          />
                          <span className="text-xs">{i.name}</span>
                        </label>
                      ))}
                      {instructors.length === 0 && (
                        <div className="text-xs text-neutral-500">
                          No instructors loaded.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="text-xs px-3 py-1 rounded-md border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="h-[calc(100vh-120px)]">
        {view === "week" && (
          <WeekView
            weekDays={weekDays}
            sections={visible}
            onSectionClick={handleSectionClick}
          />
        )}
        {view === "day" && (
          <DayView
            date={selectedDate}
            sections={visible}
            onSectionClick={handleSectionClick}
          />
        )}
        {view === "month" && (
          <MonthView
            anchor={weekStart}
            sections={visible}
            onDayClick={handleDaySelect}
          />
        )}
        {view === "year" && (
          <YearView
            year={weekStart.getFullYear()}
            sections={visible}
            onDayClick={handleDaySelect}
          />
        )}
      </div>

      {/* Create / Edit popover */}
      {creator && (
        <CreatePopover
          key={editingSection ? String(editingSection.id) : "new"}
          data={creator}
          section={editingSection ?? undefined}
          onClose={closePopover}
        />
      )}
    </div>
  );
});

export default WeekCalendar;

// re-exports
export { isToday, isThisWeek, nowLinePct };

/* ---------- Inline Create / Edit Popover (uses catalog) ---------- */

function CreatePopover({
  data,
  section,
  onClose,
}: {
  data: { date: Date; startMin: number; endMin: number; x: number; y: number };
  section?: CalendarSection;
  onClose: () => void;
}) {
  const {
    courses,
    instructors,
    rooms,
    sections,
    addSection,
    updateSection,
    removeSection,
  } = useStore();

  const initialCourseId = section?.course_id ?? courses[0]?.id ?? "";
  const initialInstructorId =
    section?.instructor_id ?? instructors[0]?.id ?? "";
  const initialRoomId = section?.room_id ?? rooms[0]?.id ?? "";

  const parsed = parseSeriesFromNotes(section?.notes);
  const initialSeriesId = parsed.seriesId;
  const initialUserNotes = parsed.userNotes;

  const initialCredits =
    section?.credits ??
    courses.find((c) => c.id === initialCourseId)?.credit_hours ??
    3;

  const [courseId, setCourseId] = useState<number | "">(initialCourseId);
  const [instructorId, setInstructorId] = useState<number | "">(
    initialInstructorId
  );
  const [roomId, setRoomId] = useState<number | "">(initialRoomId);
  const [credits, setCredits] = useState<number>(initialCredits);
  const [notes, setNotes] = useState<string>(initialUserNotes);
  const [repeatWeekly, setRepeatWeekly] = useState(false); // only for NEW

  // editable date + start/end times
  const [date, setDate] = useState<Date>(data.date);
  const [startMin, setStartMin] = useState<number>(data.startMin);
  const [endMin, setEndMin] = useState<number>(data.endMin);

  const POPOVER_W = 360;
  const POPOVER_H = 360;

  // how much higher than perfect center (positive = move UP)
  const VERTICAL_OFFSET = -65; // tweak this until it feels right

  // center in the viewport, then apply offset
  const centerTop =
    window.innerHeight > POPOVER_H
      ? window.innerHeight / 2 - POPOVER_H / 2
      : 12;
  const centerLeft =
    window.innerWidth > POPOVER_W
      ? window.innerWidth / 2 - POPOVER_W / 2
      : 12;

  const top = Math.max(12, centerTop + VERTICAL_OFFSET);
  const left = Math.max(12, centerLeft);

  const isEditing = !!section;

  const startLabel = toHHMM(startMin);
  const endLabel = toHHMM(endMin);

  // Helpers to sync <input type="time"> with minutes state
  const handleStartTimeChange = (value: string) => {
    const [h, m] = value.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    let mins = h * 60 + m;

    mins = Math.max(DAY_START, Math.min(DAY_END - 30, mins));
    setStartMin(mins);

    if (endMin <= mins) {
      const newEnd = Math.min(DAY_END, mins + 60);
      setEndMin(newEnd);
    }
  };

  const handleEndTimeChange = (value: string) => {
    const [h, m] = value.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    let mins = h * 60 + m;

    mins = Math.max(startMin + 30, mins);
    mins = Math.min(DAY_END, mins);
    setEndMin(mins);
  };

  const handleDateChange = (value: string) => {
    if (!value) return;
    const [y, m, d] = value.split("-").map(Number);
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return;
    setDate(new Date(y, m - 1, d));
  };

  const save = async () => {
    if (courseId === "" || instructorId === "" || roomId === "") return;

    const baseStart = new Date(date);
    baseStart.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0);
    const baseEnd = new Date(date);
    baseEnd.setHours(Math.floor(endMin / 60), endMin % 60, 0, 0);

    if (section && section.id != null) {
      const notesWithTag = buildNotes(notes, initialSeriesId);
      await updateSection(Number(section.id), {
        course_id: Number(courseId),
        instructor_id: Number(instructorId),
        room_id: Number(roomId),
        start: baseStart.toISOString(),
        end: baseEnd.toISOString(),
        credits,
        status: (section.status ?? "open") as SectionStatus,
        notes: notesWithTag || undefined,
      });
    } else {
      if (!repeatWeekly) {
        const notesWithTag = buildNotes(notes, null);
        await addSection({
          course_id: Number(courseId),
          instructor_id: Number(instructorId),
          room_id: Number(roomId),
          start: baseStart.toISOString(),
          end: baseEnd.toISOString(),
          credits,
          status: "open" as SectionStatus,
          notes: notesWithTag || undefined,
        });
      } else {
        const seriesId = makeSeriesId();
        for (let i = 0; i < REPEAT_WEEKS; i++) {
          const s = addDays(baseStart, i * 7);
          const e = addDays(baseEnd, i * 7);
          const notesWithTag = buildNotes(notes, seriesId);
          await addSection({
            course_id: Number(courseId),
            instructor_id: Number(instructorId),
            room_id: Number(roomId),
            start: s.toISOString(),
            end: e.toISOString(),
            credits,
            status: "open" as SectionStatus,
            notes: notesWithTag || undefined,
          });
        }
      }
    }

    onClose();
  };

  const handleDelete = async () => {
    if (!section || section.id == null) {
      onClose();
      return;
    }

    const { seriesId } = parseSeriesFromNotes(section.notes);

    if (seriesId) {
      const sameSeries = sections.filter((s: Section) => {
        const parsed = parseSeriesFromNotes(s.notes);
        return parsed.seriesId === seriesId;
      });

      for (const s of sameSeries) {
        if (s.id != null) {
          await removeSection(Number(s.id));
        }
      }
    } else {
      await removeSection(Number(section.id));
    }

    onClose();
  };

  return (
    <div
      id="create-popover"
      style={{
        position: "fixed",
        top: top,
        left: left,
        zIndex: 50,
        width: POPOVER_W,
      }}
      className="rounded-xl border bg-white shadow-xl p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">
          {date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}{" "}
          • {startLabel}–{endLabel}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="
            h-7 w-7 flex items-center justify-center
            rounded-md
            bg-transparent dark:bg-transparent
            text-black dark:text-black
            transition
          "
        >
          <span className="text-lg font-semibold">✕</span>
        </button>
      </div>

      {/* Date picker (mini calendar-style) */}
      <label className="block text-sm mb-2">
        Date
        <input
          type="date"
          className="mt-1 w-full border rounded px-2 py-1"
          value={toInputDate(date)}
          onChange={(e) => handleDateChange(e.target.value)}
        />
      </label>

      {/* Time pickers */}
      <div className="flex gap-2 mb-2">
        <label className="flex-1 text-sm">
          Start time
          <input
            type="time"
            className="mt-1 w-full border rounded px-2 py-1"
            value={toHHMM(startMin)}
            min={toHHMM(DAY_START)}
            max={toHHMM(DAY_END)}
            step={900}
            onChange={(e) => handleStartTimeChange(e.target.value)}
          />
        </label>
        <label className="flex-1 text-sm">
          End time
          <input
            type="time"
            className="mt-1 w-full border rounded px-2 py-1"
            value={toHHMM(endMin)}
            min={toHHMM(DAY_START)}
            max={toHHMM(DAY_END)}
            step={900}
            onChange={(e) => handleEndTimeChange(e.target.value)}
          />
        </label>
      </div>

      <label className="block text-sm mb-2">
        Course
        <select
          value={courseId}
          onChange={(e) => {
            const id = e.target.value === "" ? "" : Number(e.target.value);
            setCourseId(id);
            const match = courses.find((c) => c.id === id);
            if (match && !isEditing) setCredits(match.credit_hours);
          }}
          className="mt-1 w-full border rounded px-2 py-1"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-2 mb-2">
        <label className="flex-1 text-sm">
          Instructor
          <select
            value={instructorId}
            onChange={(e) =>
              setInstructorId(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
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
            onChange={(e) =>
              setRoomId(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="mt-1 w-full border rounded px-2 py-1"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_number}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-2 mb-2">
        <label className="flex-1 text-sm">
          Credits
          <input
            type="number"
            min={0}
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value) || 0)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>
      </div>

      {/* Repeat weekly only when creating a new class */}
      {!isEditing && (
        <label className="flex items-center gap-2 text-sm mb-3">
          <input
            type="checkbox"
            checked={repeatWeekly}
            onChange={(e) => setRepeatWeekly(e.target.checked)}
          />
          Repeat this class every week
        </label>
      )}

      <label className="block text-sm mb-3">
        Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full border rounded px-2 py-1 resize-none"
          placeholder="Optional notes (e.g. CHEM 1010-1 – Aggarwal – PH211 – MW 2:00–3:15)"
        />
      </label>

      <div className="flex justify-end gap-2">
        <button
          onClick={isEditing ? handleDelete : onClose}
          className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700"
        >
          Delete
        </button>
        <button
          onClick={save}
          disabled={courseId === "" || instructorId === "" || roomId === ""}
          className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}
