// src/api/sections.ts
import { api } from "./client";
import type { Section, SectionCreate, SectionPatch } from "../types";

export const SectionsAPI = {
  // backend routes are /sections/ with a trailing slash
  list: () => api<Section[]>("/sections/"),

  create: (payload: SectionCreate) =>
    api<Section>("/sections/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, patch: SectionPatch) =>
    api<Section>(`/sections/${encodeURIComponent(id)}/`, {
      method: "PATCH", // partial update
      body: JSON.stringify(patch),
    }),

  remove: (id: string) =>
    api<void>(`/sections/${encodeURIComponent(id)}/`, {
      method: "DELETE",
    }),
};
