import { meetingSlots } from "../../data";
import { DAY_END, DAY_START, timeToPct } from "../../utils/time";
import SectionCard from "./SectionCard";

const dayKeys = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export default function DayColumn({
  dayKey,
  date,
  sections,
  onEmptyClick,
}: {
  dayKey: typeof dayKeys[number];
  date: Date;
  sections: Array<{
    id: string;
    courseId: string;
    meetingSlotId: string;
    instructorId: number;
    roomId: number;
    seats: number;
  }>;
  onEmptyClick?: (info: {
    date: Date;
    pct: number;
    clientX: number;
    clientY: number;
  }) => void;
}) {
  const items = sections.filter((s) => {
    const slot = meetingSlots.find((ms) => ms.id === s.meetingSlotId);
    return slot?.pattern.includes(dayKey as any);
  });

  // group same-time items so they render side-by-side
  const groups = new Map<string, typeof items>();
  for (const s of items) {
    const arr = groups.get(s.meetingSlotId) ?? [];
    arr.push(s);
    groups.set(s.meetingSlotId, arr);
  }

  const handleEmptyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-event-block]")) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const pct = Math.min(1, Math.max(0, y / rect.height));
    onEmptyClick?.({ date, pct, clientX: e.clientX, clientY: e.clientY });
  };

  return (
    <div
      data-day-col
      data-date={date.toISOString()}
      className="relative border-l bg-neutral-50"
      style={{ height: "100%" }}
      onClick={handleEmptyClick}
    >
      {/* hour grid */}
      {Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 border-t border-neutral-200"
          style={{ top: `${(i * 60) / (DAY_END - DAY_START) * 100}%` }}
        />
      ))}

      {/* event blocks */}
      {[...groups.entries()].flatMap(([slotId, arr]) => {
        const slot = meetingSlots.find((ms) => ms.id === slotId)!;
        const startMin =
          parseInt(slot.start.slice(0, 2)) * 60 + parseInt(slot.start.slice(3));
        const endMin =
          parseInt(slot.end.slice(0, 2)) * 60 + parseInt(slot.end.slice(3));
        const top = timeToPct(startMin);
        const height = timeToPct(endMin) - top;
        const count = arr.length;

        return arr.map((s, idx) => {
          const gap = 2; // %
          const width = (100 - (count - 1) * gap) / count;
          const left = idx * (width + gap);
          return (
            <div
              key={s.id}
              data-event-block
              className="absolute rounded-lg shadow-sm border border-neutral-200 bg-white/95 px-2 py-1 text-sm hover:shadow-md transition-shadow"
              style={{
                top: `${top}%`,
                height: `${height}%`,
                left: `${left}%`,
                width: `${width}%`,
              }}
              title={slot.label}
            >
              <SectionCard id={s.id} />
            </div>
          );
        });
      })}
    </div>
  );
}
