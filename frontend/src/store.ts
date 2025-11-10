// src/store.ts
import { create } from "zustand";
import { meetingSlots } from "./data";
import type {
  Course,
  Instructor,
  Room,
  Section,
  SectionCreate,
  SectionPatch,
} from "./types";
import { CatalogAPI } from "./api/catalog";
import { SectionsAPI } from "./api/sections";

type Filters = {
  rooms: number[];
  instructors: number[];
  mode: "rooms" | "instructors";
};

type State = {
  // catalog data
  courses: Course[];
  instructors: Instructor[];
  rooms: Room[];
  coursesLoaded: boolean;
  instructorsLoaded: boolean;
  roomsLoaded: boolean;

  // sections data
  sections: Section[];

  // ui
  loading: boolean;
  error?: string;
  filters: Filters;

  // catalog
  loadCatalog: () => Promise<void>;

  // sections
  loadSections: () => Promise<void>;
  addSection: (s: SectionCreate) => Promise<void>;
  updateSection: (id: string, patch: Partial<Section>) => Promise<void>;
  removeSection: (id: string) => Promise<void>;

  // filters
  setMode: (m: Filters["mode"]) => void;
  setRooms: (ids: number[]) => void;
  setInstructors: (ids: number[]) => void;

  // validation
  hasConflict: (candidate: SectionCreate, selfId?: string) => string | null;
};

export const useStore = create<State>((set, get) => ({
  // catalog
  courses: [],
  instructors: [],
  rooms: [],
  coursesLoaded: false,
  instructorsLoaded: false,
  roomsLoaded: false,

  // sections
  sections: [],

  // ui
  loading: false,
  filters: { rooms: [], instructors: [], mode: "rooms" },

  // -------- Catalog (courses/instructors/rooms) ----------
  loadCatalog: async () => {
    set({ loading: true, error: undefined });
    try {
      const [courses, instructors, rooms] = await Promise.all([
        CatalogAPI.courses(),
        CatalogAPI.instructors(),
        CatalogAPI.rooms(),
      ]);
      set({
        courses,
        instructors,
        rooms,
        coursesLoaded: true,
        instructorsLoaded: true,
        roomsLoaded: true,
        loading: false,
      });
    } catch (e: any) {
      set({ error: e.message ?? String(e), loading: false });
    }
  },

  // -------- Sections (list/create/update/delete) ----------
  loadSections: async () => {
    set({ loading: true, error: undefined });
    try {
      const sections = await SectionsAPI.list();
      set({ sections, loading: false });
    } catch (e: any) {
      set({ error: e.message ?? String(e), loading: false });
    }
  },

  addSection: async (s) => {
    const err = get().hasConflict(s);
    if (err) throw new Error(err);
    set({ loading: true, error: undefined });
    try {
      await SectionsAPI.create(s);
      await get().loadSections();
    } catch (e: any) {
      set({ error: e.message ?? String(e), loading: false });
      throw e;
    }
  },

  updateSection: async (id, patch) => {
    const self = get().sections.find((x) => x.id === id);
    const candidate = { ...(self as Section), ...(patch as Partial<Section>) } as SectionCreate;
    const err = get().hasConflict(candidate, id);
    if (err) throw new Error(err);

    set({ loading: true, error: undefined });
    try {
      await SectionsAPI.update(id, { id, ...patch } as SectionPatch);
      await get().loadSections();
    } catch (e: any) {
      set({ error: e.message ?? String(e), loading: false });
      throw e;
    }
  },

  removeSection: async (id) => {
    set({ loading: true, error: undefined });
    try {
      await SectionsAPI.remove(id);
      await get().loadSections();
    } catch (e: any) {
      set({ error: e.message ?? String(e), loading: false });
      throw e;
    }
  },

  // -------- Filters ----------
  setMode: (m) => set((st) => ({ filters: { ...st.filters, mode: m } })),
  setRooms: (ids) => set((st) => ({ filters: { ...st.filters, rooms: ids } })),
  setInstructors: (ids) =>
    set((st) => ({ filters: { ...st.filters, instructors: ids } })),

  // -------- Conflict Check (unchanged) ----------
  hasConflict: (cand, selfId) => {
    const slot = meetingSlots.find((s) => s.id === cand.meetingSlotId);
    if (!slot) return "Invalid meeting slot";

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
