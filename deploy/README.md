# Contabo deploy notes
#
# 1. Point DNS A records for shop + api to the VPS IP.
# 2. Copy this repo to the VPS (git clone or rsync).
# 3. Copy deploy/.env.production.example -> .env and fill secrets.
# 4. Edit deploy/nginx/default.conf domain names.
# 5. First TLS issue (HTTP challenge):
#      docker compose -f docker-compose.prod.yml run --rm certbot certonly \
#        --webroot -w /var/www/certbot \
#        -d shop.example.com -d www.shop.example.com -d api.shop.example.com
# 6. Start stack:
#      docker compose -f docker-compose.prod.yml up -d --build
# 7. Run migrations inside api container:
#      docker compose -f docker-compose.prod.yml exec api pnpm prisma migrate deploy
# 8. Stripe Dashboard (Live) webhook:
#      https://api.shop.example.com/api/webhooks/stripe
# 9. Cron backup:
#      chmod +x deploy/scripts/backup-postgres.sh
#      15 3 * * * /path/to/deploy/scripts/backup-postgres.sh
#
# Health check: GET https://api.shop.example.com/api/health
