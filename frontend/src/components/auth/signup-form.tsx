"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DayPicker } from "react-day-picker";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { useRegister } from "@/features/auth";
import { CalendarIcon, EyeIcon, EyeOffIcon, GoogleIcon } from "@/icons";
import { cn } from "@/lib/utils/cn";
import { registerSchema, type RegisterInput } from "@/schemas/auth.schema";

import "react-day-picker/style.css";

const fieldClassName =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-[15px] text-zinc-900 outline-none transition-colors placeholder:text-transparent focus:border-brand focus:ring-1 focus:ring-brand";

export function SignupForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!isCalendarOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!calendarRef.current?.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isCalendarOpen]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await registerMutation.mutateAsync(values);
      router.push(`${routes.checkEmail}?email=${encodeURIComponent(result.email)}`);
    } catch {
      // Error state is rendered from registerMutation.isError.
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-[360px] flex-col">
      <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-zinc-900">
        Sign up
      </h1>
      <p className="mt-2 text-[15px] text-zinc-500">
        Sign up to enjoy the feature of {siteConfig.name}
      </p>

      <div className="mt-8 space-y-4">
        <div className="relative">
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Full Name"
            aria-invalid={Boolean(errors.fullName)}
            className={cn(
              fieldClassName,
              "peer",
              errors.fullName && "border-red-500 focus:border-red-500 focus:ring-red-500",
            )}
            {...register("fullName")}
          />
          <label
            htmlFor="fullName"
            className="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-zinc-500 peer-focus:text-brand"
          >
            Full Name
          </label>
          {errors.fullName ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.fullName.message}</p>
          ) : null}
        </div>

        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field }) => (
            <div className="relative" ref={calendarRef}>
              <button
                id="dateOfBirth"
                type="button"
                onClick={() => setIsCalendarOpen((open) => !open)}
                aria-invalid={Boolean(errors.dateOfBirth)}
                aria-expanded={isCalendarOpen}
                className={cn(
                  fieldClassName,
                  "flex items-center gap-3 text-left",
                  !field.value && "text-zinc-400",
                  isCalendarOpen && "border-brand ring-1 ring-brand",
                  errors.dateOfBirth &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500",
                )}
              >
                <CalendarIcon className="shrink-0 text-zinc-500" />
                <span>
                  {field.value ? format(field.value, "d MMMM yyyy") : "Date of Birth"}
                </span>
              </button>
              <label
                htmlFor="dateOfBirth"
                className={cn(
                  "pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-zinc-500",
                  isCalendarOpen && "text-brand",
                )}
              >
                Date of Birth
              </label>

              {isCalendarOpen ? (
                <div className="absolute top-[calc(100%+8px)] left-0 z-20 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg">
                  <DayPicker
                    mode="single"
                    captionLayout="dropdown"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setIsCalendarOpen(false);
                    }}
                    disabled={{ after: new Date() }}
                    startMonth={new Date(1920, 0)}
                    endMonth={new Date()}
                    defaultMonth={field.value ?? new Date(2000, 0)}
                    style={
                      {
                        "--rdp-accent-color": "#8D643D",
                        "--rdp-accent-background-color": "#F3EBE3",
                      } as CSSProperties
                    }
                  />                </div>
              ) : null}

              {errors.dateOfBirth ? (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.dateOfBirth.message}
                </p>
              ) : null}
            </div>
          )}
        />

        <div className="relative">
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            aria-invalid={Boolean(errors.email)}
            className={cn(
              fieldClassName,
              "peer",
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
            autoComplete="new-password"
            placeholder="Password"
            aria-label="Password"
            aria-invalid={Boolean(errors.password)}
            className={cn(
              fieldClassName,
              "peer pr-12",
              errors.password &&
                "border-red-500 focus:border-red-500 focus:ring-red-500",
            )}
            {...register("password")}
          />
          <label
            htmlFor="password"
            className="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-zinc-500 peer-focus:text-brand"
          >
            Password
          </label>
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
      </div>

      {registerMutation.isError ? (
        <p className="mt-3 text-sm text-red-600">
          Unable to create account. Please try again.
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        isLoading={registerMutation.isPending}
        className="mt-6 h-12 w-full rounded-xl text-[15px] font-semibold"
      >
        Sign Up
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
        Continue with Google
      </button>

      <p className="mt-8 text-center text-[15px] text-zinc-700">
        Already have an account??{" "}
        <Link
          href={routes.login}
          className="font-medium text-brand underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
