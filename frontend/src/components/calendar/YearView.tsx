// src/components/calendar/YearView.tsx
import { addDays, getWeekStart, isToday } from "../../utils/time";

export default function YearView({ year }: { year: number }) {
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {months.map((m) => (
        <div key={m.getMonth()} className="border rounded-lg bg-white p-3">
          <div className="text-sm font-semibold mb-2">
            {new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(m)}
          </div>
          <MonthMini anchor={m} />
        </div>
      ))}
    </div>
  );
}

function MonthMini({ anchor }: { anchor: Date }) {
  // Sunday start
  const first = getWeekStart(new Date(anchor.getFullYear(), anchor.getMonth(), 1), 0);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(first, i));

  return (
    <div className="grid grid-cols-7 gap-[2px] text-[10px]">
      {cells.map((d) => {
        const inMonth = d.getMonth() === anchor.getMonth();
        const today = isToday(d);
        return (
          <div
            key={d.toDateString()}
            className={[
              "h-6 rounded border text-center leading-6",
              today ? "border-blue-400 bg-blue-50/60" : "border-neutral-200",
              inMonth ? "bg-white" : "bg-neutral-50 text-neutral-400",
            ].join(" ")}
          >
            {d.getDate()}
          </div>
        );
      })}
    </div>
  );
}
