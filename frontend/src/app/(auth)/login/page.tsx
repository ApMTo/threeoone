import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthPageShell imageSrc="/product2.png">
      <Suspense fallback={<Spinner label="Loading…" />}>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
