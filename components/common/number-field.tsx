import { Input } from "@/components/ui/input";

export function NumberField({ value, onValueChange, min = 0 }: {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
}) {
  return (
    <Input
      type="number"
      min={min}
      value={Number.isFinite(value) ? value : 0}
      onChange={(event) => onValueChange(Math.max(min, Number(event.target.value) || 0))}
    />
  );
}
