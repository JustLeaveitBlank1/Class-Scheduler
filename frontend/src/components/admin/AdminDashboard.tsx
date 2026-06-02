// src/components/admin/AdminDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../../store";

export default function AdminDashboard() {
  const {
    courses,
    instructors,
    rooms,
    sections,
    loadCatalog,
    loadSections,
    loading,
    error,
  } = useStore();

  // ---- which panels are visible ----
  const [showInstructors, setShowInstructors] = useState(true);
  const [showCourses, setShowCourses] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
  const [showSections, setShowSections] = useState(false);

  // Last updated label (updates whenever any admin data changes)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    (async () => {
      await loadCatalog();
      await loadSections();
    })();
  }, [loadCatalog, loadSections]);

  // whenever core data changes, bump "last updated"
  useEffect(() => {
    setLastUpdated(new Date());
  }, [courses, instructors, rooms, sections]);

  // ---- compute assigned credits per instructor from sections ----
     // ---- compute assigned credits per instructor from sections ----
  const creditsByInstructor = useMemo(() => {
    const map: Record<number, number> = {};
    const seen = new Set<string>();

    for (const s of sections) {
      if (!s.instructor_id) continue;

      const credits = s.credits ?? 0;

      // Treat all meetings for the same instructor + course as ONE class
      const key = [s.instructor_id, s.course_id].join("|");

      if (seen.has(key)) continue;     // already counted this class
      seen.add(key);

      map[s.instructor_id] = (map[s.instructor_id] ?? 0) + credits;
    }

    return map;
  }, [sections]);

  return (
    <div className="p-6 space-y-6">
      {/* Top heading */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Overview</h1>
          <p className="text-sm text-neutral-500">
            Manage instructors, courses, rooms, and scheduled sections.
          </p>
          {lastUpdated && (
            <p className="mt-1 text-xs text-neutral-500">
              Last updated {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>

        {/* Toggle pills */}
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <SectionToggle
            label="Instructors"
            count={instructors.length}
            active={showInstructors}
            onClick={() => setShowInstructors((v) => !v)}
          />
          <SectionToggle
            label="Courses"
            count={courses.length}
            active={showCourses}
            onClick={() => setShowCourses((v) => !v)}
          />
          <SectionToggle
            label="Rooms"
            count={rooms.length}
            active={showRooms}
            onClick={() => setShowRooms((v) => !v)}
          />
          <SectionToggle
            label="Sections"
            count={sections.length}
            active={showSections}
            onClick={() => setShowSections((v) => !v)}
          />
        </div>
      </header>

      {/* Status */}
      {loading && (
        <div className="text-sm text-neutral-500">Loading data…</div>
      )}
      {error && (
        <div className="text-sm text-red-600">Error loading data: {error}</div>
      )}

      {/* Instructors (default: visible) */}
      {showInstructors && (
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-neutral-200 px-4 py-3 bg-neutral-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
              Instructors
            </h2>
            <span className="text-xs text-neutral-500">
              {instructors.length} total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Department
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Target Load
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Assigned Credits
                  </th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((i) => {
                  const target = i.target_load ?? 0;
                  const assigned = creditsByInstructor[i.id] ?? 0;

                  // decide badge color
                  let badgeClass =
                    "bg-neutral-100 text-neutral-700 border border-neutral-200";
                  if (target > 0) {
                    if (assigned === target) {
                      // exactly at target -> green
                      badgeClass =
                        "bg-emerald-100 text-emerald-800 border border-emerald-200";
                    } else if (assigned > target) {
                      // overloaded -> red
                      badgeClass =
                        "bg-red-100 text-red-800 border border-red-200";
                    } else if (assigned > 0 && assigned < target) {
                      // still needs more hours -> yellow
                      badgeClass =
                        "bg-amber-100 text-amber-800 border border-amber-200";
                    }
                  }

                  const badgeLabel =
                    target > 0 ? `${assigned} / ${target}` : `${assigned}`;

                  return (
                    <tr
                      key={i.id}
                      className="border-t border-neutral-100 hover:bg-neutral-50"
                    >
                      <td className="px-4 py-2">{i.name}</td>
                      <td className="px-4 py-2 text-neutral-600">
                        {i.email}
                      </td>
                      <td className="px-4 py-2">{i.department ?? "—"}</td>
                      <td className="px-4 py-2">
                        {target > 0 ? target : "—"}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={[
                            "inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-medium",
                            badgeClass,
                          ].join(" ")}
                        >
                          {badgeLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {instructors.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-4 text-center text-neutral-500"
                    >
                      No instructors yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Courses */}
      {showCourses && (
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-neutral-200 px-4 py-3 bg-neutral-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
              Courses
            </h2>
            <span className="text-xs text-neutral-500">
              {courses.length} total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Code
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Credit Hours
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Contact Hours
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-neutral-100 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-2 font-medium">{c.code}</td>
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2">{c.credit_hours}</td>
                    <td className="px-4 py-2">{c.contact_hours}</td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-4 text-center text-neutral-500"
                    >
                      No courses yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Rooms */}
      {showRooms && (
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-neutral-200 px-4 py-3 bg-neutral-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
              Rooms
            </h2>
            <span className="text-xs text-neutral-500">
              {rooms.length} total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Room
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Capacity
                  </th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-neutral-100 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-2 font-medium">
                      {r.room_number}
                    </td>
                    <td className="px-4 py-2">{r.capacity}</td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-4 text-center text-neutral-500"
                    >
                      No rooms yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Sections / scheduled classes */}
      {showSections && (
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-neutral-200 px-4 py-3 bg-neutral-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
              Scheduled Sections
            </h2>
            <span className="text-xs text-neutral-500">
              {sections.length} total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Course
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Instructor
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Room
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Start
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    End
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">
                    Credits
                  </th>
                </tr>
              </thead>
              <tbody>
                {sections.map((s) => {
                  const course = courses.find((c) => c.id === s.course_id);
                  const instructor = instructors.find(
                    (i) => i.id === s.instructor_id
                  );
                  const room = rooms.find((r) => r.id === s.room_id);

                  return (
                    <tr
                      key={s.id}
                      className="border-t border-neutral-100 hover:bg-neutral-50"
                    >
                      <td className="px-4 py-2">
                        {course ? `${course.code} — ${course.name}` : "—"}
                      </td>
                      <td className="px-4 py-2">
                        {instructor ? instructor.name : "—"}
                      </td>
                      <td className="px-4 py-2">
                        {room ? room.room_number : "—"}
                      </td>
                      <td className="px-4 py-2">
                        {s.start ? new Date(s.start).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-2">
                        {s.end ? new Date(s.end).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-2">{s.credits ?? "—"}</td>
                    </tr>
                  );
                })}
                {sections.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-4 text-center text-neutral-500"
                    >
                      No sections scheduled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

/* Small pill-style toggle button */
type SectionToggleProps = {
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
};

function SectionToggle({ label, active, count, onClick }: SectionToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-neutral-900 text-neutral-100 border-neutral-700 hover:bg-neutral-800",
      ].join(" ")}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={[
            "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px]",
            active ? "bg-blue-500/80" : "bg-neutral-800",
          ].join(" ")}
        >
          {count}
        </span>
      )}
    </button>
  );
}
