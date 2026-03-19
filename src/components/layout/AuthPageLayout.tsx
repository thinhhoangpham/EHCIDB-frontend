"use client";

import { Card } from "@/components/ui/Card";

interface AuthPageLayoutProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthPageLayout({ title, children, footer }: AuthPageLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          {title}
        </h1>
        {children}
        {footer && (
          <p className="mt-6 text-center text-sm text-gray-600">{footer}</p>
        )}
      </Card>
    </div>
  );
}
