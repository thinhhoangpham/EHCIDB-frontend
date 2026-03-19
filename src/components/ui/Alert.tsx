"use client";

import { cn } from "@/lib/utils";

type AlertVariant = "success" | "error" | "warning";

interface AlertProps {
  variant: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  success: "text-green-600",
  error: "text-red-600",
  warning: "text-yellow-600",
};

export function Alert({ variant, children, className }: AlertProps) {
  return (
    <p className={cn("text-center text-sm", variantStyles[variant], className)}>
      {children}
    </p>
  );
}
