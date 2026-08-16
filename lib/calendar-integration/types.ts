export type ExternalCalendarProvider = "google";

export type ExternalCalendarConnectionState =
  | "unconfigured"
  | "disconnected"
  | "connecting"
  | "connected"
  | "expired"
  | "error";

export type ExternalCalendarErrorCode =
  | "configuration"
  | "popup"
  | "permission"
  | "network"
  | "authorization"
  | "api";

export type ExternalCalendarSource = {
  provider: ExternalCalendarProvider;
  id: string;
  name: string;
  primary: boolean;
  color?: string;
  accessRole: string;
  writable: boolean;
};

export type ExternalCalendarEventKind = "meeting" | "focus" | "availability" | "activity";

export type ExternalCalendarEvent = {
  provider: ExternalCalendarProvider;
  calendarId: string;
  calendarName: string;
  calendarColor?: string;
  id: string;
  title: string;
  kind: ExternalCalendarEventKind;
  allDay: boolean;
  start: string;
  end: string;
  startDateKey: string;
  endDateKey: string;
  htmlLink?: string;
  description?: string;
  location?: string;
  recurringEventId?: string;
  editable: boolean;
};

export type ExternalCalendarPreferences = {
  version: 1;
  provider: ExternalCalendarProvider;
  selectedCalendarIds: string[];
};

export type ExternalCalendarRange = {
  startDateKey: string;
  endDateKeyExclusive: string;
};

export type ExternalCalendarEventRepeat = "none" | "daily" | "weekly" | "monthly";

export type ExternalCalendarEventDraft = {
  calendarId: string;
  title: string;
  description: string;
  location: string;
  allDay: boolean;
  startDateKey: string;
  endDateKey: string;
  startTime: string;
  endTime: string;
  repeat: ExternalCalendarEventRepeat;
  notifyAttendees: boolean;
};

export type ExternalCalendarMutationResult = {
  eventId: string;
};
