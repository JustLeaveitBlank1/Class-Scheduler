// src/utils/time.ts
import type { MeetingSlot } from "../types";
import {
  addDays, addWeeks, addMonths, addYears,
  startOfWeek, isSameDay, isSameWeek, format,
  differenceInMinutes, startOfDay,
} from "date-fns";

/** ---------- Time/grid window (1:00 → 23:00) ---------- */
export const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const DAY_START = minutes("01:00");
export const DAY_END   = minutes("23:00");
export const GRID_MINUTES = DAY_END - DAY_START;
export const GRID_PX = GRID_MINUTES; // 1 px per minute

export const timeToPct = (tMin: number) =>
  ((tMin - DAY_START) / (DAY_END - DAY_START)) * 100;

export function slotStartMin(slot: MeetingSlot | string) {
  const start = typeof slot === "string" ? slot : slot.start;
  return minutes(start);
}
export function slotEndMin(slot: MeetingSlot | string) {
  const end = typeof slot === "string" ? slot : slot.end;
  return minutes(end);
}
export const slotLen = (s: MeetingSlot) => slotEndMin(s) - slotStartMin(s);

export function formatHourLabel(totalMinutesFromMidnight: number) {
  const hour24 = Math.floor(totalMinutesFromMidnight / 60);
  const ampm = hour24 < 12 ? "AM" : "PM";
  const hour12 = ((hour24 + 11) % 12) + 1;
  return `${hour12} ${ampm}`;
}

/** ---------- Week start: SUNDAY (fixed) ---------- */
export const WEEK_STARTS_ON: 0 = 0; // 0=Sun

export const getWeekStart = (d: Date = new Date(), weekStartsOn: 0 = WEEK_STARTS_ON) =>
  startOfWeek(d, { weekStartsOn });

export const getWeekDays = (weekStart: Date) =>
  Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

export const formatDayLabel = (d: Date) => format(d, "EEE M/d");
export const isToday = (d: Date) => isSameDay(d, new Date());
export const isThisWeek = (weekStart: Date, weekStartsOn: 0 = WEEK_STARTS_ON) =>
  isSameWeek(weekStart, new Date(), { weekStartsOn });

export const minutesFromDayStart = (d: Date) =>
  differenceInMinutes(d, startOfDay(d));
export const clampToWindow = (min: number) =>
  Math.max(DAY_START, Math.min(DAY_END, min));
export const dateTimeToPct = (d: Date) =>
  timeToPct(clampToWindow(minutesFromDayStart(d)));
export const nowLinePct = () => dateTimeToPct(new Date());

export const nextWeek = (weekStart: Date) => addWeeks(weekStart, 1);
export const prevWeek = (weekStart: Date) => addWeeks(weekStart, -1);

export { addDays, addWeeks, addMonths, addYears };
