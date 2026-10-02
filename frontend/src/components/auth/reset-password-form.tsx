"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { useResetPassword } from "@/features/auth";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/schemas/auth.schema";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const resetPassword = useResetPassword();
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;
    try {
      const result = await resetPassword.mutateAsync({
        token,
        password: values.password,
      });
      setDoneMessage(result.message);
      setTimeout(() => router.push(routes.login), 1500);
    } catch {
      // Error rendered below.
    }
  });

  if (!token) {
    return (
      <div className="flex w-full max-w-[360px] flex-col">
        <h1 className="text-[2rem] font-bold tracking-tight text-zinc-900">
          Invalid reset link
        </h1>
        <p className="mt-2 text-[15px] text-zinc-500">
          This password reset link is missing or invalid.
        </p>
        <Link
          href={routes.forgotPassword}
          className="mt-6 font-medium text-brand underline underline-offset-2"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-[360px] flex-col">
      <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-zinc-900">
        Set new password
      </h1>
      <p className="mt-2 text-[15px] text-zinc-500">
        Choose a new password for your account.
      </p>

      <div className="mt-8 space-y-4">
        <div>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="New password"
            aria-invalid={Boolean(errors.password)}
            className={cn(
              "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-[15px] text-zinc-900 outline-none",
              "focus:border-brand focus:ring-1 focus:ring-brand",
              errors.password && "border-red-500",
            )}
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
          ) : null}
        </div>
        <div>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Confirm password"
            aria-invalid={Boolean(errors.confirmPassword)}
            className={cn(
              "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-[15px] text-zinc-900 outline-none",
              "focus:border-brand focus:ring-1 focus:ring-brand",
              errors.confirmPassword && "border-red-500",
            )}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
      </div>

      {resetPassword.isError ? (
        <p className="mt-3 text-sm text-red-600">
          {getErrorMessage(resetPassword.error, "Unable to reset password.")}
        </p>
      ) : null}

      {doneMessage ? (
        <p className="mt-3 text-sm text-emerald-700">{doneMessage}</p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        isLoading={resetPassword.isPending}
        className="mt-6 h-12 w-full rounded-xl text-[15px] font-semibold"
      >
        Update password
      </Button>
    </form>
  );
}
