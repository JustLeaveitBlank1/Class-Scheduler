// src/components/calendar/MonthView.tsx
import { useMemo } from "react";
import { addDays, getWeekStart, isToday } from "../../utils/time";
import type { CalendarSection } from "./DayColumn";

type Props = {
  anchor: Date;
  sections?: CalendarSection[];
  onDayClick?: (date: Date) => void;
};

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function MonthView({ anchor, sections, onDayClick }: Props) {
  const month = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const firstDay = getWeekStart(month, 0); // Sunday start
  const cells = useMemo(
    () => Array.from({ length: 42 }, (_, i) => addDays(firstDay, i)),
    [firstDay]
  );

  // Precompute days that have at least one section
  const daysWithEvents = useMemo(() => {
    const set = new Set<string>();
    if (sections) {
      for (const sec of sections) {
        if (!sec.start) continue;
        const d = new Date(sec.start);
        const key = d.toDateString();
        set.add(key);
      }
    }
    return set;
  }, [sections]);

  const ordered = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="border rounded-lg bg-white p-3">
      <div className="text-lg font-semibold mb-2">
        {new Intl.DateTimeFormat(undefined, {
          month: "long",
          year: "numeric",
        }).format(month)}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-neutral-500 mb-1">
        {ordered.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d) => {
          const inMonth = d.getMonth() === month.getMonth();
          const today = isToday(d);
          const hasEvent = daysWithEvents.has(d.toDateString());

          const classes = [
            "h-24 rounded border p-1 text-xs text-left cursor-pointer transition-colors",
            inMonth ? "bg-white" : "bg-neutral-50 text-neutral-400",
            today ? "border-blue-400" : "border-neutral-200",
            hasEvent ? "bg-blue-50/70 hover:bg-blue-100" : "hover:bg-neutral-50",
          ].join(" ");

          return (
            <div
              key={d.toDateString()}
              className={classes}
              onClick={() => onDayClick?.(d)} // ✅ ANY day is clickable
            >
              <div className="font-semibold flex items-center justify-between">
                <span>{d.getDate()}</span>
                {hasEvent && (
                  <span className="inline-block rounded-full bg-blue-500 text-[9px] text-white px-1.5 py-[1px] ml-1">
                    •
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
