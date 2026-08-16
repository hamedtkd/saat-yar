"use client";

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  fetchGoogleCalendarEvents,
  fetchGoogleCalendars,
  GoogleCalendarApiError,
  resolveGoogleCalendarConfig,
  updateGoogleCalendarEvent,
} from "@/lib/calendar-integration/google-calendar";
import {
  GoogleIdentityError,
  requestGoogleCalendarAccess,
  revokeGoogleCalendarAccess,
  type GoogleAccessSession,
} from "@/lib/calendar-integration/google-identity";
import {
  DEFAULT_EXTERNAL_CALENDAR_PREFERENCES,
  readExternalCalendarPreferences,
  subscribeExternalCalendarPreferences,
  writeExternalCalendarPreferences,
} from "@/lib/calendar-integration/preferences";
import type {
  ExternalCalendarErrorCode,
  ExternalCalendarEvent,
  ExternalCalendarEventDraft,
  ExternalCalendarPreferences,
  ExternalCalendarRange,
  ExternalCalendarSource,
} from "@/lib/calendar-integration/types";
import type { CalendarIntegrationContextValue } from "./calendar-integration-context";

function classifyError(error: unknown): ExternalCalendarErrorCode {
  if (error instanceof GoogleIdentityError) return error.code;
  if (error instanceof GoogleCalendarApiError) return error.status === 401 || error.status === 403 ? "authorization" : "api";
  return "network";
}

function chooseInitialSelection(calendars: ExternalCalendarSource[], preferences: ExternalCalendarPreferences) {
  const available = new Set(calendars.map((calendar) => calendar.id));
  const stored = preferences.selectedCalendarIds.filter((calendarId) => available.has(calendarId));
  if (stored.length) return stored;
  const primary = calendars.find((calendar) => calendar.primary);
  return primary ? [primary.id] : calendars[0] ? [calendars[0].id] : [];
}

function sameRange(left: ExternalCalendarRange | null, right: ExternalCalendarRange) {
  return Boolean(left && left.startDateKey === right.startDateKey && left.endDateKeyExclusive === right.endDateKeyExclusive);
}

