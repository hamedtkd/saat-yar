"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

type RouteSyncProps = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
};

export function RouteSync({ selectedDate, setSelectedDate }: RouteSyncProps) {
  const searchParams = useSearchParams();
  const requestedDate = searchParams.get("date");

  useEffect(() => {
    if (!requestedDate || !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) return;
    if (requestedDate !== selectedDate) setSelectedDate(requestedDate);
  }, [requestedDate, selectedDate, setSelectedDate]);

  return null;
}
