// src/components/calendar/WeekView.tsx
import { isToday } from "../../utils/time";
import TimeGutter from "./TimeGutter";
import DayColumn from "./DayColumn";
import type { CalendarSection } from "./DayColumn";

type WeekDay = { key: string; label: string; date: Date };

type Props = {
  weekDays: WeekDay[];
  sections: CalendarSection[];
  // we no longer support click-to-create in the grid,
  // only clicking existing sections (dots) to edit
  onSectionClick?: (sec: CalendarSection) => void;
};

export default function WeekView({
  weekDays,
  sections,
  onSectionClick,
}: Props) {
  return (
    <div className="border rounded-lg bg-white overflow-hidden h-full">
      <div className="h-full overflow-auto">
        {/* Header row */}
        <div
          className="grid sticky top-0 bg-white z-10 border-b justify-items-center"
          style={{ gridTemplateColumns: `120px repeat(${weekDays.length}, 1fr)` }}
        >
          <div className="px-3 py-2 justify-self-start text-sm font-medium text-neutral-500">
            Time
          </div>
          {weekDays.map((d) => {
            const today = isToday(d.date);
            return (
              <div
                key={d.key}
                aria-current={today ? "date" : undefined}
                className={[
                  "px-2 py-2 text-center font-semibold rounded-md m-1",
                  today
                    ? "bg-blue-100 border border-blue-300 text-blue-700 shadow-sm"
                    : "text-neutral-800",
                ].join(" ")}
              >
                {d.label}
              </div>
            );
          })}
        </div>

        {/* Body grid */}
        <div
          className="grid h-full pb-6"
          style={{ gridTemplateColumns: `120px repeat(${weekDays.length}, 1fr)` }}
        >
          <TimeGutter />
          {weekDays.map((d) => (
            <DayColumn
              key={d.key}
              dayKey={d.key as any}
              date={d.date}
              sections={sections}
              onSectionClick={onSectionClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
