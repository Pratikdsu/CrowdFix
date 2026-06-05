# CrowdFix — Database

PostgreSQL 17 + Prisma ORM. The schema lives in `backend/prisma/schema.prisma`.

## Local setup

1. Install PostgreSQL 17 (see root README → Phase 0)
2. Create database:
```bash
   psql -U postgres
   CREATE DATABASE crowdfix_dev;
   CREATE USER crowdfix_user WITH ENCRYPTED PASSWORD 'crowdfix_dev_pwd';
   GRANT ALL PRIVILEGES ON DATABASE crowdfix_dev TO crowdfix_user;
   \c crowdfix_dev
   GRANT ALL ON SCHEMA public TO crowdfix_user;
   \q
```
3. From `backend/`:
```bash
   npm install
   npx prisma migrate deploy   # apply migrations
   npx prisma db seed          # populate sample data
```

## Entities

7 core entities, see `docs/er-diagram.png`:

- **User** — accounts (CITIZEN / AUTHORITY / ADMIN)
- **Authority** — extends User with jurisdiction info
- **Report** — geotagged civic problem reports
- **Media** — photos attached to reports (Cloudinary URLs)
- **Comment** — threaded discussion on reports
- **Upvote** — one per user per report (unique constraint)
- **Notification** — in-app + email notifications

## Seed credentials (DEV ONLY)

| Email | Password | Role |
|---|---|---|
| admin@crowdfix.np | Password123! | ADMIN |
| ward4@kmc.np | Password123! | AUTHORITY |
| citizen@example.com | Password123! | CITIZEN |

## Daily commands

```bash
npx prisma studio              # visual DB browser
npx prisma migrate dev         # after editing schema.prisma
npx prisma migrate reset       # wipe and re-seed (dev only!)
npx prisma generate            # regenerate client after schema changes
```