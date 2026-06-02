// src/components/calendar/YearView.tsx
import { useMemo } from "react";
import { addDays, getWeekStart, isToday } from "../../utils/time";
import type { CalendarSection } from "./DayColumn";

type Props = {
  year: number;
  sections?: CalendarSection[];
  onDayClick?: (date: Date) => void;
};

export default function YearView({ year, sections, onDayClick }: Props) {
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {months.map((m) => (
        <div key={m.getMonth()} className="border rounded-lg bg-white p-3">
          <div className="text-sm font-semibold mb-2">
            {new Intl.DateTimeFormat(undefined, {
              month: "long",
              year: "numeric",
            }).format(m)}
          </div>
          <MonthMini
            anchor={m}
            sections={sections}
            onDayClick={onDayClick}
          />
        </div>
      ))}
    </div>
  );
}

type MiniProps = {
  anchor: Date;
  sections?: CalendarSection[];
  onDayClick?: (date: Date) => void;
};

function MonthMini({ anchor, sections, onDayClick }: MiniProps) {
  const first = getWeekStart(
    new Date(anchor.getFullYear(), anchor.getMonth(), 1),
    0
  );
  const cells = useMemo(
    () => Array.from({ length: 42 }, (_, i) => addDays(first, i)),
    [first]
  );

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

  return (
    <div className="grid grid-cols-7 gap-[2px] text-[10px]">
      {cells.map((d) => {
        const inMonth = d.getMonth() === anchor.getMonth();
        const today = isToday(d);
        const hasEvent = daysWithEvents.has(d.toDateString());

        const classes = [
          "h-6 rounded border text-center leading-6 cursor-pointer transition-colors",
          inMonth ? "bg-white" : "bg-neutral-50 text-neutral-400",
          today ? "border-blue-400" : "border-neutral-200",
          hasEvent
            ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
            : "hover:bg-neutral-100",
        ].join(" ");

        return (
          <div
            key={d.toDateString()}
            className={classes}
            onClick={() => onDayClick?.(d)} // ✅ ANY day is clickable
          >
            {d.getDate()}
          </div>
        );
      })}
    </div>
  );
}
