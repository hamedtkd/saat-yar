export type Mode = "employee" | "freelancer" | "hybrid";
export type WeekdayKey = "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday";

export type WorkScheduleDay = {
  enabled: boolean;
  start: string;
  end: string;
  lunchMinutes: number;
};

export type PayrollComponent = {
  id: string;
  title: string;
  amount: number;
  type: "earning" | "deduction";
  enabled?: boolean;
};

export type HolidayOverride = {
  id: string;
  date: string;
  title: string;
  kind: "company" | "emergency" | "manual";
  isHoliday: boolean;
  multiplier?: number;
};

export type Tab = "today" | "month" | "clients" | "projects" | "invoices" | "reports" | "leave" | "settings";

export type BreakItem = {
  id: string;
  start: string;
  end: string;
  title: string;
  paid?: boolean;
  startedAt?: string;
  endedAt?: string;
};

export type WorkRecord = {
  date: string;
  start: string;
  end: string;
  startedAt?: string;
  endedAt?: string;
  lunchMinutes: number;
  lunchStart?: string;
  lunchEnd?: string;
  lunchStartedAt?: string;
  lunchEndedAt?: string;
  lunchPaid?: boolean;
  breaks: BreakItem[];
  leaveMinutes: number;
  leaveType: "none" | "hourly" | "full";
  note: string;
  holiday: boolean;
  updatedAt?: string;
  manuallyEdited?: boolean;
};

export type Settings = {
  name: string;
  onboarded: boolean;
  weeklyMinutes: number;
  workDays: number;
  weeklySchedule: Record<WeekdayKey, WorkScheduleDay>;
  defaultStart: string;
  defaultEnd: string;
  lunchMinutes: number;
  leaveBalanceMinutes: number;
  monthlyLeaveMinutes: number;
  salary: number;
  overtimeMultiplier: number;
  holidayMultiplier: number;
  payrollComponents: PayrollComponent[];
  autoOfficialHolidays: boolean;
  autoWeeklyHoliday: boolean;
  mode: Mode;
};

export type LeaveEntry = {
  id: string;
  startDate: string;
  endDate: string;
  type: "full" | "half" | "hourly";
  minutes: number;
  note: string;
  createdAt: string;
};

export type Client = {
  id: string;
  name: string;
  color: string;
  email?: string;
  note?: string;
  archived: boolean;
};

export type Project = {
  id: string;
  clientId: string;
  name: string;
  rate: number;
  color: string;
  status: "active" | "paused" | "completed" | "archived";
  budgetHours?: number;
  note?: string;
  billable?: boolean;
};

export type ExpenseCategory = "software" | "contractor" | "travel" | "equipment" | "other";

export type Expense = {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  note?: string;
  createdAt: string;
};


export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type InvoiceLine = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  number: string;
  clientId: string;
  projectId?: string;
  issuedAt: string;
  dueAt?: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  discount: number;
  taxPercent: number;
  note: string;
  createdAt: string;
  paidAt?: string;
};

export type TimeEntry = {
  id: string;
  clientId: string;
  projectId: string;
  task?: string;
  startedAt: string;
  endedAt: string | null;
  note: string;
  billable: boolean;
  effectiveRate: number;
};

export type AppData = {
  settings: Settings;
  records: Record<string, WorkRecord>;
  leaves: LeaveEntry[];
  clients: Client[];
  projects: Project[];
  timeEntries: TimeEntry[];
  expenses: Expense[];
  invoices: Invoice[];
  holidayOverrides: HolidayOverride[];
};

export type TimerDraft = {
  projectId: string;
  task: string;
  note: string;
  billable: boolean;
};

export type ClientDraft = { name: string; email: string; note: string };
export type ProjectDraft = { name: string; clientId: string; rate: number; budgetHours: number; note: string };
export type ReportFilter = { clientId: string; projectId: string; billable: string; query: string };
export type StorageInfo = { usage: number; quota: number; persisted: boolean };
