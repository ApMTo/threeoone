"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { useLogin } from "@/features/auth";
import { EyeIcon, EyeOffIcon, GoogleIcon } from "@/icons";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";

function resolvePostLoginPath(role: string, next: string | null): string {
  if (role === "admin") {
    if (next?.startsWith("/admin")) {
      return next;
    }
    return routes.admin.root;
  }

  if (next && !next.startsWith("/admin")) {
    return next;
  }

  return routes.account;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await login.mutateAsync(values);
      router.push(resolvePostLoginPath(result.user.role, searchParams.get("next")));
    } catch {
      // Error state is rendered from login.isError.
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-[360px] flex-col">
      <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-zinc-900">
        Sign in
      </h1>
      <p className="mt-2 text-[15px] text-zinc-500">
        Please login to continue to your account.
      </p>

      <div className="mt-8 space-y-4">
        <div className="relative">
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="jonas_kahnwald@gmail.com"
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

        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Password"
            aria-label="Password"
            aria-invalid={Boolean(errors.password)}
            className={cn(
              "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 pr-12 text-[15px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400",
              "focus:border-brand focus:ring-1 focus:ring-brand",
              errors.password &&
                "border-red-500 focus:border-red-500 focus:ring-red-500",
            )}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeIcon /> : <EyeOffIcon />}
          </button>
          {errors.password ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end">
          <Link
            href={routes.forgotPassword}
            className="text-sm font-medium text-brand underline-offset-2 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-[15px] text-zinc-800">
        <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
          <input
            type="checkbox"
            checked={keepLoggedIn}
            onChange={(event) => setKeepLoggedIn(event.target.checked)}
            className="peer absolute inset-0 cursor-pointer opacity-0"
          />
          <span className="pointer-events-none size-4 rounded border border-zinc-300 bg-white peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40" />
          <svg
            viewBox="0 0 12 12"
            className="pointer-events-none absolute size-2.5 text-white opacity-0 peer-checked:opacity-100"
            aria-hidden
          >
            <path
              d="M2 6.2 4.6 9 10 3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        Keep me logged in
      </label>

      {login.isError ? (
        <p className="mt-3 text-sm text-red-600">
          {getErrorMessage(
            login.error,
            "Unable to sign in. Check your credentials and try again.",
          )}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        isLoading={login.isPending}
        className="mt-6 h-12 w-full rounded-xl text-[15px] font-semibold"
      >
        Sign in
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-zinc-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-zinc-400">or</span>
        </div>
      </div>

      <button
        type="button"
        className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-300 bg-white text-[15px] font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
      >
        <GoogleIcon />
        Sign in with Google
      </button>

      <p className="mt-8 text-center text-[15px] text-zinc-700">
        Need an account?{" "}
        <Link
          href={routes.register}
          className="font-medium text-brand underline underline-offset-2"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
