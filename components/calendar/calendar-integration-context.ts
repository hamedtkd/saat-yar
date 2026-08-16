import { createContext } from "react";
import type {
  ExternalCalendarConnectionState,
  ExternalCalendarErrorCode,
  ExternalCalendarEvent,
  ExternalCalendarEventDraft,
  ExternalCalendarRange,
  ExternalCalendarSource,
} from "@/lib/calendar-integration/types";

export type CalendarIntegrationContextValue = {
  configured: boolean;
  state: ExternalCalendarConnectionState;
  errorCode: ExternalCalendarErrorCode | null;
  calendars: ExternalCalendarSource[];
  writableCalendars: ExternalCalendarSource[];
  selectedCalendarIds: string[];
  events: ExternalCalendarEvent[];
  loadedRange: ExternalCalendarRange | null;
  loadingEvents: boolean;
  mutating: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  revoke: () => Promise<void>;
  setCalendarSelected: (calendarId: string, selected: boolean) => void;
  loadRange: (range: ExternalCalendarRange) => Promise<void>;
  createEvent: (draft: ExternalCalendarEventDraft) => Promise<void>;
  updateEvent: (event: ExternalCalendarEvent, draft: ExternalCalendarEventDraft) => Promise<void>;
  deleteEvent: (event: ExternalCalendarEvent, options?: { series?: boolean; notifyAttendees?: boolean }) => Promise<void>;
};

export const CalendarIntegrationContext = createContext<CalendarIntegrationContextValue | null>(null);
