const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const localStripe = path.join(__dirname, "..", "tools", "stripe-cli", "stripe.exe");
const stripeBin = fs.existsSync(localStripe) ? localStripe : "stripe";

const args = [
  "listen",
  "--forward-to",
  "localhost:3001/api/webhooks/stripe",
  "--events",
  "payment_intent.succeeded,payment_intent.payment_failed,payment_intent.canceled",
];

console.log(`Starting: ${stripeBin} ${args.join(" ")}`);
console.log("Copy the whsec_... webhook signing secret into backend/.env as STRIPE_WEBHOOK_SECRET");
console.log("Then restart the Nest backend.\n");

const child = spawn(stripeBin, args, { stdio: "inherit", shell: false });
child.on("exit", (code) => process.exit(code ?? 0));
