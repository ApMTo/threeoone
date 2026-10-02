"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DayPicker } from "react-day-picker";
import { Controller, useForm, type UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useChangePassword, useUpdateProfile } from "@/features/account";
import type { User } from "@/entities/user";
import { CalendarIcon, EyeIcon, EyeOffIcon } from "@/icons";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";
import {
  calculateAge,
  changePasswordSchema,
  splitFullName,
  updateProfileSchema,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from "@/schemas/account.schema";

import "react-day-picker/style.css";

const fieldClassName =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-[15px] text-zinc-900 outline-none transition-colors placeholder:text-transparent focus:border-brand focus:ring-1 focus:ring-brand";

type AccountSettingsProps = {
  user: User;
};

export function AccountSettings({ user }: AccountSettingsProps) {
  return (
    <div className="space-y-6">
      <ProfileSettingsForm user={user} />
      <PasswordSettingsForm />
    </div>
  );
}

function ProfileSettingsForm({ user }: AccountSettingsProps) {
  const updateProfile = useUpdateProfile();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const { firstName, lastName } = splitFullName(user.fullName);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName,
      lastName,
      dateOfBirth: parseISO(user.dateOfBirth),
    },
  });

  const dateOfBirth = watch("dateOfBirth");
  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;

  useEffect(() => {
    const next = splitFullName(user.fullName);
    reset({
      firstName: next.firstName,
      lastName: next.lastName,
      dateOfBirth: parseISO(user.dateOfBirth),
    });
  }, [user.fullName, user.dateOfBirth, reset]);

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
    setSuccessMessage(null);
    try {
      await updateProfile.mutateAsync(values);
      setSuccessMessage("Profile updated.");
    } catch {
      // Error rendered from mutation.
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-zinc-200 bg-white px-5 py-6 sm:px-6"
    >
      <div>
        <h3 className="font-fraunces text-xl font-semibold tracking-tight text-zinc-900">
          Profile settings
        </h3>
        <p className="mt-1 text-[15px] text-zinc-500">
          Update your name and date of birth.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="First name"
              aria-invalid={Boolean(errors.firstName)}
              className={cn(
                fieldClassName,
                "peer",
                errors.firstName && "border-red-500 focus:border-red-500 focus:ring-red-500",
              )}
              {...register("firstName")}
            />
            <label
              htmlFor="firstName"
              className="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-zinc-500 peer-focus:text-brand"
            >
              First name
            </label>
            {errors.firstName ? (
              <p className="mt-1.5 text-xs text-red-600">{errors.firstName.message}</p>
            ) : null}
          </div>

          <div className="relative">
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Last name"
              aria-invalid={Boolean(errors.lastName)}
              className={cn(
                fieldClassName,
                "peer",
                errors.lastName && "border-red-500 focus:border-red-500 focus:ring-red-500",
              )}
              {...register("lastName")}
            />
            <label
              htmlFor="lastName"
              className="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-zinc-500 peer-focus:text-brand"
            >
              Last name
            </label>
            {errors.lastName ? (
              <p className="mt-1.5 text-xs text-red-600">{errors.lastName.message}</p>
            ) : null}
          </div>
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
                  {field.value ? format(field.value, "d MMMM yyyy") : "Date of birth"}
                </span>
              </button>
              <label
                htmlFor="dateOfBirth"
                className={cn(
                  "pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-zinc-500",
                  isCalendarOpen && "text-brand",
                )}
              >
                Date of birth
              </label>

              {isCalendarOpen ? (
                <div className="absolute top-[calc(100%+8px)] left-0 z-20 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg">
                  <DayPicker
                    mode="single"
                    captionLayout="dropdown"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(date);
                      }
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
                  />
                </div>
              ) : null}

              {errors.dateOfBirth ? (
                <p className="mt-1.5 text-xs text-red-600">{errors.dateOfBirth.message}</p>
              ) : null}
            </div>
          )}
        />

        {age !== null && age >= 0 ? (
          <p className="text-sm text-zinc-500">Age: {age}</p>
        ) : null}
      </div>

      {updateProfile.isError ? (
        <p className="mt-3 text-sm text-red-600">
          {getErrorMessage(updateProfile.error, "Something went wrong.")}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-3 text-sm text-emerald-700">{successMessage}</p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        isLoading={updateProfile.isPending}
        disabled={!isDirty}
        className="mt-6 h-11 w-full rounded-xl text-[15px] font-semibold sm:w-auto sm:px-8"
      >
        Save profile
      </Button>
    </form>
  );
}

function PasswordSettingsForm() {
  const changePassword = useChangePassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSuccessMessage(null);
    try {
      await changePassword.mutateAsync(values);
      reset();
      setSuccessMessage("Password updated.");
    } catch {
      // Error rendered from mutation.
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-zinc-200 bg-white px-5 py-6 sm:px-6"
    >
      <div>
        <h3 className="font-fraunces text-xl font-semibold tracking-tight text-zinc-900">
          Change password
        </h3>
        <p className="mt-1 text-[15px] text-zinc-500">
          Use a strong password you do not reuse elsewhere.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <PasswordField
          id="currentPassword"
          label="Current password"
          autoComplete="current-password"
          show={showCurrent}
          onToggle={() => setShowCurrent((value) => !value)}
          error={errors.currentPassword?.message}
          registration={register("currentPassword")}
        />
        <PasswordField
          id="newPassword"
          label="New password"
          autoComplete="new-password"
          show={showNew}
          onToggle={() => setShowNew((value) => !value)}
          error={errors.newPassword?.message}
          registration={register("newPassword")}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          show={showConfirm}
          onToggle={() => setShowConfirm((value) => !value)}
          error={errors.confirmPassword?.message}
          registration={register("confirmPassword")}
        />
      </div>

      {changePassword.isError ? (
        <p className="mt-3 text-sm text-red-600">
          {getErrorMessage(changePassword.error, "Something went wrong.")}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-3 text-sm text-emerald-700">{successMessage}</p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        isLoading={changePassword.isPending}
        className="mt-6 h-11 w-full rounded-xl text-[15px] font-semibold sm:w-auto sm:px-8"
      >
        Update password
      </Button>
    </form>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  autoComplete: string;
  show: boolean;
  onToggle: () => void;
  error?: string;
  registration: UseFormRegisterReturn;
};

function PasswordField({
  id,
  label,
  autoComplete,
  show,
  onToggle,
  error,
  registration,
}: PasswordFieldProps) {
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={label}
        aria-label={label}
        aria-invalid={Boolean(error)}
        className={cn(
          fieldClassName,
          "peer pr-12",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
        )}
        {...registration}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-zinc-500 peer-focus:text-brand"
      >
        {label}
      </label>
      <button
        type="button"
        onClick={onToggle}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeIcon /> : <EyeOffIcon />}
      </button>
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
