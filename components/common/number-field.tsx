import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";

type NumberFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> & {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
};

export function NumberField({ value, onValueChange, min = 0, ...props }: NumberFieldProps) {
  return (
    <Input
      {...props}
      type="number"
      min={min}
      value={Number.isFinite(value) ? value : 0}
      onChange={(event) => onValueChange(Math.max(min, Number(event.target.value) || 0))}
    />
  );
}
