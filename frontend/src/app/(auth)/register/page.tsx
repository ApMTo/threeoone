import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function RegisterPage() {
  return (
    <AuthPageShell imageSrc="/signup.png">
      <SignupForm />
    </AuthPageShell>
  );
}
