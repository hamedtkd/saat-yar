import type { BusinessMessageKey } from "@/lib/i18n/business";
import type { ExpenseCategory } from "@/lib/types";

export const expenseCategories: Array<{ value: ExpenseCategory; messageKey: BusinessMessageKey }> = [
  { value: "software", messageKey: "expenses.category.software" },
  { value: "contractor", messageKey: "expenses.category.contractor" },
  { value: "travel", messageKey: "expenses.category.travel" },
  { value: "equipment", messageKey: "expenses.category.equipment" },
  { value: "other", messageKey: "expenses.category.other" },
];
