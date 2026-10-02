/**
 * Signs and POSTs a fake payment_intent.succeeded webhook to the local API.
 *
 * Prerequisites:
 *   - backend running on :3001
 *   - STRIPE_WEBHOOK_SECRET set in backend/.env (from `pnpm stripe:listen:local`)
 *
 * Usage:
 *   pnpm verify:webhook
 *   pnpm verify:webhook -- --orderId=clxxx --paymentIntentId=pi_xxx --amount=2599
 */
import "dotenv/config";
import Stripe from "stripe";

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

async function main() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret?.startsWith("whsec_")) {
    throw new Error(
      "Set STRIPE_WEBHOOK_SECRET=whsec_... in backend/.env (from stripe listen)",
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");
  const orderId = arg("orderId") ?? "order_verify_webhook";
  const paymentIntentId = arg("paymentIntentId") ?? `pi_verify_${Date.now()}`;
  const amount = Number(arg("amount") ?? "1099");
  const currency = (arg("currency") ?? "usd").toLowerCase();

  const event = {
    id: `evt_verify_${Date.now()}`,
    object: "event",
    api_version: "2024-11-20.acacia",
    created: Math.floor(Date.now() / 1000),
    type: "payment_intent.succeeded",
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    data: {
      object: {
        id: paymentIntentId,
        object: "payment_intent",
        amount,
        currency,
        status: "succeeded",
        metadata: { orderId },
      },
    },
  };

  const payload = JSON.stringify(event, null, 2);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret,
  });

  const url = "http://localhost:3001/api/webhooks/stripe";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: payload,
  });

  const body = await response.text();
  console.log(`POST ${url}`);
  console.log(`Status: ${response.status}`);
  console.log(`Body: ${body}`);

  if (!response.ok) {
    process.exit(1);
  }

  // Second delivery must be treated as duplicate.
  const dup = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: payload,
  });
  const dupBody = await dup.text();
  console.log(`\nRetry Status: ${dup.status}`);
  console.log(`Retry Body: ${dupBody}`);
  if (!dup.ok || !dupBody.includes("duplicate")) {
    console.error("Expected duplicate:true on second delivery");
    process.exit(1);
  }

  console.log("\nWebhook verify OK (accepted + deduped).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
