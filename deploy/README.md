# Contabo test deploy — threeoone.us
#
# VPS IP: 84.247.168.48
#
# Hosts:
#   https://threeoone.us          → Next.js (web)
#   https://www.threeoone.us      → Next.js (web)
#   https://api.threeoone.us/api  → Nest API
#   Health: https://api.threeoone.us/api/health
#
# ---------------------------------------------------------------------------
# 1) DNS (Namecheap / registrar)
# ---------------------------------------------------------------------------
# A records → 84.247.168.48
#   @     A    84.247.168.48
#   www   A    84.247.168.48
#   api   A    84.247.168.48
#
# Remove parking / URL redirect if present.
# Check: nslookup threeoone.us  AND  nslookup api.threeoone.us
#
# ---------------------------------------------------------------------------
# 2) SSH
# ---------------------------------------------------------------------------
#   ssh root@84.247.168.48
#
# ---------------------------------------------------------------------------
# 3) Server bootstrap (Ubuntu/Debian Contabo image)
# ---------------------------------------------------------------------------
#   apt update && apt upgrade -y
#   apt install -y ca-certificates curl git ufw
#   curl -fsSL https://get.docker.com | sh
#   systemctl enable --now docker
#   ufw allow OpenSSH
#   ufw allow 80/tcp
#   ufw allow 443/tcp
#   ufw --force enable
#
# ---------------------------------------------------------------------------
# 4) Copy project (no git remote — upload from your PC)
# ---------------------------------------------------------------------------
# From Windows PowerShell (project root):
#   scp -r `
#     backend frontend deploy docker-compose.prod.yml `
#     root@84.247.168.48:/opt/three-o-one/
#
# Or on server after rsync/scp of full repo to /opt/three-o-one
#
# ---------------------------------------------------------------------------
# 5) Env
# ---------------------------------------------------------------------------
#   cd /opt/three-o-one
#   cp deploy/.env.production.example .env
#   nano .env   # set strong passwords, JWT, SMTP, Stripe TEST keys
#
# ---------------------------------------------------------------------------
# 6) First boot = HTTP nginx (already default.conf = default.http.conf)
# ---------------------------------------------------------------------------
#   mkdir -p deploy/certbot/conf deploy/certbot/www backups
#   docker compose -f docker-compose.prod.yml up -d --build
#
# ---------------------------------------------------------------------------
# 7) TLS
# ---------------------------------------------------------------------------
#   docker compose -f docker-compose.prod.yml run --rm certbot certonly \
#     --webroot -w /var/www/certbot \
#     --email you@threeoone.us --agree-tos --no-eff-email \
#     -d threeoone.us -d www.threeoone.us -d api.threeoone.us
#
#   cp deploy/nginx/default.ssl.conf deploy/nginx/default.conf
#   docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
#
# ---------------------------------------------------------------------------
# 8) Migrations
# ---------------------------------------------------------------------------
#   docker compose -f docker-compose.prod.yml exec api pnpm prisma migrate deploy
#
# Optional seed:
#   docker compose -f docker-compose.prod.yml exec api pnpm prisma:seed
#
# ---------------------------------------------------------------------------
# 9) Stripe Test webhook
# ---------------------------------------------------------------------------
# Dashboard → Developers → Webhooks (Test mode):
#   URL: https://api.threeoone.us/api/webhooks/stripe
#   Events:
#     payment_intent.succeeded
#     payment_intent.payment_failed
#     payment_intent.canceled
# Put signing secret into STRIPE_WEBHOOK_SECRET in .env, then:
#   docker compose -f docker-compose.prod.yml up -d api
#
# ---------------------------------------------------------------------------
# 10) Smoke
# ---------------------------------------------------------------------------
#   curl -fsS https://api.threeoone.us/api/health
#   open https://threeoone.us
#
# Postgres backup cron (optional):
#   chmod +x deploy/scripts/backup-postgres.sh
#   15 3 * * * /opt/three-o-one/deploy/scripts/backup-postgres.sh
