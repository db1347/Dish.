# dish. 🍽️

A warm food social app — discover recipes, share your cooking, and let AI create meals from whatever's in your kitchen.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp apps/web/.env.local.example apps/web/.env.local

# 3. Run the Supabase schema
# → Go to supabase.com → your project → SQL Editor
# → Paste the contents of supabase/schema.sql and run it

# 4. Start the dev server
npm run dev:web
```

Open http://localhost:3000

## Environment variables needed

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API |
| `ANTHROPIC_API_KEY` | console.anthropic.com/settings/keys |
