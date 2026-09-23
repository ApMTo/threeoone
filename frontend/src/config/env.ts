import { z } from "zod";

/**
 * Public client-side environment variables only.
 * Never put backend secrets here or prefix them with NEXT_PUBLIC_.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Three-O-One"),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "Three-O-One",
});

if (!parsed.success) {
  console.error("Invalid public environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error(
    "Invalid public environment variables. Copy `.env.example` to `.env.local` and fill required values.",
  );
}

export const env = parsed.data;
