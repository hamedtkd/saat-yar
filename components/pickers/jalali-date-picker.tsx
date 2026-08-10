"use client";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { DatePickerDialog } from "./jalali-date-picker/date-picker-dialog";
import { DatePickerTrigger } from "./jalali-date-picker/date-picker-trigger";
import type { JalaliDatePickerProps } from "./jalali-date-picker/types";
import { useJalaliDatePicker } from "./jalali-date-picker/use-jalali-date-picker";

export function JalaliDatePicker({
  value,
  onChange,
  recordedDates = [],
  mode = "employee",
  includeOfficialHolidays = true,
  includeWeeklyHoliday = true,
  holidayOverrides = [],
  weeklySchedule,
  placeholder,
}: JalaliDatePickerProps) {
  const { locale, t } = useLocaleUi();
  const localizedPlaceholder = placeholder ?? t("picker.date.placeholder");
  const picker = useJalaliDatePicker({
    value,
    onChange,
    recordedDates,
    placeholder: localizedPlaceholder,
    locale,
  });

  return (
    <div className="relative min-w-0 w-full">
      <DatePickerTrigger
        open={picker.open}
        placeholder={localizedPlaceholder}
        selectedLabel={picker.selectedLabel}
        onOpen={picker.openPicker}
      />
      {picker.open && (
        <DatePickerDialog
          locale={locale}
          title={picker.title}
          cells={picker.cells}
          value={value}
          today={picker.today}
          recorded={picker.recorded}
          holidayOptions={{
            mode,
            includeOfficialHolidays,
            includeWeeklyHoliday,
            holidayOverrides,
            weeklySchedule,
          }}
          onClose={picker.closePicker}
          onPreviousMonth={picker.showPreviousMonth}
          onNextMonth={picker.showNextMonth}
          onSelect={picker.selectDate}
          onSelectToday={picker.selectToday}
        />
      )}
    </div>
  );
}
