import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Enter a valid date of birth",
  }),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type RegisterApiPayload = {
  fullName: string;
  email: string;
  password: string;
  dateOfBirth: string;
};

export function toRegisterApiPayload(input: RegisterInput): RegisterApiPayload {
  return {
    fullName: input.fullName.trim(),
    email: input.email,
    password: input.password,
    dateOfBirth: input.dateOfBirth.toISOString().slice(0, 10),
  };
}
