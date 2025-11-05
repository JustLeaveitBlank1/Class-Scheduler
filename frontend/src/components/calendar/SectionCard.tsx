import { useStore } from "../../store";
import { meetingSlots, rooms, instructors } from "../../data";

export default function SectionCard({ id }: { id: string }) {
  const { sections } = useStore();
  const s = sections.find((x) => x.id === id)!;
  const slot = meetingSlots.find((ms) => ms.id === s.meetingSlotId)!;
  const hue = hueFor(s.courseId);
  const roomName = rooms.find((r) => r.id === s.roomId)?.name ?? `Room ${s.roomId}`;
  const instName =
    instructors.find((i) => i.id === s.instructorId)?.name ?? `Inst ${s.instructorId}`;

  return (
    <div className="leading-tight">
      <div
        className="h-1.5 w-full rounded mb-1"
        style={{ backgroundColor: `hsl(${hue} 70% 55%)` }}
      />
      <div className="font-semibold">{s.courseId}</div>
      <div className="text-xs text-neutral-600">{slot.label}</div>
      <div className="text-xs text-neutral-600">
        {instName} • {roomName} • {s.seats} seats
      </div>
    </div>
  );
}
function hueFor(id: string) {
  let h = 0;
  for (const ch of id) h = (h + ch.charCodeAt(0)) % 360;
  return h;
}
