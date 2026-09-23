import type { Metadata } from "next";
import Link from "next/link";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Check your email",
};

type CheckEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const { email } = await searchParams;

  return (
    <AuthPageShell imageSrc="/signup.png">
      <div className="flex w-full max-w-[360px] flex-col">
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-zinc-900">
          Check your email
        </h1>
        <p className="mt-3 text-[15px] text-zinc-500">
          We sent a confirmation link
          {email ? (
            <>
              {" "}
              to <span className="font-medium text-zinc-800">{email}</span>
            </>
          ) : null}
          . Open it to activate your account and sign in.
        </p>
        <p className="mt-8 text-center text-[15px] text-zinc-700">
          Already confirmed?{" "}
          <Link
            href={routes.login}
            className="font-medium text-brand underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthPageShell>
  );
}
