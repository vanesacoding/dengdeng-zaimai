import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const variants = cva("inline-flex min-h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sage)] disabled:pointer-events-none disabled:opacity-50", {
  variants: { variant: {
    default: "bg-[var(--forest)] text-white shadow-sm hover:bg-[var(--forest-deep)]",
    secondary: "bg-[var(--sage-soft)] text-[var(--forest-deep)] hover:bg-[#dce9db]",
    outline: "border border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--cream)]",
    ghost: "text-[var(--muted)] hover:bg-[var(--cream)] hover:text-[var(--ink)]",
    danger: "bg-[#fce8e3] text-[#9d3b2b] hover:bg-[#f7d7cf]"
  }, size: { default: "h-11", sm: "h-9 px-3", icon: "size-11 p-0" } },
  defaultVariants: { variant: "default", size: "default" }
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof variants> { asChild?: boolean }
export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(variants({ variant, size }), className)} {...props} />;
}
