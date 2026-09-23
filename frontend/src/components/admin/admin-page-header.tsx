import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 border-b border-brand-muted/80 pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        <h1 className="font-fraunces text-3xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[15px] text-zinc-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
