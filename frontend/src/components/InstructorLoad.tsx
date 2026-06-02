// src/components/InstructorLoad.tsx
import { useMemo } from "react";
import { useStore } from "../store";

export default function InstructorLoad() {
  const { sections, instructors, courses } = useStore();

  const rows = useMemo(() => {
    return instructors.map((inst) => {
      // sections assigned to this instructor (new field: instructor_id)
      const mySecs = sections.filter((s) => s.instructor_id === inst.id);

      const credits = mySecs.reduce((sum, s) => {
        // prefer explicit section credits if present
        if (s.credits != null) {
          return sum + s.credits;
        }
        // otherwise fall back to course.credit_hours
        const course = courses.find((c) => c.id === s.course_id);
        return sum + (course?.credit_hours ?? 0);
      }, 0);

      // backend instructor has max_load (or default 15)
      const target = (inst as any).max_load ?? 15;

      return {
        id: inst.id,
        name: inst.name,
        credits,
        target,
      };
    });
  }, [sections, instructors, courses]);

  if (!rows.length) return null;

  return (
    <div className="p-3 border-t bg-white">
      <div className="font-semibold mb-2">Instructor Workload</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {rows.map((r) => (
          <div key={r.id} className="border rounded p-2">
            <div className="font-medium">{r.name}</div>
            <div
              className={`text-sm ${
                r.credits < r.target ? "text-amber-700" : "text-emerald-700"
              }`}
            >
              {r.credits} / {r.target} credit hours
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
