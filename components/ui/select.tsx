"use client";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return <SelectPrimitive.Trigger className={cn("select-trigger", className)} {...props}>{children}<SelectPrimitive.Icon asChild><ChevronDown className="select-chevron" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>;
}
function SelectContent({ className, children, position = "popper", ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content className={cn("select-content", className)} position={position} sideOffset={6} {...props}><SelectPrimitive.ScrollUpButton className="select-scroll"><ChevronUp /></SelectPrimitive.ScrollUpButton><SelectPrimitive.Viewport className="select-viewport">{children}</SelectPrimitive.Viewport><SelectPrimitive.ScrollDownButton className="select-scroll"><ChevronDown /></SelectPrimitive.ScrollDownButton></SelectPrimitive.Content></SelectPrimitive.Portal>;
}
function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return <SelectPrimitive.Item className={cn("select-item", className)} {...props}><span className="select-item-indicator"><SelectPrimitive.ItemIndicator><Check /></SelectPrimitive.ItemIndicator></span><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>;
}
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
