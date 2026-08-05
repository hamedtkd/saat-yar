import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { faDigits } from "@/lib/format";

export function TimeSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="h-11 justify-center text-xl font-extrabold tabular-nums">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((item) => (
          <SelectItem key={item} value={item} className="tabular-nums">
            {faDigits(item)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
