"use client";

import { parseISO } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AccountSettings } from "@/components/account/account-settings";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/ui/query-state";
import { routes } from "@/constants/routes";
import { useCurrentUser, useLogout } from "@/features/auth";
import { LogoutIcon, OrdersIcon, PackageIcon } from "@/icons";
import { formatDate } from "@/lib/utils/format";
import { calculateAge } from "@/schemas/account.schema";

export function AccountProfile() {
  const router = useRouter();
  const logout = useLogout();
  const { data: user, isLoading, isError, error } = useCurrentUser();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } finally {
      router.replace(routes.login);
    }
  };

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error} isEmpty={!user}>
      {user ? (
        <div className="mx-auto w-full max-w-lg space-y-8">
          <div className="rounded-2xl border border-brand-muted bg-brand-soft/60 px-5 py-6 sm:px-6">
            <p className="text-xs font-medium tracking-[0.14em] text-brand uppercase">
              Profile
            </p>
            <h2 className="mt-2 font-fraunces text-2xl font-semibold tracking-tight text-zinc-900">
              {user.fullName}
            </h2>
            <p className="mt-1 text-[15px] text-zinc-600">{user.email}</p>

            <dl className="mt-6 space-y-3 border-t border-brand-muted/80 pt-5 text-[15px]">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-zinc-500">Date of birth</dt>
                <dd className="font-medium text-zinc-900">
                  {formatDate(user.dateOfBirth)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-zinc-500">Age</dt>
                <dd className="font-medium text-zinc-900">
                  {calculateAge(parseISO(user.dateOfBirth))}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-zinc-500">Member since</dt>
                <dd className="font-medium text-zinc-900">
                  {formatDate(user.createdAt)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-zinc-500">Role</dt>
                <dd className="font-medium capitalize text-zinc-900">{user.role}</dd>
              </div>
            </dl>
          </div>

          <AccountSettings user={user} />

          <nav className="space-y-2" aria-label="Account links">
            <Link
              href={routes.orders}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-[15px] font-medium text-zinc-900 transition-colors hover:border-brand-muted hover:bg-brand-soft/40"
            >
              <OrdersIcon className="size-[18px] text-brand" />
              My orders
            </Link>

            {user.role === "admin" ? (
              <Link
                href={routes.admin.root}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-[15px] font-medium text-zinc-900 transition-colors hover:border-brand-muted hover:bg-brand-soft/40"
              >
                <PackageIcon className="size-[18px] text-brand" />
                Admin panel
              </Link>
            ) : null}
          </nav>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full gap-2 rounded-xl"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            <LogoutIcon className="size-[18px] text-brand" />
            {logout.isPending ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      ) : null}
    </QueryState>
  );
}
