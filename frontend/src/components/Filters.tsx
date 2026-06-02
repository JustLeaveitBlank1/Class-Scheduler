// src/components/Filters.tsx
import { useStore } from "../store";

export default function Filters() {
  const {
    filters,
    setMode,
    setRooms,
    setInstructors,
    rooms: roomCatalog,
    instructors: instructorCatalog,
    loading,
    roomsLoaded,
    instructorsLoaded,
  } = useStore();

  const toggle = (list: number[], set: (ids: number[]) => void, id: number) => {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center justify-between p-4 border-b">
      {/* mode switch */}
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded ${
            filters.mode === "rooms"
              ? "bg-black/80 text-white"
              : "bg-black/10"
          }`}
          onClick={() => setMode("rooms")}
        >
          Rooms
        </button>
        <button
          className={`px-3 py-1 rounded ${
            filters.mode === "instructors"
              ? "bg-black/80 text-white"
              : "bg-black/10"
          }`}
          onClick={() => setMode("instructors")}
        >
          Instructors
        </button>
      </div>

      {/* chips */}
      <div className="flex flex-wrap gap-3">
        {filters.mode === "rooms" ? (
          <div className="flex gap-2 items-center">
            <span className="text-sm opacity-80">
              {loading && !roomsLoaded ? "Loading rooms…" : "Show rooms:"}
            </span>
            {roomCatalog.map((r) => (
              <button
                key={r.id}
                className={`px-2 py-1 rounded border ${
                  filters.rooms.includes(r.id) ? "bg-black text-white" : ""
                }`}
                onClick={() => toggle(filters.rooms, setRooms, r.id)}
              >
                {r.room_number}
              </button>
            ))}
            {!loading && roomsLoaded && roomCatalog.length === 0 && (
              <span className="text-sm opacity-60">No rooms found.</span>
            )}
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <span className="text-sm opacity-80">
              {loading && !instructorsLoaded
                ? "Loading instructors…"
                : "Show instructors:"}
            </span>
            {instructorCatalog.map((i) => (
              <button
                key={i.id}
                className={`px-2 py-1 rounded border ${
                  filters.instructors.includes(i.id)
                    ? "bg-black text-white"
                    : ""
                }`}
                onClick={() => toggle(filters.instructors, setInstructors, i.id)}
              >
                {i.name}
              </button>
            ))}
            {!loading && instructorsLoaded && instructorCatalog.length === 0 && (
              <span className="text-sm opacity-60">No instructors found.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
