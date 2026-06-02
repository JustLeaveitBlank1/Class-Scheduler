// src/store.ts
import { create } from "zustand";
import type {
  Course,
  Instructor,
  Room,
  Section,
  SectionCreate,
  SectionPatch,
  ViewMode,
} from "./types";
import { CatalogAPI } from "./api/catalog";
import { SectionsAPI } from "./api/sections";

type Filters = {
  rooms: number[];
  instructors: number[];
  mode: ViewMode; // e.g. "rooms" | "instructors"
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
  updateSection: (id: number, patch: SectionPatch) => Promise<void>;
  removeSection: (id: number) => Promise<void>;

  // filters (original names)
  setMode: (m: Filters["mode"]) => void;
  setRooms: (ids: number[]) => void;
  setInstructors: (ids: number[]) => void;

  // filters (new helpers for the calendar filter UI)
  setFilterMode: (m: Filters["mode"]) => void;
  setFilterRooms: (ids: number[]) => void;
  setFilterInstructors: (ids: number[]) => void;
  clearFilters: () => void;

  // validation
  hasConflict: (candidate: SectionCreate, selfId?: number) => string | null;
};

// simple time-overlap check
function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const a0 = new Date(aStart).getTime();
  const a1 = new Date(aEnd).getTime();
  const b0 = new Date(bStart).getTime();
  const b1 = new Date(bEnd).getTime();
  return a0 < b1 && a1 > b0;
}

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
    const candidate: SectionCreate = {
      ...(self as Section),
      ...(patch as Partial<Section>),
    };
    const err = get().hasConflict(candidate, id);
    if (err) throw new Error(err);

    set({ loading: true, error: undefined });
    try {
      await SectionsAPI.update(id, patch);
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

  // -------- Filters (original names, still used in some places) ----------
  setMode: (m) =>
    set((st) => ({
      filters: { ...st.filters, mode: m },
    })),
  setRooms: (ids) =>
    set((st) => ({
      filters: { ...st.filters, rooms: ids },
    })),
  setInstructors: (ids) =>
    set((st) => ({
      filters: { ...st.filters, instructors: ids },
    })),

  // -------- Filters (new helpers for calendar filter UI) ----------
  setFilterMode: (m) =>
    set((st) => ({
      filters: { ...st.filters, mode: m },
    })),
  setFilterRooms: (ids) =>
    set((st) => ({
      filters: { ...st.filters, rooms: ids },
    })),
  setFilterInstructors: (ids) =>
    set((st) => ({
      filters: { ...st.filters, instructors: ids },
    })),
  clearFilters: () =>
    set((st) => ({
      filters: { ...st.filters, rooms: [], instructors: [] },
    })),

  // -------- Conflict Check (front-end helper) ----------
  hasConflict: (cand, selfId) => {
    const clash = get().sections.find((s) => {
      if (selfId && s.id === selfId) return false;
      const sameInstructor = s.instructor_id === cand.instructor_id;
      const sameRoom = s.room_id === cand.room_id;
      if (!sameInstructor && !sameRoom) return false;
      return overlaps(s.start, s.end, cand.start, cand.end);
    });

    if (clash) {
      const who =
        clash.instructor_id === cand.instructor_id ? "instructor" : "room";
      return `Time conflict: that ${who} already has a section during that time.`;
    }
    return null;
  },
}));
