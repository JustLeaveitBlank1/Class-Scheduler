// src/types.ts

// ---------- Catalog types (match backend) ----------

export interface Course {
  id: number;
  code: string;
  name: string;
  credit_hours: number;
  contact_hours: number;
}

export interface Instructor {
  id: number;
  name: string;
  email: string;
  department?: string | null;
  current_load: number;
  target_load?: number | null;
}

export interface Room {
  id: number;
  room_number: string;   // e.g. "PH211"
  capacity: number;
}

// ---------- Sections (new free-form times) ----------

export type SectionStatus = "open" | "closed";

export interface Section {
  id: number;
  course_id: number;
  instructor_id: number;
  room_id: number;

  // full ISO datetimes, e.g. "2025-01-13T14:00:00Z"
  start: string;
  end: string;

  credits: number;
  status: SectionStatus;
  section_number?: string | null;
  notes?: string | null;
}

export type SectionCreate = Omit<Section, "id">;
export type SectionPatch = Partial<SectionCreate>;

// ---------- UI helpers ----------

export type ViewMode = "rooms" | "instructors";
