// src/components/calendar/DayView.tsx
import TimeGutter from "./TimeGutter";
import DayColumn from "./DayColumn";
import type { CalendarSection } from "./DayColumn";
import { isToday } from "../../utils/time";

const dayKeys = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type Props = {
  date: Date;
  sections: CalendarSection[];
  onSectionClick?: (sec: CalendarSection) => void;
};

export default function DayView({ date, sections, onSectionClick }: Props) {
  // derive dayKey from date
  const weekdayShort = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  }).format(date);
  const map: Record<string, (typeof dayKeys)[number]> = {
    Sun: "Sun",
    Mon: "Mon",
    Tue: "Tue",
    Wed: "Wed",
    Thu: "Thu",
    Fri: "Fri",
    Sat: "Sat",
  };
  const key = map[weekdayShort] ?? "Sun";

  const headerLabel = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="border rounded-lg bg-white overflow-hidden h-full">
      {/* Sticky header */}
      <div
        className="grid sticky top-0 bg-white z-10 border-b justify-items-center"
        style={{ gridTemplateColumns: `120px 1fr` }}
      >
        <div className="px-3 py-2 justify-self-start text-sm font-medium text-neutral-500">
          Time
        </div>
        <div
          className={[
            "px-2 py-2 text-center font-semibold rounded-md m-1",
            isToday(date)
              ? "bg-blue-100 border border-blue-300 text-blue-700 shadow-sm"
              : "text-neutral-800",
          ].join(" ")}
        >
          {headerLabel}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="h-full overflow-auto">
        <div
          className="grid h-full pb-6"
          style={{ gridTemplateColumns: `120px 1fr` }}
        >
          <TimeGutter />
          <DayColumn
            dayKey={key}
            date={date}
            sections={sections}
            onSectionClick={onSectionClick}
          />
        </div>
      </div>
    </div>
  );
}
