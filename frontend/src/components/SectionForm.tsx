import { useMemo, useState } from "react";
import { courses, instructors, rooms, meetingSlots } from "../data";
import { useStore } from "../store";

export default function SectionForm() {
  const add = useStore(s => s.addSection);
  const [courseId, setCourseId] = useState(courses[0].id);
  const course = useMemo(() => courses.find(c => c.id===courseId)!, [courseId]);

  // filter meeting slots by this course's credit hours
  const slotOptions = meetingSlots.filter(ms => ms.creditHours === course.creditHours);

  const [meetingSlotId, setSlot] = useState(slotOptions[0].id);
  const [instructorId, setInst] = useState(instructors[0].id);
  const [roomId, setRoom] = useState(rooms[0].id);
  const [seats, setSeats] = useState(24);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    try {
      const room = rooms.find(r => r.id === roomId)!;
      if (seats > room.capacity) throw new Error(`Seats exceed room capacity (${room.capacity}).`);
      add({ courseId, meetingSlotId, instructorId, roomId, seats });
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="p-4 border-b bg-white sticky top-0 z-10">
      <div className="flex flex-wrap gap-3 items-end">
        <L label="Course">
          <select className="border rounded px-2 py-1"
            value={courseId} onChange={(e)=>setCourseId(e.target.value)}>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title} ({c.creditHours} cr)</option>)}
          </select>
        </L>

        <L label="Meeting time">
          <select className="border rounded px-2 py-1"
            value={meetingSlotId} onChange={(e)=>setSlot(e.target.value)}>
            {slotOptions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </L>

        <L label="Instructor">
          <select className="border rounded px-2 py-1"
            value={instructorId} onChange={(e)=>setInst(Number(e.target.value))}>
            {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </L>

        <L label="Room">
          <select className="border rounded px-2 py-1"
            value={roomId} onChange={(e)=>setRoom(Number(e.target.value))}>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (cap {r.capacity})</option>)}
          </select>
        </L>

        <L label="Seats">
          <input type="number" min={0} className="border rounded px-2 py-1 w-24"
            value={seats} onChange={(e)=>setSeats(Number(e.target.value))}/>
        </L>

        <button onClick={submit} className="px-3 py-2 rounded bg-black text-white">Add Section</button>

        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>
    </div>
  );
}

function L({label, children}:{label:string; children:React.ReactNode}) {
  return (
    <label className="text-sm flex flex-col gap-1">
      <span className="opacity-70">{label}</span>
      {children}
    </label>
  );
}
