/**
 * Downloads Stripe CLI into backend/tools/stripe-cli (Windows x64).
 * Run: node scripts/install-stripe-cli.js
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const { execFileSync } = require("child_process");

const outDir = path.join(__dirname, "..", "tools", "stripe-cli");
const zipPath = path.join(outDir, "stripe.zip");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "three-o-one" } }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const release = JSON.parse(
    (await get("https://api.github.com/repos/stripe/stripe-cli/releases/latest")).toString("utf8"),
  );
  const asset = (release.assets || []).find((a) => /windows_x86_64\.zip$/i.test(a.name));
  if (!asset) throw new Error("windows_x86_64.zip asset not found");

  console.log(`Downloading ${asset.name}...`);
  const zip = await get(asset.browser_download_url);
  fs.writeFileSync(zipPath, zip);

  console.log("Extracting...");
  execFileSync(
    "powershell.exe",
    ["-NoProfile", "-Command", `Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir}' -Force`],
    { stdio: "inherit" },
  );

  const exe = path.join(outDir, "stripe.exe");
  if (!fs.existsSync(exe)) throw new Error("stripe.exe missing after extract");
  console.log(`OK: ${exe}`);
  console.log("Next: pnpm stripe:listen:local");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
