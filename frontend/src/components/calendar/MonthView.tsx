import { addDays, getWeekStart, isToday } from "../../utils/time";

export default function MonthView({ anchor }: { anchor: Date }) {
  const month = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const firstDay = getWeekStart(month, 0); // Sunday start
  const cells = Array.from({ length: 42 }, (_, i) => addDays(firstDay, i)); // 6 weeks

  // Sun..Sat labels (fixed order)
  const ordered = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="border rounded-lg bg-white p-3">
      <div className="text-lg font-semibold mb-2">
        {new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(month)}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-neutral-500 mb-1">
        {ordered.map((d) => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d) => {
          const inMonth = d.getMonth() === month.getMonth();
          const today = isToday(d);
          return (
            <div
              key={d.toDateString()}
              className={[
                "h-24 rounded border p-1 text-xs text-left",
                today ? "border-blue-400 bg-blue-50/60" : "border-neutral-200",
                inMonth ? "bg-white" : "bg-neutral-50 text-neutral-400",
              ].join(" ")}
            >
              <div className="font-semibold">{d.getDate()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
