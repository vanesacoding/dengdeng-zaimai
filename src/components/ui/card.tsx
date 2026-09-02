import * as React from "react";
import { cn } from "@/lib/utils";
export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_8px_30px_rgba(44,62,49,.06)]", className)} {...p} />; }
