"use client";

import {
  PaymentElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  loadStripe,
  type StripeError,
  type StripeElementsOptions,
} from "@stripe/stripe-js";
import { useMemo, useState, type FormEvent } from "react";

import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/money";
import { ordersService } from "@/services/orders.service";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey
  ? loadStripe(publishableKey, { locale: "en" })
  : null;

type PaymentIssue = {
  title: string;
  description: string;
};

function toPaymentIssue(error: StripeError | { message?: string; code?: string }): PaymentIssue {
  const code = error.code ?? "";

  switch (code) {
    case "card_declined":
      return {
        title: "Card declined",
        description:
          "This card could not be charged. Try another card or contact your bank.",
      };
    case "expired_card":
      return {
        title: "Card expired",
        description: "Check the expiry date or use a different card.",
      };
    case "incorrect_cvc":
      return {
        title: "Incorrect CVC",
        description: "The security code does not match. Please try again.",
      };
    case "incorrect_number":
    case "invalid_number":
      return {
        title: "Invalid card number",
        description: "Double-check the card number and try again.",
      };
    case "processing_error":
      return {
        title: "Processing issue",
        description: "Something went wrong on the payment side. Please try again in a moment.",
      };
    case "incomplete_number":
    case "incomplete_cvc":
    case "incomplete_expiry":
      return {
        title: "Incomplete details",
        description: "Fill in all card fields before paying.",
      };
    default:
      return {
        title: "Payment unsuccessful",
        description:
          error.message?.replace(/\s*\([^)]*\)\s*$/, "").trim() ||
          "We could not complete the payment. Please try again.",
      };
  }
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 8v5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.2" r="0.9" fill="currentColor" />
    </svg>
  );
}

type CheckoutPaymentFormProps = {
  orderId: string;
  orderNumber: string;
  total: { amount: number; currency: string };
  onSuccess: (orderNumber: string, orderId: string) => void;
};

async function waitForPaidOrder(orderId: string, attempts = 8): Promise<void> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const order = await ordersService.confirmPayment(orderId);
      if (order.status !== "pending") {
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
  if (lastError) {
    throw lastError;
  }
  throw new Error(
    "Payment is still processing. Refresh Orders in a moment.",
  );
}

function PaymentForm({
  orderId,
  orderNumber,
  total,
  onSuccess,
}: CheckoutPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [issue, setIssue] = useState<PaymentIssue | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setIssue(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setIssue(toPaymentIssue(submitError));
        return;
      }

      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/orders?placed=1&order=${encodeURIComponent(orderNumber)}&id=${encodeURIComponent(orderId)}`,
        },
      });

      if (result.error) {
        setIssue(toPaymentIssue(result.error));
        return;
      }

      const status = result.paymentIntent?.status;
      if (status === "succeeded" || status === "processing") {
        await waitForPaidOrder(orderId);
        onSuccess(orderNumber, orderId);
        return;
      }

      setIssue({
        title: "Payment pending",
        description: `Current status: ${status ?? "unknown"}. If money was charged, open Orders and refresh.`,
      });
    } catch (err) {
      setIssue({
        title: "Something went wrong",
        description: getErrorMessage(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[17px] font-semibold text-zinc-950">Payment</h2>
          <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-brand uppercase">
            Secure
          </span>
        </div>
        <p className="text-[14px] leading-relaxed text-zinc-600">
          Order <span className="font-medium text-zinc-900">{orderNumber}</span>
          {" · "}
          You can save this card for faster checkout next time.
        </p>
      </div>

      {issue ? (
        <div
          role="alert"
          className="flex gap-3 rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3.5 text-red-950 shadow-[0_1px_0_rgba(127,29,29,0.04)]"
        >
          <AlertIcon className="mt-0.5 size-4.5 shrink-0 text-red-600" />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold tracking-tight">{issue.title}</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-red-800/90">
              {issue.description}
            </p>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "rounded-2xl border bg-white px-4 py-5 sm:px-5",
          issue ? "border-red-200" : "border-zinc-200",
        )}
      >
        <PaymentElement
          options={{
            layout: {
              type: "tabs",
              defaultCollapsed: false,
            },
            paymentMethodOrder: ["card"],
          }}
        />
      </div>

      <div className="flex items-start gap-2 text-[12px] leading-relaxed text-zinc-500">
        <LockIcon className="mt-0.5 size-3.5 shrink-0 text-zinc-400" />
        <p>
          Card data is stored securely by Stripe, not on Three-O-One. Tick
          &quot;Save card&quot; in the form to reuse it on your next order.
        </p>
      </div>

      <div className="flex items-center justify-end pt-1">
        <button
          type="submit"
          disabled={!stripe || !elements || submitting}
          className={cn(
            "inline-flex h-14 min-w-46 items-center justify-center gap-2 rounded-xl bg-brand px-8 text-[15px] font-medium text-white transition",
            "hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {submitting ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Processing…
            </>
          ) : (
            `Pay ${formatMoney(total)}`
          )}
        </button>
      </div>
    </form>
  );
}

export function CheckoutPaymentStep(
  props: CheckoutPaymentFormProps & {
    clientSecret: string;
    customerSessionClientSecret: string;
  },
) {
  const options = useMemo<StripeElementsOptions>(
    () => ({
      clientSecret: props.clientSecret,
      customerSessionClientSecret: props.customerSessionClientSecret,
      locale: "en",
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#8d643d",
          colorBackground: "#ffffff",
          colorText: "#18181b",
          colorDanger: "#dc2626",
          colorTextSecondary: "#71717a",
          colorTextPlaceholder: "#a1a1aa",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          fontSizeBase: "15px",
          borderRadius: "10px",
          spacingUnit: "4px",
        },
        rules: {
          ".Input": {
            border: "1px solid #d4d4d8",
            boxShadow: "none",
            padding: "12px 14px",
          },
          ".Input:focus": {
            border: "1px solid #8d643d",
            boxShadow: "0 0 0 1px #8d643d",
          },
          ".Label": {
            fontWeight: "500",
            color: "#3f3f46",
          },
          ".Tab": {
            border: "1px solid #e4e4e7",
            boxShadow: "none",
          },
          ".Tab--selected": {
            border: "1px solid #8d643d",
            backgroundColor: "#f6f0ea",
            color: "#8d643d",
          },
          ".Error": {
            color: "#dc2626",
          },
        },
      },
    }),
    [props.clientSecret, props.customerSessionClientSecret],
  );

  if (!stripePromise) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-[14px] text-red-900"
      >
        Stripe is not configured. Add{" "}
        <code className="rounded bg-white/70 px-1.5 py-0.5 text-[12px]">
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        </code>{" "}
        to <code className="text-[12px]">frontend/.env.local</code>.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        orderId={props.orderId}
        orderNumber={props.orderNumber}
        total={props.total}
        onSuccess={props.onSuccess}
      />
    </Elements>
  );
}
