#!/bin/sh
set -eu

# Apply Prisma migrations to the database pointed at by DATABASE_URL.
# In docker-compose, DATABASE_URL uses the postgres service hostname.
npx prisma migrate deploy

exec "$@"
