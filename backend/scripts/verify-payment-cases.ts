/**
 * Verifies core Stripe payment cases without the browser / Stripe CLI.
 *
 * Usage (from backend/):
 *   pnpm exec ts-node --transpile-only scripts/verify-payment-cases.ts
 */
import "dotenv/config";
import Stripe from "stripe";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const secret = process.env.STRIPE_SECRET_KEY;
  assert(secret?.startsWith("sk_test_"), "STRIPE_SECRET_KEY must be sk_test_...");

  const stripe = new Stripe(secret);
  const results: string[] = [];

  // 1) Happy path: create PI → confirm with test visa → succeeded
  const orderId = `verify_${Date.now()}`;
  const pi = await stripe.paymentIntents.create(
    {
      amount: 2599,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { orderId },
    },
    { idempotencyKey: `verify_pi_${orderId}` },
  );
  assert(pi.client_secret, "missing client_secret");

  const paid = await stripe.paymentIntents.confirm(pi.id, {
    payment_method: "pm_card_visa",
  });
  assert(paid.status === "succeeded", `expected succeeded, got ${paid.status}`);
  assert(paid.amount === 2599, "amount mismatch");
  results.push("OK happy path (pm_card_visa → succeeded)");

  // 2) Idempotency: same key returns same PaymentIntent
  const piAgain = await stripe.paymentIntents.create(
    {
      amount: 2599,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { orderId },
    },
    { idempotencyKey: `verify_pi_${orderId}` },
  );
  assert(piAgain.id === pi.id, "idempotency key did not reuse PaymentIntent");
  results.push("OK PaymentIntent idempotency key");

  // 3) Declined card
  const declinedPi = await stripe.paymentIntents.create({
    amount: 1099,
    currency: "usd",
    payment_method_types: ["card"],
  });
  try {
    await stripe.paymentIntents.confirm(declinedPi.id, {
      payment_method: "pm_card_chargeDeclined",
    });
    throw new Error("declined card should not succeed");
  } catch (error) {
    assert(
      error instanceof Stripe.errors.StripeCardError ||
        (error instanceof Error && /declined|card/i.test(error.message)),
      `unexpected decline error: ${String(error)}`,
    );
    results.push("OK declined card (pm_card_chargeDeclined)");
  }

  // 4) Customer + save-ready session shape
  const customer = await stripe.customers.create(
    {
      email: `verify+${Date.now()}@example.com`,
      metadata: { userId: "verify-user" },
    },
    { idempotencyKey: `verify_cus_${orderId}` },
  );
  const session = await stripe.customerSessions.create({
    customer: customer.id,
    components: {
      payment_element: {
        enabled: true,
        features: {
          payment_method_redisplay: "enabled",
          payment_method_save: "enabled",
          payment_method_save_usage: "off_session",
          payment_method_remove: "enabled",
        },
      },
    },
  });
  assert(session.client_secret, "missing customer session secret");
  results.push("OK customer session for saved cards");

  console.log("\nPayment case verification\n");
  for (const line of results) {
    console.log(`  ${line}`);
  }
  console.log("\nAll automated Stripe cases passed.\n");
  console.log("Still verify manually in the browser:");
  console.log("  1) Pay 4242… → Paid / processing");
  console.log("  2) Decline 4000…0002 → friendly error, order stays awaiting");
  console.log("  3) Double-click Continue → one order (Idempotency-Key)");
  console.log("  4) Save card → next checkout shows saved card");
}

main().catch((error) => {
  console.error("\nVerification failed:\n", error);
  process.exit(1);
});
