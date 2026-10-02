#!/usr/bin/env bash
# Daily Postgres backup for Contabo.
# Cron example (on the VPS host):
#   15 3 * * * /opt/three-o-one/deploy/scripts/backup-postgres.sh >> /var/log/three-o-one-backup.log 2>&1

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
BACKUP_DIR="${ROOT_DIR}/backups"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILE="${BACKUP_DIR}/postgres-${STAMP}.sql.gz"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"

mkdir -p "${BACKUP_DIR}"

# Expects docker compose project running with service name "postgres".
docker compose -f "${ROOT_DIR}/docker-compose.prod.yml" exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "${FILE}"

echo "Wrote ${FILE}"

find "${BACKUP_DIR}" -name 'postgres-*.sql.gz' -mtime "+${KEEP_DAYS}" -delete
echo "Deleted backups older than ${KEEP_DAYS} days"
