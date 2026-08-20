import { createInitialData } from "../../lib/constants.ts";
import type { AppData, WorkRecord } from "../../lib/types.ts";

const DAY_MS = 86_400_000;

function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function shiftDate(anchor: Date, days: number) {
  return new Date(anchor.getTime() + days * DAY_MS);
}

function record(
  date: string,
  start: string,
  end: string,
  note: string,
  overrides: Partial<WorkRecord> = {}
): WorkRecord {
  return {
    date,
    start,
    end,
    lunchMinutes: 45,
    lunchStart: "12:30",
    lunchEnd: "13:15",
    lunchPaid: false,
    breaks: [],
    activitySegments: [],
    leaveMinutes: 0,
    leaveType: "none",
    note,
    holiday: false,
    updatedAt: `${date}T17:00:00.000Z`,
    ...overrides,
  };
}

export function createMediaDemoData(
  anchorIso = "2026-08-07T10:30:00+03:30"
): AppData {
  const anchor = new Date(anchorIso);
  const data = createInitialData({ onboarded: true });
  data.settings.name = "حامد";
  data.settings.mode = "employee";
  data.settings.salary = 48_000_000;
  data.settings.weeklyMinutes = 42 * 60 + 30;
  data.settings.appearance = {
    mode: "light",
    preset: "violet",
    accent: "#8b5cf6",
    radius: "rounded",
    surface: "tinted",
  };
  data.settings.payrollComponents = [
    {
      id: "housing",
      title: "حق مسکن",
      amount: 9_000_000,
      type: "earning",
      enabled: true,
    },
    {
      id: "insurance",
      title: "بیمه",
      amount: 3_400_000,
      type: "deduction",
      enabled: true,
    },
  ];

  const records: Record<string, WorkRecord> = {};
  const patterns = [
    ["07:52", "16:40"],
    ["08:04", "17:05"],
    ["07:45", "16:18"],
    ["08:10", "16:55"],
    ["07:58", "16:31"],
    ["07:50", "17:14"],
    ["08:02", "16:36"],
  ] as const;
  for (let offset = -20; offset <= 0; offset += 1) {
    const current = shiftDate(anchor, offset);
    const day = current.getDay();
    if (day === 5) continue;
    const key = dateKey(current);
    const [start, end] = patterns[Math.abs(offset) % patterns.length];
    records[key] = record(
      key,
      start,
      end,
      offset === 0
        ? "مرور برنامه هفته و تحویل نسخه طراحی نهایی"
        : "کارهای برنامه‌ریزی‌شده روزانه"
    );
  }
  const today = dateKey(anchor);
  records[today] = record(
    today,
    "07:55",
    "16:48",
    "مرور نسخه نهایی داشبورد و آماده‌سازی انتشار",
    {
      breaks: [
        {
          id: "break-demo",
          start: "10:25",
          end: "10:35",
          title: "استراحت کوتاه",
          paid: true,
        },
      ],
    }
  );
  data.records = records;

  data.leaves = [
    {
      id: "leave-demo",
      startDate: dateKey(shiftDate(anchor, -9)),
      endDate: dateKey(shiftDate(anchor, -9)),
      type: "hourly",
      minutes: 120,
      note: "کار شخصی",
      createdAt: dateKey(shiftDate(anchor, -10)) + "T09:00:00.000Z",
    },
  ];
  data.clients = [
    {
      id: "client-1",
      name: "استودیو محصول",
      color: "#8b5cf6",
      email: "hello@example.com",
      note: "طراحی محصول",
      archived: false,
    },
    {
      id: "client-2",
      name: "داده‌پرداز",
      color: "#8b5cf6",
      email: "team@example.com",
      note: "داشبورد مدیریتی",
      archived: false,
    },
  ];
  data.projects = [
    {
      id: "project-1",
      clientId: "client-1",
      name: "طراحی داشبورد",
      rate: 850_000,
      color: "#8b5cf6",
      status: "active",
      budgetHours: 45,
      billable: true,
    },
    {
      id: "project-2",
      clientId: "client-2",
      name: "گزارش تحلیلی",
      rate: 1_050_000,
      color: "#8b5cf6",
      status: "active",
      budgetHours: 28,
      billable: true,
    },
  ];
  data.timeEntries = [
    {
      id: "time-1",
      clientId: "client-1",
      projectId: "project-1",
      task: "UI polish",
      startedAt: "2026-08-06T05:00:00.000Z",
      endedAt: "2026-08-06T08:30:00.000Z",
      note: "صفحه امروز",
      billable: true,
      effectiveRate: 850_000,
    },
    {
      id: "time-2",
      clientId: "client-2",
      projectId: "project-2",
      task: "Charts",
      startedAt: "2026-08-05T06:00:00.000Z",
      endedAt: "2026-08-05T09:10:00.000Z",
      note: "گزارش‌ها",
      billable: true,
      effectiveRate: 1_050_000,
    },
  ];
  data.expenses = [
    {
      id: "expense-1",
      projectId: "project-1",
      clientId: "client-1",
      title: "ابزار طراحی",
      amount: 1_600_000,
      date: dateKey(shiftDate(anchor, -5)),
      category: "software",
      createdAt: dateKey(shiftDate(anchor, -5)) + "T08:00:00.000Z",
    },
  ];
  data.invoices = [
    {
      id: "invoice-1",
      number: "SY-1405-021",
      clientId: "client-1",
      projectId: "project-1",
      issuedAt: dateKey(shiftDate(anchor, -4)),
      dueAt: dateKey(shiftDate(anchor, 10)),
      status: "sent",
      lines: [
        {
          id: "line-1",
          description: "طراحی و توسعه داشبورد",
          quantity: 1,
          unitPrice: 32_000_000,
        },
      ],
      discount: 0,
      taxPercent: 0,
      note: "مرحله دوم پروژه",
      createdAt: dateKey(shiftDate(anchor, -4)) + "T08:00:00.000Z",
    },
  ];
  return data;
}
