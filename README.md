# Dynamic Portfolio Generator

Multi-tenant SaaS that lets developers sign in with GitHub, sync repository data, customize a portfolio, and publish it at `/{username}`.

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion
- **Backend:** Supabase (PostgreSQL, RLS, GitHub OAuth)
- **Data:** GitHub REST API
- **Deploy:** Vercel

## Folder structure

```
portfolio-generator/
├── .env.local.example
├── middleware.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── src/
    ├── actions/
    │   ├── github.ts
    │   └── portfolio.ts
    ├── app/
    │   ├── [username]/page.tsx
    │   ├── auth/callback/route.ts
    │   ├── dashboard/page.tsx
    │   ├── login/page.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── dashboard/
    │   │   ├── dashboard-client.tsx
    │   │   └── publish-form.tsx
    │   ├── login/
    │   │   └── login-button.tsx
    │   └── portfolio/
    │       ├── not-found-portfolio.tsx
    │       └── public-portfolio.tsx
    ├── lib/
    │   ├── constants.ts
    │   ├── themes.ts
    │   ├── github/
    │   │   ├── api.ts
    │   │   └── types.ts
    │   ├── portfolio/
    │   │   └── queries.ts
    │   └── supabase/
    │       ├── client.ts
    │       ├── middleware.ts
    │       └── server.ts
    └── types/
        └── database.ts
```

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor.
3. Enable **GitHub** under Authentication → Providers.
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR_DOMAIN/auth/callback`
5. Request scopes: `read:user`, `repo` (configured in the login button).

### 2. GitHub OAuth app

Create a GitHub OAuth App and paste Client ID/Secret into Supabase GitHub provider settings.

### 3. Environment

```bash
cp .env.local.example .env.local
```

Fill in Supabase URL, anon key, and `NEXT_PUBLIC_SITE_URL`.

### 4. Run locally

```bash
npm install
npm run dev
```

## Edge cases (implemented)

| Case | Behavior |
|------|----------|
| GitHub rate limit | `GitHubRateLimitError` surfaced on dashboard with reset time |
| Unknown `/{username}` | Custom 404 UI (`NotFoundPortfolio`) |
| Repo without description | Fallback copy from `REPO_DESCRIPTION_FALLBACK` |

## Deploy (Vercel)

1. Import the repo.
2. Add the same env vars.
3. Set `NEXT_PUBLIC_SITE_URL` to your production URL.
4. Add production callback URL in Supabase Auth settings.
