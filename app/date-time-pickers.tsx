"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const faNumber = new Intl.NumberFormat("fa-IR", { useGrouping: false });
const weekdays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function atNoon(value: string | Date) {
  const date =
    typeof value === "string" ? new Date(`${value}T12:00:00`) : new Date(value);
  date.setHours(12, 0, 0, 0);
  return date;
}

function jalaliPart(date: Date, type: "year" | "month" | "day") {
  const parts = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  return Number(parts.find((part) => part.type === type)?.value ?? 0);
}

function firstOfJalaliMonth(date: Date) {
  const result = atNoon(date);
  while (jalaliPart(result, "day") !== 1) result.setDate(result.getDate() - 1);
  return result;
}

function shiftJalaliMonth(date: Date, amount: number) {
  const first = firstOfJalaliMonth(date);
  first.setDate(first.getDate() + (amount > 0 ? 35 : -2));
  return firstOfJalaliMonth(first);
}

export function JalaliDatePicker({
  value,
  onChange,
  recordedDates = [],
}: {
  value: string;
  onChange: (value: string) => void;
  recordedDates?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [pivot, setPivot] = useState(() => atNoon(value));

  const cells = useMemo(() => {
    const monthStart = firstOfJalaliMonth(pivot);
    const gridStart = atNoon(monthStart);
    gridStart.setDate(gridStart.getDate() - ((gridStart.getDay() + 1) % 7));
    return Array.from({ length: 42 }, (_, index) => {
      const date = atNoon(gridStart);
      date.setDate(date.getDate() + index);
      return date;
    });
  }, [pivot]);

  const monthKey = `${jalaliPart(pivot, "year")}-${jalaliPart(pivot, "month")}`;
  const label = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(atNoon(value));
  const title = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    month: "long",
    year: "numeric",
  }).format(pivot);

  return (
    <div className="date-popover">
      <Button
        variant="outline"
        className={`picker-trigger ${open ? "open" : ""}`}
        type="button"
        onClick={() => {
          if (!open) setPivot(atNoon(value));
          setOpen(!open);
        }}
        aria-expanded={open}
      >
        <span className="picker-icon" aria-hidden="true">
          <CalendarDays />
        </span>
        <span>
          <small>انتخاب روز</small>
          <strong>{label}</strong>
        </span>
        <ChevronDown
          className={`picker-chevron ${open ? "rotate" : ""}`}
          aria-hidden="true"
        />
      </Button>
      {open && (
        <>
          <button
            className="picker-backdrop"
            type="button"
            aria-label="بستن تقویم"
            onClick={() => setOpen(false)}
          />
          <div
            className="calendar-panel"
            role="dialog"
            aria-modal="true"
            aria-label="انتخاب تاریخ شمسی"
          >
            <div className="calendar-head">
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => setPivot(shiftJalaliMonth(pivot, -1))}
                aria-label="ماه قبل"
              >
                <ChevronRight />
              </Button>
              <strong>{title}</strong>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => setPivot(shiftJalaliMonth(pivot, 1))}
                aria-label="ماه بعد"
              >
                <ChevronLeft />
              </Button>
            </div>
            <div className="calendar-weekdays">
              {weekdays.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="calendar-grid">
              {cells.map((date) => {
                const key = dateKey(date);
                const inMonth =
                  `${jalaliPart(date, "year")}-${jalaliPart(date, "month")}` ===
                  monthKey;
                const selected = key === value;
                const today = key === dateKey(new Date());
                return (
                  <button
                    type="button"
                    key={key}
                    className={`${inMonth ? "" : "outside"} ${selected ? "selected" : ""} ${today ? "today" : ""}`}
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                    aria-label={new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
                      dateStyle: "full",
                    }).format(date)}
                  >
                    {faNumber.format(jalaliPart(date, "day"))}
                    {recordedDates.includes(key) && (
                      <i aria-label="دارای اطلاعات ثبت‌شده" />
                    )}
                  </button>
                );
              })}
            </div>
            <Button
              variant="secondary"
              className="calendar-today"
              type="button"
              onClick={() => {
                const today = dateKey(new Date());
                onChange(today);
                setOpen(false);
              }}
            >
              رفتن به امروز
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export function TimePicker({
  value,
  onChange,
  placeholder = "انتخاب ساعت",
  suggestions = [],
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [hour = "", minute = ""] = value.split(":");

  const setPart = (nextHour: string, nextMinute: string) =>
    onChange(`${nextHour || "00"}:${nextMinute || "00"}`);

  return (
    <div className="time-picker">
      <Button
        variant="outline"
        type="button"
        className={`time-picker-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="clock-dot">
          <Clock3 />
        </span>
        <strong>
          {value
            ? value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])
            : placeholder}
        </strong>
        <ChevronDown className={open ? "rotate" : ""} />
      </Button>
      {open && (
        <>
          <button
            className="picker-backdrop"
            type="button"
            aria-label="بستن انتخاب ساعت"
            onClick={() => setOpen(false)}
          />
          <div
            className="time-panel"
            role="dialog"
            aria-modal="true"
            aria-label={placeholder}
          >
            <div className="time-panel-title">
              <span>دقیقه</span>
              <span>ساعت</span>
            </div>
            <div className="time-selects" dir="ltr">
              <Select
                value={hour || "00"}
                onValueChange={(nextHour) => setPart(nextHour, minute)}
              >
                <SelectTrigger aria-label="ساعت">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  onCloseAutoFocus={(event) => event.preventDefault()}
                >
                  {Array.from({ length: 24 }, (_, index) => {
                    const item = String(index).padStart(2, "0");
                    return (
                      <SelectItem key={item} value={item}>
                        {faNumber.format(index).padStart(2, "۰")}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <b>:</b>
              <Select
                value={minute || "00"}
                onValueChange={(nextMinute) => setPart(hour, nextMinute)}
              >
                <SelectTrigger aria-label="دقیقه">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  onCloseAutoFocus={(event) => event.preventDefault()}
                >
                  {Array.from({ length: 60 }, (_, index) => {
                    const item = String(index).padStart(2, "0");
                    return (
                      <SelectItem key={item} value={item}>
                        {faNumber.format(index).padStart(2, "۰")}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="time-quick">
              {suggestions.map((item) => (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  key={`${item.label}-${item.value}`}
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <span>{item.label}</span>
                  <b>
                    {item.value.replace(
                      /\d/g,
                      (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)],
                    )}
                  </b>
                </Button>
              ))}
            </div>
            <Button
              className="time-confirm"
              type="button"
              onClick={() => setOpen(false)}
            >
              <Check />
              تأیید ساعت
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
