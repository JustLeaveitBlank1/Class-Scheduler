import { useMemo } from "react";
import { instructors, courses } from "../data";  // removed meetingSlots
import { useStore } from "../store";


export default function InstructorLoad() {
  const { sections } = useStore();

  const rows = useMemo(() => {
    return instructors.map(i => {
      const mySecs = sections.filter(s => s.instructorId === i.id);
      const credits = mySecs.reduce((sum, s) => {
        const c = courses.find(c=>c.id===s.courseId)!;
        return sum + c.creditHours;
      }, 0);
      return { id: i.id, name: i.name, credits, target: i.targetCredits };
    });
  }, [sections]);

  return (
    <div className="p-3 border-t bg-white">
      <div className="font-semibold mb-2">Instructor Workload</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {rows.map(r => (
          <div key={r.id} className="border rounded p-2">
            <div className="font-medium">{r.name}</div>
            <div className={`text-sm ${r.credits<r.target ? "text-amber-700" : "text-emerald-700"}`}>
              {r.credits} / {r.target} credit hours
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
