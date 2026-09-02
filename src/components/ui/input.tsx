import * as React from "react";
import { cn } from "@/lib/utils";
export function Input({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) { return <input className={cn("min-h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 text-base outline-none placeholder:text-[#9a9b93] focus:border-[var(--sage)] focus:ring-2 focus:ring-[var(--sage-soft)]", className)} {...p} />; }
export function Textarea({ className, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={cn("min-h-28 w-full resize-none rounded-2xl border border-[var(--line)] bg-white p-4 text-base outline-none placeholder:text-[#9a9b93] focus:border-[var(--sage)] focus:ring-2 focus:ring-[var(--sage-soft)]", className)} {...p} />; }
