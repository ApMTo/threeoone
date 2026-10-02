#!/usr/bin/env bash
# Run ON the VPS after HTTP stack is up and DNS points to this server.
set -euo pipefail
cd "$(dirname "$0")/../.."

EMAIL="${CERTBOT_EMAIL:-admin@threeoone.us}"

docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$EMAIL" --agree-tos --no-eff-email \
  -d threeoone.us -d www.threeoone.us -d api.threeoone.us

cp deploy/nginx/default.ssl.conf deploy/nginx/default.conf
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "TLS enabled. Check: https://threeoone.us and https://api.threeoone.us/api/health"
