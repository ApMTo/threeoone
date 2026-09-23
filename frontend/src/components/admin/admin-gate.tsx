"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/constants/routes";
import { useCurrentUser } from "@/features/auth";
import { authCookies } from "@/lib/auth/cookies";
import { tokenStorage } from "@/lib/auth/token";

type AdminGateProps = {
  children: ReactNode;
};

export function AdminGate({ children }: AdminGateProps) {
  const router = useRouter();
  const hasAccessToken = Boolean(tokenStorage.getAccessToken());
  const hasCookieSession = authCookies.hasRefreshCredentials();
  const canCheckAuth = hasAccessToken || hasCookieSession;
  const { data: user, isLoading, isError } = useCurrentUser(canCheckAuth);

  useEffect(() => {
    if (!canCheckAuth) {
      router.replace(`${routes.login}?next=${encodeURIComponent(routes.admin.root)}`);
      return;
    }

    if (isLoading) {
      return;
    }

    if (isError || !user) {
      router.replace(`${routes.login}?next=${encodeURIComponent(routes.admin.root)}`);
      return;
    }

    if (user.role !== "admin") {
      router.replace(routes.home);
    }
  }, [canCheckAuth, isError, isLoading, router, user]);

  if (!canCheckAuth || isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-admin-surface">
        <Spinner label="Loading admin…" />
      </div>
    );
  }

  if (isError || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-admin-surface">
        <Spinner label="Redirecting…" />
      </div>
    );
  }

  return <>{children}</>;
}
