import { DAY_END, DAY_START, formatHourLabel } from "../../utils/time";

export default function TimeGutter() {
  const hourTicks = Array.from({
    length: (DAY_END - DAY_START) / 60 + 1,
  }).map((_, i) => DAY_START + i * 60);

  return (
    <div className="relative border-r bg-white h-full">
      {hourTicks.map((m, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 border-t border-neutral-200"
          style={{ top: `${(i * 60) / (DAY_END - DAY_START) * 100}%` }}
        >
          <div className="text-[10px] text-neutral-400 pl-3 translate-y-1">
            {formatHourLabel(m)}
          </div>
        </div>
      ))}
    </div>
  );
}
