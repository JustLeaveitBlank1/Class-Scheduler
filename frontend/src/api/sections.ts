// src/api/sections.ts
import { api } from "./client";
import type { Section, SectionCreate, SectionPatch } from "../types";

export const SectionsAPI = {
  // GET /sections/
  list: () => api<Section[]>("/sections/"),

  // POST /sections/
  create: (payload: SectionCreate) =>
    api<Section>("/sections/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // PUT /sections/{id}
  update: (id: number, patch: SectionPatch) =>
    api<Section>(`/sections/${encodeURIComponent(String(id))}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    }),

  // DELETE /sections/{id}
  remove: (id: number) =>
    api<void>(`/sections/${encodeURIComponent(String(id))}`, {
      method: "DELETE",
    }),
};
