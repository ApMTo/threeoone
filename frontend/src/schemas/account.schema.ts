import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(60),
  lastName: z.string().min(1, "Last name is required").max(60),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Enter a valid date of birth",
  }),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: "New password must be different",
    path: ["newPassword"],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type UpdateProfileApiPayload = {
  fullName: string;
  dateOfBirth: string;
};

export type ChangePasswordApiPayload = {
  currentPassword: string;
  newPassword: string;
};

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "";
  if (parts.length <= 1) {
    return { firstName, lastName: "" };
  }
  return { firstName, lastName: parts.slice(1).join(" ") };
}

export function toUpdateProfileApiPayload(input: UpdateProfileInput): UpdateProfileApiPayload {
  return {
    fullName: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),
    dateOfBirth: input.dateOfBirth.toISOString().slice(0, 10),
  };
}

export function toChangePasswordApiPayload(
  input: ChangePasswordInput,
): ChangePasswordApiPayload {
  return {
    currentPassword: input.currentPassword,
    newPassword: input.newPassword,
  };
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age -= 1;
  }
  return age;
}
