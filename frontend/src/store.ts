import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Section } from "./types";   // 👈 type-only import
import { meetingSlots } from "./data";


type Filters = {
  rooms: number[];        // selected room ids
  instructors: number[];  // selected instructor ids
  mode: "rooms" | "instructors";
};

type State = {
  sections: Section[];
  filters: Filters;
  addSection: (s: Omit<Section, "id">) => void;
  updateSection: (id: string, patch: Partial<Section>) => void;
  removeSection: (id: string) => void;

  setMode: (m: Filters["mode"]) => void;
  setRooms: (ids: number[]) => void;
  setInstructors: (ids: number[]) => void;

  hasConflict: (candidate: Omit<Section, "id">, selfId?: string) => string | null;
};

export const useStore = create<State>((set, get) => ({
  sections: [],
  filters: { rooms: [], instructors: [], mode: "rooms" },

  addSection: (s) => {
    const err = get().hasConflict(s);
    if (err) throw new Error(err);
    set((st) => ({ sections: [...st.sections, { ...s, id: nanoid() }] }));
  },

  updateSection: (id, patch) => {
    set((st) => ({
      sections: st.sections.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  },

  removeSection: (id) =>
    set((st) => ({ sections: st.sections.filter((x) => x.id !== id) })),

  setMode: (m) => set((st) => ({ filters: { ...st.filters, mode: m } })),
  setRooms: (ids) => set((st) => ({ filters: { ...st.filters, rooms: ids } })),
  setInstructors: (ids) =>
    set((st) => ({ filters: { ...st.filters, instructors: ids } })),

  hasConflict: (cand, selfId) => {
    const slot = meetingSlots.find((s) => s.id === cand.meetingSlotId);
    if (!slot) return "Invalid meeting slot";

    // same timeslot + same instructor OR same room
    const clash = get().sections.find((s) => {
      if (selfId && s.id === selfId) return false;
      if (s.meetingSlotId !== cand.meetingSlotId) return false;
      return s.instructorId === cand.instructorId || s.roomId === cand.roomId;
    });

    if (clash) {
      const who = clash.instructorId === cand.instructorId ? "instructor" : "room";
      return `Time conflict: that ${who} already has a section at ${slot.label}.`;
    }
    return null;
  },
}));
