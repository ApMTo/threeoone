import { env } from "@/config/env";

export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  description: "Modern e-commerce storefront",
  url: env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