export function useCalendarIntegrationController(onToast?: (message: string) => void): CalendarIntegrationContextValue {
  const { t } = useLocaleUi();
  const config = resolveGoogleCalendarConfig();
  const [state, setState] = useState<CalendarIntegrationContextValue["state"]>(config.configured ? "disconnected" : "unconfigured");
  const [errorCode, setErrorCode] = useState<ExternalCalendarErrorCode | null>(null);
  const [calendars, setCalendars] = useState<ExternalCalendarSource[]>([]);
  const preferences = useSyncExternalStore(subscribeExternalCalendarPreferences, readExternalCalendarPreferences, () => DEFAULT_EXTERNAL_CALENDAR_PREFERENCES);
  const [events, setEvents] = useState<ExternalCalendarEvent[]>([]);
  const [loadedRange, setLoadedRange] = useState<ExternalCalendarRange | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [mutating, setMutating] = useState(false);
  const sessionRef = useRef<GoogleAccessSession | null>(null);
  const pendingRangeRef = useRef("");
  const requestIdRef = useRef(0);

  const persistSelection = useCallback((selectedCalendarIds: string[]) => {
    writeExternalCalendarPreferences({ version: 1, provider: "google", selectedCalendarIds });
    setEvents([]);
    setLoadedRange(null);
    pendingRangeRef.current = "";
  }, []);

  const disconnect = useCallback(() => {
    sessionRef.current = null;
    setCalendars([]);
    setEvents([]);
    setLoadedRange(null);
    setLoadingEvents(false);
    setMutating(false);
    setErrorCode(null);
    pendingRangeRef.current = "";
    setState(config.configured ? "disconnected" : "unconfigured");
  }, [config.configured]);

  const connect = useCallback(async () => {
    if (!config.configured) {
      setState("unconfigured");
      setErrorCode("configuration");
      return;
    }
    setState("connecting");
    setErrorCode(null);
    try {
      const session = await requestGoogleCalendarAccess(config.clientId);
      const availableCalendars = await fetchGoogleCalendars(session.accessToken);
      sessionRef.current = session;
      setCalendars(availableCalendars);
      persistSelection(chooseInitialSelection(availableCalendars, preferences));
      setState("connected");
    } catch (error) {
      sessionRef.current = null;
      setState("error");
      setErrorCode(classifyError(error));
    }
  }, [config.clientId, config.configured, persistSelection, preferences]);

  const revoke = useCallback(async () => {
    const session = sessionRef.current;
    if (session?.accessToken) {
      try { await revokeGoogleCalendarAccess(session.accessToken); } catch { /* local disconnect remains safe */ }
    }
    disconnect();
  }, [disconnect]);

  const setCalendarSelected = useCallback((calendarId: string, selected: boolean) => {
    const current = new Set(readExternalCalendarPreferences().selectedCalendarIds);
    if (selected) current.add(calendarId);
    else current.delete(calendarId);
    persistSelection([...current]);
  }, [persistSelection]);

  const loadRangeRequest = useCallback(async (range: ExternalCalendarRange, force = false) => {
    if (state !== "connected") return;
    const session = sessionRef.current;
    if (!session || session.expiresAt <= Date.now() + 5_000) {
      sessionRef.current = null;
      setState("expired");
      setErrorCode("authorization");
      setEvents([]);
      setLoadedRange(null);
      return;
    }
    const selected = calendars.filter((calendar) => preferences.selectedCalendarIds.includes(calendar.id));
    if (!selected.length) {
      setEvents([]);
      setLoadedRange(range);
      return;
    }
    const selectionKey = selected.map((calendar) => calendar.id).sort().join("|");
    const requestKey = `${range.startDateKey}:${range.endDateKeyExclusive}:${selectionKey}`;
    if (!force && sameRange(loadedRange, range) && pendingRangeRef.current === requestKey) return;
    if (!force && pendingRangeRef.current === requestKey && loadingEvents) return;
    pendingRangeRef.current = requestKey;
    const requestId = ++requestIdRef.current;
    setLoadingEvents(true);
    setErrorCode(null);
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const nextEvents = await fetchGoogleCalendarEvents(session.accessToken, selected, range, timeZone);
      if (requestId !== requestIdRef.current) return;
      setEvents(nextEvents);
      setLoadedRange(range);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const code = classifyError(error);
      setErrorCode(code);
      if (code === "authorization") {
        sessionRef.current = null;
        setState("expired");
        setEvents([]);
        setLoadedRange(null);
      } else setState("error");
      throw error;
    } finally {
      if (requestId === requestIdRef.current) setLoadingEvents(false);
    }
  }, [calendars, loadedRange, loadingEvents, preferences.selectedCalendarIds, state]);

  const loadRange = useCallback(async (range: ExternalCalendarRange) => {
    try { await loadRangeRequest(range, false); } catch { /* provider state owns read errors */ }
  }, [loadRangeRequest]);

  const mutate = useCallback(async (operation: (accessToken: string, timeZone: string) => Promise<unknown>) => {
    const session = sessionRef.current;
    if (state !== "connected" || !session || session.expiresAt <= Date.now() + 5_000) {
      setState("expired");
      setErrorCode("authorization");
      throw new GoogleCalendarApiError(401);
    }
    setMutating(true);
    setErrorCode(null);
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      await operation(session.accessToken, timeZone);
      if (loadedRange) await loadRangeRequest(loadedRange, true);
    } catch (error) {
      const code = classifyError(error);
      setErrorCode(code);
      if (code === "authorization") {
        sessionRef.current = null;
        setState("expired");
      }
      onToast?.(t("calendar.google.toast.error"));
      throw error;
    } finally { setMutating(false); }
  }, [loadRangeRequest, loadedRange, onToast, state, t]);

  const createEvent = useCallback(async (draft: ExternalCalendarEventDraft) => {
    const calendar = calendars.find((item) => item.id === draft.calendarId);
    if (!calendar?.writable) throw new GoogleCalendarApiError(403);
    await mutate((accessToken, timeZone) => createGoogleCalendarEvent(accessToken, draft, timeZone));
    onToast?.(t("calendar.google.toast.created"));
  }, [calendars, mutate, onToast, t]);

  const updateEvent = useCallback(async (event: ExternalCalendarEvent, draft: ExternalCalendarEventDraft) => {
    if (!event.editable) throw new GoogleCalendarApiError(403);
    await mutate((accessToken, timeZone) => updateGoogleCalendarEvent(accessToken, event.calendarId, event.id, draft, timeZone));
    onToast?.(t("calendar.google.toast.updated"));
  }, [mutate, onToast, t]);

  const deleteEvent = useCallback(async (event: ExternalCalendarEvent, options?: { series?: boolean; notifyAttendees?: boolean }) => {
    if (!event.editable) throw new GoogleCalendarApiError(403);
    const eventId = options?.series && event.recurringEventId ? event.recurringEventId : event.id;
    await mutate((accessToken) => deleteGoogleCalendarEvent(accessToken, event.calendarId, eventId, options?.notifyAttendees ?? true));
    onToast?.(t("calendar.google.toast.deleted"));
  }, [mutate, onToast, t]);

  const writableCalendars = useMemo(() => calendars.filter((calendar) => calendar.writable), [calendars]);
  return useMemo(() => ({
    configured: config.configured, state, errorCode, calendars, writableCalendars,
    selectedCalendarIds: preferences.selectedCalendarIds, events, loadedRange, loadingEvents, mutating,
    connect, disconnect, revoke, setCalendarSelected, loadRange, createEvent, updateEvent, deleteEvent,
  }), [calendars, config.configured, connect, createEvent, deleteEvent, disconnect, errorCode, events, loadRange, loadedRange, loadingEvents, mutating, preferences.selectedCalendarIds, revoke, setCalendarSelected, state, updateEvent, writableCalendars]);
}
