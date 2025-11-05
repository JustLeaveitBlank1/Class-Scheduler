// src/data.ts
import type { Course, Instructor, Room, MeetingSlot } from "./types"; // 👈 add "type"

// (rest unchanged)
export const instructors: Instructor[] = [
  { id: 1, name: "Dr. Georgina Little", targetCredits: 9 },
  { id: 2, name: "Dr. Adams", targetCredits: 9 },
  { id: 3, name: "Dr. Bates", targetCredits: 6 },
];

export const rooms: Room[] = [
  { id: 1, name: "CP 201", capacity: 28, hasPower: true },
  { id: 2, name: "CP 207", capacity: 36, hasPower: false },
  { id: 3, name: "CP 310", capacity: 48, hasPower: true },
];

export const courses: Course[] = [
  { id: "c191", code: "PHYS 191", title: "General Physics I", creditHours: 3 },
  { id: "c192", code: "PHYS 192", title: "General Physics II", creditHours: 3 },
  { id: "cPLAB", code: "PLAB 1930", title: "Physics Lab", creditHours: 1 },
  { id: "cCHEM", code: "CHEM 101", title: "Intro Chemistry", creditHours: 3 },
];

export const meetingSlots: MeetingSlot[] = [
  { id: "MWF-08:00-08:50", label: "MWF 8:00–8:50", pattern: ["Mon","Wed","Fri"], start: "08:00", end: "08:50", creditHours: 3 },
  { id: "MWF-09:00-09:50", label: "MWF 9:00–9:50", pattern: ["Mon","Wed","Fri"], start: "09:00", end: "09:50", creditHours: 3 },
  { id: "TR-09:30-10:45", label: "TR 9:30–10:45", pattern: ["Tue","Thu"], start: "09:30", end: "10:45", creditHours: 3 },
  { id: "TR-11:00-12:15", label: "TR 11:00–12:15", pattern: ["Tue","Thu"], start: "11:00", end: "12:15", creditHours: 3 },
  { id: "W-14:00-16:50", label: "W 2:00–4:50", pattern: ["Wed"], start: "14:00", end: "16:50", creditHours: 1 },
  { id: "MTWR-08:00-08:50", label: "MTWR 8:00–8:50", pattern: ["Mon","Tue","Wed","Thu"], start: "08:00", end: "08:50", creditHours: 4 },
];
