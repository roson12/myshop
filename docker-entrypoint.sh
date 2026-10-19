#!/bin/sh
set -e

# Generated client can be hidden by the bind mount, so regenerate on boot.
npx prisma generate

echo "Applying migrations..."
npx prisma migrate deploy

echo "Seeding demo data (idempotent)..."
npx prisma db seed

exec npm run dev
