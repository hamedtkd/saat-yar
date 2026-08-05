import type { ExpenseCategory } from "@/lib/types";

export const expenseCategories: Array<{ value: ExpenseCategory; label: string }> = [
  { value: "software", label: "نرم‌افزار و اشتراک" },
  { value: "contractor", label: "همکار و پیمانکار" },
  { value: "travel", label: "رفت‌وآمد" },
  { value: "equipment", label: "تجهیزات" },
  { value: "other", label: "سایر" },
];
