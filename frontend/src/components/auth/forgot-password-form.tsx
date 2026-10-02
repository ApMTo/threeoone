"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { useForgotPassword } from "@/features/auth";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/schemas/auth.schema";

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await forgotPassword.mutateAsync(values.email);
      setSentMessage(result.message);
    } catch {
      // Error rendered below.
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-[360px] flex-col">
      <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-zinc-900">
        Forgot password
      </h1>
      <p className="mt-2 text-[15px] text-zinc-500">
        Enter your email and we will send a reset link if an account exists.
      </p>

      <div className="relative mt-8">
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          className={cn(
            "peer w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-[15px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400",
            "focus:border-brand focus:ring-1 focus:ring-brand",
            errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500",
          )}
          {...register("email")}
        />
        <label
          htmlFor="email"
          className="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-zinc-500 peer-focus:text-brand"
        >
          Email
        </label>
        {errors.email ? (
          <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
        ) : null}
      </div>

      {forgotPassword.isError ? (
        <p className="mt-3 text-sm text-red-600">
          {getErrorMessage(forgotPassword.error, "Unable to send reset email.")}
        </p>
      ) : null}

      {sentMessage ? (
        <p className="mt-3 text-sm text-emerald-700">{sentMessage}</p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        isLoading={forgotPassword.isPending}
        className="mt-6 h-12 w-full rounded-xl text-[15px] font-semibold"
      >
        Send reset link
      </Button>

      <p className="mt-8 text-center text-[15px] text-zinc-700">
        <Link
          href={routes.login}
          className="font-medium text-brand underline underline-offset-2"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
