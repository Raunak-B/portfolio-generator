# Resume Portfolio SaaS

Upload a PDF or text resume, parse it with OpenAI, and publish a permanent portfolio at `/p/[username]`.

## Tech stack

- **Next.js 16** (App Router), React, Tailwind CSS
- **Supabase** — Auth, PostgreSQL, RLS, Storage
- **OpenAI** — `gpt-4-turbo` JSON mode for resume parsing

## Setup

### 1. Supabase

1. Run `supabase/migrations/001_initial_schema.sql` (if not already applied).
2. Run `supabase/migrations/002_resume_portfolio_schema.sql`.
3. Enable **Email** provider under Authentication → Providers.
4. Add redirect URL: `{SITE_URL}/auth/callback`.

### 2. Environment

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server-only, resume download + upsert) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` or production URL |
| `OPENAI_API_KEY` | OpenAI API key |

### 3. Run

```bash
npm install
npm run dev
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing |
| `/login` | Email sign-in / sign-up |
| `/dashboard` | Resume upload (protected) |
| `/p/[username]` | Public portfolio |

## Edge cases

- **OpenAI invalid JSON** — Server returns error; portfolio `processing_status` set to `failed`.
- **Unknown username** — Custom 404 at `/p/[username]`.
- **Processing states** — Dashboard shows uploading, AI processing, success link, or error banner.

## Creator footer

Every public portfolio includes:

> Platform engineered by Raunak Bhattacharjee | NIT Silchar

with links to GitHub and LinkedIn.
