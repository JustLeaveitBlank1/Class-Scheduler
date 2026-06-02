// src/components/calendar/DayColumn.tsx
import { useMemo } from "react";
import { DAY_START, DAY_END } from "../../utils/time";
import { useStore } from "../../store";

export type CalendarSection = {
  id: string | number;

  // legacy
  courseId?: string;
  instructorId?: number;
  roomId?: number;
  seats?: number;
  meetingSlotId?: string;

  // backend fields
  course_id?: number;
  instructor_id?: number;
  room_id?: number;
  credits?: number;
  start?: string;
  end?: string;
  status?: string;
  section_number?: string | null;
  notes?: string | null;
  series_id?: string | null;
};

type Props = {
  dayKey: "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
  date: Date;
  sections: CalendarSection[];
  onEmptyClick?: (info: {
    date: Date;
    pct: number;
    clientX: number;
    clientY: number;
  }) => void;
  onSectionClick?: (sec: CalendarSection) => void;
};

const TOTAL_MINUTES = DAY_END - DAY_START;

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function minutesSinceMidnight(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

function cleanNotes(raw?: string | null): string {
  if (!raw) return "";
  return raw.replace(/\[series:[^\]]+\]\s*/i, "").trim();
}

function getIntervalForSection(
  sec: CalendarSection,
  date: Date,
  _dayKey: Props["dayKey"]
): { startMin: number; endMin: number } | null {
  if (!(sec.start && sec.end)) return null;

  const startDate = new Date(sec.start);
  const endDate = new Date(sec.end);

  if (!sameDay(startDate, date)) return null;

  let startMin = minutesSinceMidnight(startDate);
  let endMin = minutesSinceMidnight(endDate);

  startMin = Math.max(DAY_START, Math.min(DAY_END, startMin));
  endMin = Math.max(DAY_START, Math.min(DAY_END, endMin));
  if (endMin <= startMin) endMin = startMin + 30;

  return { startMin, endMin };
}

function toHHMM(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

const INSTRUCTOR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-purple-500",
  "bg-teal-500",
];

type BaseEvent = {
  sec: CalendarSection;
  topPct: number;
  timeLabel: string;
  title: string;
  colorClass: string;
  tooltip: string;
};

type EventGroup = {
  bucketKey: number;
  topPct: number;
  events: BaseEvent[];
};

export default function DayColumn({
  dayKey,
  date,
  sections,
  onSectionClick,
}: Props) {
  const { courses, instructors } = useStore();

  const groups: EventGroup[] = useMemo(() => {
    const base: BaseEvent[] = sections
      .map((sec) => {
        const interval = getIntervalForSection(sec, date, dayKey);
        if (!interval) return null;

        const { startMin, endMin } = interval;
        const topPct = ((startMin - DAY_START) / TOTAL_MINUTES) * 100;
        const timeLabel = `${toHHMM(startMin)}–${toHHMM(endMin)}`;

        let title = "";

        if (sec.course_id != null) {
          const course = courses.find((c) => c.id === sec.course_id);
          if (course) title = `${course.code} — ${course.name}`;
        }
        if (!title && typeof sec.courseId === "string") {
          title = sec.courseId;
        }
        if (!title && sec.notes) {
          title = cleanNotes(sec.notes);
        }

        let colorClass = "bg-blue-500";
        if (sec.instructor_id != null && instructors.length > 0) {
          const idx = instructors.findIndex((i) => i.id === sec.instructor_id);
          const safeIdx = idx >= 0 ? idx : 0;
          colorClass =
            INSTRUCTOR_COLORS[safeIdx % INSTRUCTOR_COLORS.length] ??
            "bg-blue-500";
        }

        const tooltip = title
          ? `${timeLabel} • ${title}`
          : `${timeLabel} • Class`;

        return {
          sec,
          topPct,
          timeLabel,
          title,
          colorClass,
          tooltip,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const bucketMap = new Map<number, EventGroup>();

    for (const ev of base) {
      // bucket by position so “same time” events stay together
      const key = Math.round(ev.topPct * 10);
      if (!bucketMap.has(key)) {
        bucketMap.set(key, { bucketKey: key, topPct: ev.topPct, events: [] });
      }
      bucketMap.get(key)!.events.push(ev);
    }

    return Array.from(bucketMap.values()).sort(
      (a, b) => a.topPct - b.topPct
    );
  }, [sections, date, dayKey, courses, instructors]);

  return (
    <div
      className="relative border-l border-neutral-200 bg-neutral-50/40"
      data-day-col
      data-date={date.toISOString()}
    >
      <div className="relative h-full">
        {groups.map((group) => {
          const { events, topPct } = group;
          if (events.length === 0) return null;

          return (
            <div
              key={group.bucketKey}
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: `${topPct}%` }}
            >
              {events.length === 1 ? (
                // single event: one small dot
                <button
                  type="button"
                  title={events[0].tooltip}
                  aria-label={events[0].tooltip}
                  className={`h-2.5 w-2.5 rounded-full ${events[0].colorClass} border border-white shadow cursor-pointer`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSectionClick?.(events[0].sec);
                  }}
                />
              ) : (
                // multiple events: row of tiny dots + optional count
                <div className="inline-flex items-center gap-1">
                  {events.map((ev) => (
                    <button
                      key={String(ev.sec.id)}
                      type="button"
                      title={ev.tooltip}
                      aria-label={ev.tooltip}
                      className={`h-2 w-2 rounded-full ${ev.colorClass} border border-white shadow cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSectionClick?.(ev.sec);
                      }}
                    />
                  ))}
                  <span className="text-[10px] leading-none text-neutral-500">
                    {events.length}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
