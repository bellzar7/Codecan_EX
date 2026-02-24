#!/bin/bash

set -e

LOCK_FILE="/tmp/installer-done.lock"

if [ -f "$LOCK_FILE" ]; then
  echo "Installer already run. Skipping setup."
  exec "$@"
fi

echo "Waiting for MySQL to be ready..."
until mysql -h"${DB_HOST:-mysql}" -P"${DB_PORT:-3306}" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" &> /dev/null; do
  echo "MySQL is unavailable - sleeping"
  sleep 2
done
echo "MySQL is up - continuing"

echo "Waiting for Redis to be ready..."
until timeout 1 bash -c "echo > /dev/tcp/${REDIS_HOST:-redis}/${REDIS_PORT:-6379}" &> /dev/null; do
  echo "Redis is unavailable - sleeping"
  sleep 2
done
echo "Redis is up - continuing"

echo "Checking database initialization status..."

# Check if role table exists and has data (better indicator than extension table)
ROLE_TABLE_EXISTS=$(mysql -h"${DB_HOST:-mysql}" -P"${DB_PORT:-3306}" -u"$DB_USER" -p"$DB_PASSWORD" -D"$DB_NAME" -sse \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME' AND table_name = 'role';" 2>/dev/null || echo "0")

ROLE_COUNT=0
if [ "$ROLE_TABLE_EXISTS" -eq 1 ]; then
  ROLE_COUNT=$(mysql -h"${DB_HOST:-mysql}" -P"${DB_PORT:-3306}" -u"$DB_USER" -p"$DB_PASSWORD" -D"$DB_NAME" -sse \
    "SELECT COUNT(*) FROM role;" 2>/dev/null || echo "0")
fi

echo "Role table exists: $ROLE_TABLE_EXISTS, Role count: $ROLE_COUNT"

# Skip initialization only if role table exists AND has data
if [ "$ROLE_TABLE_EXISTS" -eq 1 ] && [ "$ROLE_COUNT" -gt 0 ]; then
  echo "Database already initialized (found $ROLE_COUNT roles). Skipping setup."
  touch "$LOCK_FILE"
  exec "$@"
fi

echo "Running database migrations and seeds..."
cd /app
pnpm db:setup

touch "$LOCK_FILE"

exec "$@"
