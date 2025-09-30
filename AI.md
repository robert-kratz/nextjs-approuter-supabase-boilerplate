# nextjs-approuter-supabase-boilerplate - AI Agent Context Overview

## Project Summary

**nextjs-approuter-supabase-boilerplate** is a modern ERP application developed as a production-ready Next.js App Router boilerplate with Supabase, Drizzle ORM, and advanced features.

---

## Technology Stack

### Frontend & Framework

-   **Next.js 15** with App Router
-   **React 19** with modern hooks
-   **TypeScript** (strict mode, ES2017 target)
-   **Tailwind CSS v4** for styling
-   **Geist Font** (Sans & Mono) as default fonts

### Backend & Database

-   **Supabase** as Backend-as-a-Service (PostgreSQL)
-   **Drizzle ORM** for type-safe database operations
-   **postgres.js** as PostgreSQL client
-   **Zod** for schema validation

### Email & Communication

-   **Nodemailer** for email delivery
-   **Handlebars** as template engine
-   Multi-language email templates (DE/EN)

### Development & Tooling

-   **drizzle-kit** for database migrations
-   **tsx** for TypeScript execution
-   **dotenv** for environment variables
-   **ESLint** with Next.js configuration

---

## Project Structure

```
nextjs-approuter-supabase-boilerplate/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root Layout
│   │   ├── page.tsx            # Homepage (minimal)
│   │   ├── globals.css         # Global Styles
│   │   └── api/                # API Routes (empty)
│   ├── lib/
│   │   ├── emailService.ts     # Email Service with Multi-Lang
│   │   └── db/
│   │       ├── index.ts        # DB Client (server-only)
│   │       ├── schema.ts       # Drizzle Schema
│   │       └── supabase.ts     # Supabase Admin Client
│   ├── env.d.ts               # Environment Types
│   └── global.d.ts            # Global Types
├── scripts/
│   ├── seed.ts                # Database Seeding
│   └── db-drop.ts             # Schema Reset
├── drizzle.config.ts          # Drizzle Configuration
├── docker-compose.yml         # Docker Setup
├── Dockerfile                 # Multi-stage Build
└── package.json               # Dependencies & Scripts
```

---

## Data Model (Drizzle Schema)

### Tables Overview

#### 1. **auth.users** (Supabase Auth Schema)

-   Read-only reference to Supabase Auth
-   Fields: `id`, `email`, `created_at`

#### 2. **profiles**

-   Extended user profiles
-   FK to `auth.users`
-   Fields: `id`, `user_id`, `display_name`, `role`, `created_at`, `updated_at`
-   Role: `user` | `admin`

#### 3. **products**

-   Product catalog
-   Fields: `id`, `sku`, `name`, `price`, `currency`, `stock`, `active`
-   Currency: `EUR` | `USD`
-   Auto-Timestamps

#### 4. **orders**

-   Orders
-   FK to `profiles`
-   Fields: `id`, `profile_id`, `total`, `currency`, `created_at`

#### 5. **order_items**

-   Order line items
-   FK to `orders` and `products`
-   Fields: `id`, `order_id`, `product_id`, `qty`, `unit_price`

### Relations

-   **Profile → Orders** (1:n)
-   **Orders → Order Items** (1:n)
-   **Products → Order Items** (1:n)
-   **Profile → Auth User** (1:1)

---

## Configuration & Setup

### Environment Variables

```bash
DATABASE_URL=                    # PostgreSQL Connection
NEXT_PUBLIC_SUPABASE_URL=       # Supabase Project URL
SUPABASE_SERVICE_ROLE_KEY=      # Supabase Service Key
```

### NPM Scripts

-   `npm run dev` - Development Server
-   `npm run build` - Production Build
-   `npm run db:generate` - Generate Migrations
-   `npm run db:push` - Push Schema to DB
-   `npm run db:seed` - Insert Test Data
-   `npm run db:reset` - Reset Schema
-   `npm run db:rebuild` - Reset + Push + Seed

---

## Services & Utilities

### Email Service (`emailService.ts`)

-   **Multi-Language Support** (DE/EN)
-   **Handlebars Templates** for dynamic content
-   **Nodemailer Integration** with flexible transporter configuration
-   **Type-Safe Email Definitions**

### Database Services

-   **Drizzle Client** (`db/index.ts`) - Server-only with Connection Pooling
-   **Supabase Admin** (`db/supabase.ts`) - Service role for admin operations
-   **Schema Definitions** (`db/schema.ts`) - Fully typed tables

---

## Docker & Deployment

### Multi-Stage Dockerfile

1. **Dependencies Stage** - npm ci Installation
2. **Builder Stage** - Next.js Build with Standalone Output
3. **Runner Stage** - Production Runtime (Alpine Linux)

### Docker Compose

-   Web Service on Port 3000
-   Environment Variables from `.env` and `.env.local`
-   Auto-Restart Policy

---

## Development Phase & Status

### Current State

-   ✅ **Base Structure** completely implemented
-   ✅ **Data Model** defined and tested
-   ✅ **Docker Setup** production ready
-   ✅ **Email Service** with Multi-Language
-   ⚠️ **Frontend** - Only basic layout available
-   ⚠️ **API Routes** - Not yet implemented
-   ⚠️ **Authentication Flow** - Setup available but not implemented

### Next Steps

1. API Routes for CRUD operations
2. Frontend Components for ERP modules
3. Authentication Integration
4. Business Logic Implementation

---

## Special Features

### 🔒 **Type Safety**

-   Fully typed database operations
-   Zod Schema Validation
-   TypeScript strict mode

### 🌍 **Internationalization Ready**

-   Email Templates in multiple languages
-   Structured for i18n extension

### 🚀 **Production Ready**

-   Docker Multi-Stage Build
-   Standalone Next.js Output
-   Environment-based configuration
-   Database Migration System

### 🔧 **Developer Experience**

-   CLI Scripts for DB Management
-   Auto-generated Types
-   Hot Reload Development
-   Comprehensive Tooling

---

## Code Architecture Principles

1. **Separation of Concerns** - Clear separation of DB, Services and UI
2. **Type-First Development** - Schema-driven with Drizzle
3. **Server-First Approach** - Utilizing Next.js App Router Features
4. **Environment Flexibility** - Configuration via ENV Variables
5. **Scalable Structure** - Modular organization for extensibility

---

_This overview serves as context for AI agents to support the further development of the nextjs-approuter-supabase-boilerplate system._
