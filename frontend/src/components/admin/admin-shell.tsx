import type { ReactNode } from "react";

import { AdminGate } from "@/components/admin/admin-gate";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <AdminGate>
      <div className="flex min-h-dvh flex-col bg-admin-surface lg:flex-row">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </div>
      </div>
    </AdminGate>
  );
}
