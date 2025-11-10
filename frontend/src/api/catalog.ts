// src/api/catalog.ts
import { api } from "./client";
import type { Course, Instructor, Room } from "../types";

export const CatalogAPI = {
  courses:     () => api<Course[]>("/courses/"),
  instructors: () => api<Instructor[]>("/instructors/"),
  rooms:       () => api<Room[]>("/rooms/"),
};
