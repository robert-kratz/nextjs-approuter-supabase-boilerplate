# Nextjs App Router + Supabase Boilerplate

Production-ready **Next.js App Router** boilerplate using **Supabase**, **Drizzle ORM**, typed **Handlebars email templates**, and clean CLI scripting.

---

## Tech Stack

| Area          | Tools / Libraries                                |
| ------------- | ------------------------------------------------ |
| Frontend      | Next.js 15 (App Router), React 19, Tailwind CSS  |
| Backend Logic | Node.js, TypeScript                              |
| Database      | Supabase (PostgreSQL), Drizzle ORM, postgres     |
| Email         | Nodemailer + Handlebars (multi-language support) |
| Validation    | Zod                                              |
| Tooling       | drizzle-kit, tsx, dotenv, dotenv-cli             |

---

## Project Structure

```bash
src/
    app/ # Next.js routes (App Router)
    lib/
        emailService.ts # Reusable email module with lang support
    db/
        schema.ts # Drizzle schema definitions
        index.ts # Next.js (server-only) DB client
        node-client.ts # Standalone scripts DB client
templates/
welcome-email/
    de.hbs
    en.hbs
scripts/
    seed.ts # Seed the database
    db-drop.ts # Drop + reset schema
drizzle.config.ts
.env.example
```

---

## Getting Started

### 1. Clone & Install

```bash
npm install
```

2. Create .env and .env.local

```bash
cp .env.example .env
cp .env.example .env.local
```

Then fill in the required values.

# Email (SMTP)

```env
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_SECURE=false
FROM_EMAIL=""
```

# Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

# For server-side scripts and migrations

```
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL="postgresql://postgres:<PASSWORD>@<HOST>:5432/postgres"
```

Note: Use the Supabase project’s connection string. For Supabase, SSL is usually required (?sslmode=require).

## Supabase Setup

1. Go to https://app.supabase.com
2. Click New Project
3. Set project name, password, and region
4. Once ready, go to Project Settings → API and copy:
   • Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   • anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   • service_role key → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to Settings → Database → Connection Info
   Copy the full connection string and set it in `DATABASE_URL`
   (Append `?sslmode=require` or set `PGSSLMODE=require` if needed)

## Drizzle Configuration

```typescript
// drizzle.config.ts;

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/lib/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    casing: 'snake_case',
});
```

## Available Scripts

```json
{
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "dotenv -e .env.local -e .env -- tsx scripts/seed.ts",
    "db:reset": "dotenv -e .env.local -e .env -- tsx scripts/db-drop.ts",
    "db:rebuild": "npm run db:reset && npm run db:push && npm run db:seed"
}
```

### Commands

Script Description

-   `db:generate`: Generate SQL schema from TypeScript
-   `db:push`: Push schema directly to the database
-   `db:migrate`: Run SQL migrations (if using versioned flow)
-   `db:studio`: Open Drizzle Studio to browse schema
-   `db:seed`: Seed the DB with default records
-   `db:reset`: Drop + recreate public schema
-   `db:rebuild`: Full reset → push schema → seed data

### Email Templates

• Stored in `templates/<email-id>/<lang>.hbs`
• Supports full type safety via `registerEmail<T>()`
• Fallback and multi-language support included

### Example registration

```typescript
export const WelcomeEmail = registerEmail<{
    userName: string;
    signupDateIso: string;
}>({
    id: 'welcome-email',
    subject: ({ data }) => ({
        de: `Willkommen, ${data.userName}`,
        en: `Welcome, ${data.userName}`,
    }),
});
```

### Example usage

```typescript
await WelcomeEmail.send({
    to: 'user@example.com',
    data: { userName: 'Robert', signupDateIso: new Date().toISOString() },
    lang: 'de',
});
```

Template file: `templates/welcome-email/de.hbs`:

```hbs
<h1>Hi {{userName}}</h1>

await WelcomeEmail.send({ to: "user@example.com", data: { userName: "Robert", signupDateIso: new Date().toISOString() },
lang: "de", }); Template file: templates/welcome-email/de.hbs

<h1>Hi {{userName}}</h1>
<p>Willkommen bei uns! Dein Konto wurde am {{signupDateIso}} erstellt.</p>

Templates support additional variables like appUrl, note, year if provided.
```

## Notes

-   Use `src/lib/db/index.ts` for Next.js (server-only)
-   Use `src/lib/db/node-client.ts` for CLI scripts (auto SSL for Supabase)
-   All DB access must happen on the server only
-   numeric columns are returned as strings – convert manually if needed

## Local Development

```bash
npm run dev
```

Open http://localhost:3000

Start building your app under `src/app`.

## License

[Apache-2.0 License](LICENSE)

© 2025 Robert J. Kratz ([rjks.us](https://rjks.us))
