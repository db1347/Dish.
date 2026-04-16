create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

create type dietary_pref as enum ('vegan','vegetarian','gluten-free','dairy-free','halal','kosher','keto','paleo');
create type skill_level as enum ('beginner','intermediate','advanced');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text,
  avatar_url text,
  dietary_prefs dietary_pref[] default '{}',
  cuisine_prefs text[] default '{}',
  skill_level skill_level default 'beginner',
  follower_count int default 0,
  following_count int default 0,
  recipe_count int default 0,
  avg_rating numeric(3,2) default 0,
  is_premium boolean default false,
  ai_generations_today int default 0,
  ai_generations_reset_at timestamptz default now() + interval '24 hours',
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, username, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)), coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table public.recipes (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  cover_image_url text,
  cuisine text not null default '',
  dietary_tags dietary_pref[] default '{}',
  skill_level skill_level default 'beginner',
  prep_time_mins int not null default 0,
  cook_time_mins int not null default 0,
  servings int not null default 2,
  ingredients jsonb not null default '[]',
  steps jsonb not null default '[]',
  avg_rating numeric(3,2) default 0,
  rating_count int default 0,
  save_count int default 0,
  is_ai_generated boolean default false,
  ai_prompt text,
  search_vector tsvector generated always as (to_tsvector('english', title || ' ' || description || ' ' || cuisine)) stored,
  created_at timestamptz default now()
);

create index recipes_author_idx on public.recipes(author_id);
create index recipes_created_idx on public.recipes(created_at desc);
create index recipes_save_idx on public.recipes(save_count desc);
create index recipes_search_idx on public.recipes using gin(search_vector);
create index recipes_dietary_idx on public.recipes using gin(dietary_tags);

create table public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

create table public.ratings (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz default now(),
  unique (recipe_id, user_id)
);

create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz default now()
);

create table public.collections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null default 'Saved',
  is_public boolean default false,
  created_at timestamptz default now()
);

create table public.collection_recipes (
  collection_id uuid not null references public.collections(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  added_at timestamptz default now(),
  primary key (collection_id, recipe_id)
);

-- RLS
alter table public.users enable row level security;
alter table public.recipes enable row level security;
alter table public.follows enable row level security;
alter table public.ratings enable row level security;
alter table public.comments enable row level security;
alter table public.collections enable row level security;
alter table public.collection_recipes enable row level security;

create policy "Public profiles" on public.users for select using (true);
create policy "Users update own" on public.users for update using (auth.uid() = id);
create policy "Public recipes" on public.recipes for select using (true);
create policy "Auth create recipe" on public.recipes for insert with check (auth.uid() = author_id);
create policy "Author update recipe" on public.recipes for update using (auth.uid() = author_id);
create policy "Author delete recipe" on public.recipes for delete using (auth.uid() = author_id);
create policy "Public follows" on public.follows for select using (true);
create policy "Own follows" on public.follows for all using (auth.uid() = follower_id);
create policy "Public ratings" on public.ratings for select using (true);
create policy "Own ratings" on public.ratings for all using (auth.uid() = user_id);
create policy "Public comments" on public.comments for select using (true);
create policy "Auth comment" on public.comments for insert with check (auth.uid() = author_id);
create policy "Own delete comment" on public.comments for delete using (auth.uid() = author_id);
create policy "Own or public collections" on public.collections for select using (auth.uid() = user_id or is_public = true);
create policy "Own collections" on public.collections for all using (auth.uid() = user_id);

-- =============================================
-- MIGRATION: Sprint 4 — notifications table
-- =============================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('new_follower', 'recipe_like', 'recipe_comment', 'recipe_rating')),
  actor_id uuid references public.users(id) on delete cascade,
  recipe_id uuid references public.recipes(id) on delete cascade,
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications(user_id, read) where read = false;

alter table public.notifications enable row level security;
create policy "Own notifications" on public.notifications for all using (auth.uid() = user_id);
