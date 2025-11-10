export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
export type MeetingSlotId = string; // e.g. "MWF-08:00-08:50" or "TR-09:30-10:45"

export interface Course {
  id: string;
  code: string;         // e.g. "PHYS 191"
  title: string;        // e.g. "General Physics I"
  creditHours: 1 | 2 | 3 | 4;
}

export interface Instructor {
  id: number;
  name: string;
  targetCredits: number; // desired total load
}

export interface Room {
  id: number;
  name: string;   // e.g. "CP 207"
  capacity: number;
  hasPower?: boolean;
}

export interface MeetingSlot {
  id: MeetingSlotId;
  label: string;            // "MWF 8:00–8:50"
  pattern: Day[];           // ["Mon","Wed","Fri"]
  start: string;            // "08:00" 24h
  end: string;              // "08:50"
  creditHours: 1 | 2 | 3 | 4; // which credit loads this slot supports
}

export interface Section {
  id: string;
  courseId: string;
  instructorId: number;
  roomId: number;
  seats: number;
  meetingSlotId: MeetingSlotId;
}

export type ViewMode = "rooms" | "instructors";
// ...your existing types above

export type SectionCreate = Omit<Section, "id">;
export type SectionPatch = Partial<Omit<Section, "id">> & { id: string };
