import type { AppData, ExpenseCategory, Project, TimeEntry } from "@/lib/types";

export type ProjectDetailProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  project: Project;
  activeEntry?: TimeEntry;
  onBack: () => void;
  onToggleTimer: (id?: string) => void;
  financialsHidden: boolean;
};

export type ExpenseDraft = {
  title: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  note: string;
};
