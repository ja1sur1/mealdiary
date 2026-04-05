# Diet and Symptoms Tracker

This repository contains the initial app scaffold for the Diet and Symptoms Tracker MVP described in:
- `PRD.md`
- `docs/TECH_SPEC.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/WIREFRAMES.md`

## Recommended Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL` in `.env` to a valid Postgres connection string.
4. Run `npm run prisma:generate`.
5. Run `npm run prisma:push`.
6. Run `npm run prisma:seed`.
7. Start the app with `npm run dev`.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
```

## Vercel Deployment Notes

- Set `DATABASE_URL` in Vercel project environment variables.
- The current Vercel build command uses `prisma db push` because the project does not yet have committed migration files.
- Do not use a SQLite-style value such as `file:./dev.db` with the current Prisma schema.

## Current Status

The project currently includes:
- a Next.js App Router scaffold
- Prisma schema and seed data
- route shells for the main MVP screens
- server action placeholders for mutations

This is a starting point for implementation, not a finished product.
