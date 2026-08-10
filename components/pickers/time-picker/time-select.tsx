import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatLocaleDigits } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/locales";

export function TimeSelect({ locale, label, value, options, onChange }: { locale: Locale; label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="h-11 justify-center text-xl font-extrabold tabular-nums">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((item) => (
          <SelectItem key={item} value={item} className="tabular-nums">
            {formatLocaleDigits(locale, item)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
