import { instructors, rooms } from "../data";
import { useStore } from "../store";

export default function Filters() {
  const { filters, setMode, setRooms, setInstructors } = useStore();

  const toggle = (list: number[], set: (ids: number[]) => void, id: number) => {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center justify-between p-4 border-b">
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded ${filters.mode === "rooms" ? "bg-black/80 text-white" : "bg-black/10"}`}
          onClick={() => setMode("rooms")}
        >
          Rooms
        </button>
        <button
          className={`px-3 py-1 rounded ${filters.mode === "instructors" ? "bg-black/80 text-white" : "bg-black/10"}`}
          onClick={() => setMode("instructors")}
        >
          Instructors
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {filters.mode === "rooms" ? (
          <div className="flex gap-2 items-center">
            <span className="text-sm opacity-80">Show rooms:</span>
            {rooms.map((r) => (
              <button key={r.id}
                className={`px-2 py-1 rounded border ${filters.rooms.includes(r.id) ? "bg-black text-white" : ""}`}
                onClick={() => toggle(filters.rooms, setRooms, r.id)}
              >
                {r.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <span className="text-sm opacity-80">Show instructors:</span>
            {instructors.map((i) => (
              <button key={i.id}
                className={`px-2 py-1 rounded border ${filters.instructors.includes(i.id) ? "bg-black text-white" : ""}`}
                onClick={() => toggle(filters.instructors, setInstructors, i.id)}
              >
                {i.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
