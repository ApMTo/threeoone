"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { routes } from "@/constants/routes";
import { useConfirmEmail } from "@/features/auth";
import { getErrorMessage } from "@/lib/api/errors";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const confirmEmail = useConfirmEmail();
  const startedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || startedRef.current) {
      return;
    }

    startedRef.current = true;

    void (async () => {
      try {
        await confirmEmail.mutateAsync(token);
        router.replace(routes.account);
      } catch (err) {
        setError(getErrorMessage(err, "Confirmation link is invalid or expired"));
      }
    })();
  }, [confirmEmail, router, token]);

  return (
    <div className="flex w-full max-w-[360px] flex-col">
      <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-zinc-900">
        Confirming account
      </h1>

      {!token ? (
        <p className="mt-3 text-[15px] text-red-600">
          Missing confirmation token. Request a new signup link.
        </p>
      ) : error ? (
        <p className="mt-3 text-[15px] text-red-600">{error}</p>
      ) : (
        <p className="mt-3 text-[15px] text-zinc-500">
          Activating your account and signing you in...
        </p>
      )}

      {error || !token ? (
        <p className="mt-8 text-center text-[15px] text-zinc-700">
          <Link
            href={routes.register}
            className="font-medium text-brand underline underline-offset-2"
          >
            Back to sign up
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthPageShell imageSrc="/signup.png">
      <Suspense
        fallback={
          <div className="flex w-full max-w-[360px] flex-col">
            <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-zinc-900">
              Confirming account
            </h1>
            <p className="mt-3 text-[15px] text-zinc-500">Please wait...</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthPageShell>
  );
}
