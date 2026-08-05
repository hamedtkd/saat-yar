"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/cn";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger dir="rtl" ref={ref} className={cn(
    "group relative flex h-11 w-full min-w-0 items-center justify-start gap-2 overflow-hidden rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] py-2 pr-3 pl-10 text-right text-xs font-medium text-[var(--text)] outline-none transition-[border-color,box-shadow,background-color]",
    "hover:border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] hover:bg-[var(--surface-1)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] data-[placeholder]:text-[var(--text-muted)] data-[state=open]:border-[var(--accent)] data-[state=open]:ring-4 data-[state=open]:ring-[var(--accent-soft)] disabled:pointer-events-none disabled:opacity-50 [&>span]:min-w-0 [&>span]:truncate",
    className,
  )} {...props}>{children}<SelectPrimitive.Icon asChild><ChevronDown aria-hidden="true" className="pointer-events-none absolute left-3 size-4 shrink-0 text-[var(--text-muted)] transition-transform group-data-[state=open]:rotate-180" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<React.ElementRef<typeof SelectPrimitive.ScrollUpButton>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton ref={ref} className={cn("sticky top-0 z-10 flex h-7 cursor-default items-center justify-center bg-[var(--surface-1)] text-[var(--text-muted)]", className)} {...props}><ChevronUp className="size-4" /></SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<React.ElementRef<typeof SelectPrimitive.ScrollDownButton>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton ref={ref} className={cn("sticky bottom-0 z-10 flex h-7 cursor-default items-center justify-center bg-[var(--surface-1)] text-[var(--text-muted)]", className)} {...props}><ChevronDown className="size-4" /></SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(({ className, children, position = "popper", sideOffset = 7, align = "start", collisionPadding = 12, ...props }, ref) => (
  <SelectPrimitive.Portal><SelectPrimitive.Content ref={ref} dir="rtl" position={position} sideOffset={sideOffset} align={align} collisionPadding={collisionPadding} className={cn(
    "relative z-[1000] max-h-[min(18rem,var(--radix-select-content-available-height))] min-w-[8rem] overflow-hidden rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text)] shadow-[0_22px_70px_rgba(0,0,0,.22)] outline-none data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
    position === "popper" && "w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]", className,
  )} {...props}><SelectScrollUpButton /><SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]")}>{children}</SelectPrimitive.Viewport><SelectScrollDownButton /></SelectPrimitive.Content></SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Label>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>>(({ className, ...props }, ref) => <SelectPrimitive.Label ref={ref} className={cn("px-3 py-2 text-[11px] font-bold text-[var(--text-muted)]", className)} {...props} />);
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item ref={ref} className={cn(
    "relative flex min-h-10 w-full cursor-default select-none items-center rounded-lg py-2 pr-9 pl-3 text-right text-xs outline-none transition-colors focus:bg-[var(--accent-soft)] focus:text-[var(--accent-strong)] data-[highlighted]:bg-[var(--accent-soft)] data-[highlighted]:text-[var(--accent-strong)] data-[state=checked]:bg-[var(--accent-soft)] data-[state=checked]:font-bold data-[state=checked]:text-[var(--accent-strong)] data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
    className,
  )} {...props}><span className="absolute right-3 flex size-4 items-center justify-center text-[var(--accent-strong)]"><SelectPrimitive.ItemIndicator><Check className="size-4 stroke-[2.4]" /></SelectPrimitive.ItemIndicator></span><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>>(({ className, ...props }, ref) => <SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-[var(--border)]", className)} {...props} />);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue };
