-- ================================================================
-- dish. — seed data
-- Run in: Supabase dashboard → SQL Editor → paste → Run
-- All test accounts: password is  dish123
-- Safe to re-run (deletes & recreates seed rows each time)
-- ================================================================

-- ─── Wipe previous seed data ────────────────────────────────────
DELETE FROM auth.users WHERE email LIKE '%@dish.test';
-- CASCADE deletes public.users, recipes, follows, ratings, comments,
-- collections, collection_recipes, notifications automatically.


-- ================================================================
-- 1. AUTH USERS
--    The trigger handle_new_user() fires on each INSERT and
--    auto-creates the matching public.users row.
-- ================================================================
INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
  is_super_admin, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES
  (
    'a0000001-0000-0000-0000-000000000001','authenticated','authenticated',
    'marco@dish.test', crypt('dish123', gen_salt('bf')), now(),
    now() - interval '45 days', now(),
    '{"username":"marcorossi","full_name":"Marco Rossi","avatar_url":"https://api.dicebear.com/7.x/personas/svg?seed=marco&backgroundColor=c4684a&size=128"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false,'','','',''
  ),
  (
    'a0000001-0000-0000-0000-000000000002','authenticated','authenticated',
    'aisha@dish.test', crypt('dish123', gen_salt('bf')), now(),
    now() - interval '38 days', now(),
    '{"username":"aishapatel","full_name":"Aisha Patel","avatar_url":"https://api.dicebear.com/7.x/personas/svg?seed=aisha&backgroundColor=7b9e82&size=128"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false,'','','',''
  ),
  (
    'a0000001-0000-0000-0000-000000000003','authenticated','authenticated',
    'sophie@dish.test', crypt('dish123', gen_salt('bf')), now(),
    now() - interval '30 days', now(),
    '{"username":"sophielaurent","full_name":"Sophie Laurent","avatar_url":"https://api.dicebear.com/7.x/personas/svg?seed=sophie&backgroundColor=f2ede5&size=128"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false,'','','',''
  ),
  (
    'a0000001-0000-0000-0000-000000000004','authenticated','authenticated',
    'carlos@dish.test', crypt('dish123', gen_salt('bf')), now(),
    now() - interval '22 days', now(),
    '{"username":"carlosmendez","full_name":"Carlos Mendez","avatar_url":"https://api.dicebear.com/7.x/personas/svg?seed=carlos&backgroundColor=7a6a62&size=128"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false,'','','',''
  ),
  (
    'a0000001-0000-0000-0000-000000000005','authenticated','authenticated',
    'yuki@dish.test', crypt('dish123', gen_salt('bf')), now(),
    now() - interval '14 days', now(),
    '{"username":"yukitanaka","full_name":"Yuki Tanaka","avatar_url":"https://api.dicebear.com/7.x/personas/svg?seed=yuki&backgroundColor=2a1f1a&size=128"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false,'','','',''
  ),
  (
    'a0000001-0000-0000-0000-000000000006','authenticated','authenticated',
    'emma@dish.test', crypt('dish123', gen_salt('bf')), now(),
    now() - interval '7 days', now(),
    '{"username":"emmawilson","full_name":"Emma Wilson","avatar_url":"https://api.dicebear.com/7.x/personas/svg?seed=emma&backgroundColor=c4684a&size=128"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false,'','','',''
  );


-- ================================================================
-- 2. ENRICH public.users  (bio, prefs, skill — counts set later)
-- ================================================================
UPDATE public.users SET
  bio         = 'Nonna''s recipes, reimagined. Born in Naples, cooking in Brooklyn. Pasta is my love language. 🍝',
  skill_level = 'advanced',
  cuisine_prefs = ARRAY['Italian','Mediterranean','French'],
  avatar_url  = 'https://api.dicebear.com/7.x/personas/svg?seed=marco&backgroundColor=c4684a&size=128'
WHERE id = 'a0000001-0000-0000-0000-000000000001';

UPDATE public.users SET
  bio         = 'Spice queen 🌶️ Raised on mum''s curries in Mumbai, now sharing the magic from my London kitchen.',
  skill_level = 'intermediate',
  cuisine_prefs = ARRAY['Indian','Asian','Mediterranean'],
  dietary_prefs = ARRAY['vegetarian']::dietary_pref[],
  avatar_url  = 'https://api.dicebear.com/7.x/personas/svg?seed=aisha&backgroundColor=7b9e82&size=128'
WHERE id = 'a0000001-0000-0000-0000-000000000002';

UPDATE public.users SET
  bio         = 'Pastry chef by training, home cook by heart. Paris → Lyon → your screen. Butter is always the answer. 🧈',
  skill_level = 'advanced',
  cuisine_prefs = ARRAY['French','Italian','Mediterranean'],
  avatar_url  = 'https://api.dicebear.com/7.x/personas/svg?seed=sophie&backgroundColor=f2ede5&size=128'
WHERE id = 'a0000001-0000-0000-0000-000000000003';

UPDATE public.users SET
  bio         = 'Street food is soul food. Growing up in Oaxaca taught me the best meals cost nothing and taste like everything.',
  skill_level = 'intermediate',
  cuisine_prefs = ARRAY['Mexican','American','Asian'],
  avatar_url  = 'https://api.dicebear.com/7.x/personas/svg?seed=carlos&backgroundColor=7a6a62&size=128'
WHERE id = 'a0000001-0000-0000-0000-000000000004';

UPDATE public.users SET
  bio         = 'Tokyo-born, world-curious. Ramen researcher and dumpling devotee. Simplicity is the ultimate sophistication. 🍜',
  skill_level = 'advanced',
  cuisine_prefs = ARRAY['Japanese','Asian','Mediterranean'],
  avatar_url  = 'https://api.dicebear.com/7.x/personas/svg?seed=yuki&backgroundColor=2a1f1a&size=128'
WHERE id = 'a0000001-0000-0000-0000-000000000005';

UPDATE public.users SET
  bio         = 'Plant-based chef proving vegan food can be the most exciting food on your table. 🌿',
  skill_level = 'intermediate',
  cuisine_prefs = ARRAY['Mediterranean','Asian','American'],
  dietary_prefs = ARRAY['vegan']::dietary_pref[],
  avatar_url  = 'https://api.dicebear.com/7.x/personas/svg?seed=emma&backgroundColor=c4684a&size=128'
WHERE id = 'a0000001-0000-0000-0000-000000000006';


-- ================================================================
-- 3. RECIPES  (18 total — 3 per chef)
-- ================================================================
INSERT INTO public.recipes (
  id, author_id, title, description, cuisine,
  dietary_tags, skill_level, prep_time_mins, cook_time_mins,
  servings, avg_rating, rating_count, save_count,
  ingredients, steps, cover_image_url, is_ai_generated, created_at
) VALUES

-- ── Marco Rossi — Italian ─────────────────────────────────────
(
  'b0000001-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000001',
  'Cacio e Pepe',
  'The simplest pasta dish in the world, and somehow the most satisfying. Just cheese, pepper, and pasta water — but the technique is everything. My Roman neighbour taught me this on a Tuesday afternoon and it changed my life.',
  'Italian',
  '{}'::dietary_pref[], 'beginner', 5, 15, 2, 4.9, 38, 124,
  '[
    {"id":"1","name":"spaghetti or tonnarelli","quantity":200,"unit":"g"},
    {"id":"2","name":"Pecorino Romano","quantity":80,"unit":"g","notes":"finely grated"},
    {"id":"3","name":"Parmesan","quantity":40,"unit":"g","notes":"finely grated"},
    {"id":"4","name":"black pepper","quantity":2,"unit":"tsp","notes":"coarsely cracked, fresh"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Bring a large pot of lightly salted water to a boil. Cook pasta until 2 minutes before al dente — reserve 1 cup of starchy pasta water before draining."},
    {"order":2,"instruction":"Toast cracked pepper in a dry wide pan over medium heat for 1 minute until fragrant. Remove from heat and let cool slightly."},
    {"order":3,"instruction":"Mix Pecorino and Parmesan together. Add a splash of pasta water to make a thick, pourable paste — like the texture of thick cream."},
    {"order":4,"instruction":"Add drained pasta to the pepper pan over low heat. Add the cheese paste and toss vigorously, adding pasta water a splash at a time until silky and coating every strand. Serve immediately."}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1621996031353-5e64a44bd0ce?w=600&q=80&fit=crop',
  false, now() - interval '40 days'
),
(
  'b0000001-0000-0000-0000-000000000002',
  'a0000001-0000-0000-0000-000000000001',
  'Osso Buco alla Milanese',
  'Braised veal shanks slow-cooked until the meat falls off the bone and the marrow melts into the most extraordinary sauce. A Sunday project that will make your whole apartment smell incredible for hours.',
  'Italian',
  '{}'::dietary_pref[], 'advanced', 30, 120, 4, 4.8, 21, 87,
  '[
    {"id":"1","name":"veal shanks","quantity":4,"unit":"piece","notes":"about 3cm thick, cross-cut"},
    {"id":"2","name":"white wine","quantity":250,"unit":"ml","notes":"dry"},
    {"id":"3","name":"beef stock","quantity":500,"unit":"ml"},
    {"id":"4","name":"canned tomatoes","quantity":400,"unit":"g"},
    {"id":"5","name":"onion","quantity":1,"unit":"piece","notes":"finely diced"},
    {"id":"6","name":"carrots","quantity":2,"unit":"piece","notes":"finely diced"},
    {"id":"7","name":"celery","quantity":2,"unit":"piece","notes":"finely diced"},
    {"id":"8","name":"lemon zest","quantity":1,"unit":"piece","notes":"for gremolata"},
    {"id":"9","name":"garlic","quantity":3,"unit":"piece","notes":"for gremolata"},
    {"id":"10","name":"flat-leaf parsley","quantity":1,"unit":"bunch","notes":"for gremolata"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Season veal shanks generously with salt and pepper. Dust with flour, shaking off excess. Sear in olive oil over high heat until golden brown on all sides, about 3 minutes per side. Set aside.","timer_mins":10},
    {"order":2,"instruction":"In the same pot, sauté onion, carrot and celery (soffritto) over medium heat until soft and translucent, about 8 minutes.","timer_mins":8},
    {"order":3,"instruction":"Add wine and scrape up all the browned bits from the bottom. Simmer until wine reduces by half. Add tomatoes and stock. Nestle the veal shanks back in — they should be half submerged."},
    {"order":4,"instruction":"Cover and braise on the lowest heat for 1.5–2 hours, turning shanks once, until meat is falling off the bone and sauce is rich and thick.","timer_mins":90},
    {"order":5,"instruction":"Make the gremolata: finely chop parsley, garlic and lemon zest together. Scatter generously over each shank just before serving with saffron risotto."}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80&fit=crop',
  false, now() - interval '35 days'
),
(
  'b0000001-0000-0000-0000-000000000003',
  'a0000001-0000-0000-0000-000000000001',
  'Classic Tiramisu',
  'Creamy, coffee-soaked, dusted with the best cocoa you can find. This is Nonna''s recipe — no cream in sight, just proper mascarpone and good espresso. Make it the night before and thank yourself tomorrow.',
  'Italian',
  '{}'::dietary_pref[], 'intermediate', 30, 0, 8, 4.7, 44, 156,
  '[
    {"id":"1","name":"eggs","quantity":6,"unit":"piece","notes":"separated, room temperature"},
    {"id":"2","name":"mascarpone","quantity":500,"unit":"g","notes":"cold"},
    {"id":"3","name":"caster sugar","quantity":100,"unit":"g"},
    {"id":"4","name":"savoiardi (ladyfinger biscuits)","quantity":300,"unit":"g"},
    {"id":"5","name":"espresso","quantity":300,"unit":"ml","notes":"strong, cooled"},
    {"id":"6","name":"Marsala or dark rum","quantity":4,"unit":"tbsp"},
    {"id":"7","name":"cocoa powder","quantity":3,"unit":"tbsp","notes":"good quality, unsweetened"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Beat egg yolks with sugar in a bowl until pale, thick and tripled in volume — about 5 minutes. Fold in mascarpone until just combined and smooth."},
    {"order":2,"instruction":"Whisk egg whites in a clean bowl to stiff peaks. Gently fold into the mascarpone mixture in 3 additions, being careful not to deflate."},
    {"order":3,"instruction":"Mix cooled espresso with Marsala or rum in a shallow bowl. Quickly dip each ladyfinger (1–2 seconds per side — they should be moist but not soggy) and lay in a single layer in your dish."},
    {"order":4,"instruction":"Spread half the mascarpone cream over the biscuit layer. Add a second layer of dipped biscuits, then cover with remaining cream."},
    {"order":5,"instruction":"Cover and refrigerate for at least 6 hours, preferably overnight. Dust generously with cocoa powder just before serving."}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80&fit=crop',
  false, now() - interval '28 days'
),

-- ── Aisha Patel — Indian/Asian ────────────────────────────────
(
  'b0000001-0000-0000-0000-000000000004',
  'a0000001-0000-0000-0000-000000000002',
  'Chicken Tikka Masala',
  'The dish that conquered the world, made properly — charred marinated chicken in a deeply spiced tomato cream sauce. The marinade overnight is non-negotiable. Your patience will be rewarded threefold.',
  'Indian',
  '{}'::dietary_pref[], 'intermediate', 20, 40, 4, 4.8, 67, 203,
  '[
    {"id":"1","name":"chicken thighs","quantity":700,"unit":"g","notes":"boneless, cut into chunks"},
    {"id":"2","name":"full-fat yoghurt","quantity":200,"unit":"g"},
    {"id":"3","name":"garam masala","quantity":2,"unit":"tsp"},
    {"id":"4","name":"ground cumin","quantity":1,"unit":"tsp"},
    {"id":"5","name":"ground coriander","quantity":1,"unit":"tsp"},
    {"id":"6","name":"turmeric","quantity":0.5,"unit":"tsp"},
    {"id":"7","name":"kashmiri chilli powder","quantity":1,"unit":"tsp"},
    {"id":"8","name":"garlic","quantity":5,"unit":"piece","notes":"grated"},
    {"id":"9","name":"ginger","quantity":3,"unit":"cm","notes":"grated"},
    {"id":"10","name":"canned tomatoes","quantity":400,"unit":"g"},
    {"id":"11","name":"double cream","quantity":150,"unit":"ml"},
    {"id":"12","name":"onion","quantity":2,"unit":"piece","notes":"finely sliced"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Combine yoghurt, all spices, half the garlic and ginger with 1 tsp salt. Add chicken, mix thoroughly and marinate for at least 4 hours, ideally overnight."},
    {"order":2,"instruction":"Grill or broil the chicken at high heat until charred and cooked through, about 10–12 minutes. Set aside — those charred bits are flavour gold.","timer_mins":12},
    {"order":3,"instruction":"Fry onions in oil over medium-high heat until deeply golden, about 15 minutes. Add remaining garlic and ginger, cook 2 more minutes.","timer_mins":17},
    {"order":4,"instruction":"Add tomatoes and cook down until the sauce thickens and oil starts to separate from the edges, about 10 minutes. Season with salt and a pinch of sugar.","timer_mins":10},
    {"order":5,"instruction":"Add cream and the charred chicken. Simmer 5 minutes. Finish with a pinch of garam masala and fresh coriander. Serve with basmati rice and warm naan.","timer_mins":5}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80&fit=crop',
  false, now() - interval '33 days'
),
(
  'b0000001-0000-0000-0000-000000000005',
  'a0000001-0000-0000-0000-000000000002',
  'Saag Paneer',
  'Velvety spiced spinach with pillowy pan-fried paneer cubes. A weeknight staple in my house, ready in 30 minutes and better than any restaurant version I''ve ever tried. Don''t skip the kasuri methi at the end.',
  'Indian',
  ARRAY['vegetarian']::dietary_pref[], 'beginner', 10, 25, 3, 4.6, 29, 98,
  '[
    {"id":"1","name":"fresh spinach","quantity":500,"unit":"g"},
    {"id":"2","name":"paneer","quantity":250,"unit":"g","notes":"cubed"},
    {"id":"3","name":"onion","quantity":1,"unit":"piece","notes":"finely chopped"},
    {"id":"4","name":"tomato","quantity":2,"unit":"piece","notes":"chopped"},
    {"id":"5","name":"garlic","quantity":4,"unit":"piece","notes":"minced"},
    {"id":"6","name":"ginger","quantity":2,"unit":"cm","notes":"grated"},
    {"id":"7","name":"cumin seeds","quantity":1,"unit":"tsp"},
    {"id":"8","name":"garam masala","quantity":1,"unit":"tsp"},
    {"id":"9","name":"kasuri methi (dried fenugreek)","quantity":1,"unit":"tsp"},
    {"id":"10","name":"double cream","quantity":3,"unit":"tbsp"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Blanch spinach in boiling water for 2 minutes, then immediately plunge into ice water. Squeeze dry and blend to a smooth purée.","timer_mins":2},
    {"order":2,"instruction":"Fry paneer cubes in 2 tbsp oil until golden on all sides. Remove and set aside. In the same oil, add cumin seeds and sizzle for 30 seconds.","timer_mins":5},
    {"order":3,"instruction":"Add onion and cook until golden, then add garlic and ginger. Cook 2 minutes. Add tomatoes and cook until pulpy, about 5 minutes.","timer_mins":12},
    {"order":4,"instruction":"Add spinach purée and season with garam masala and salt. Simmer 5 minutes. Crush in kasuri methi, stir in cream and add paneer. Heat through and serve.","timer_mins":5}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1585937421612-70a5d0a31b90?w=600&q=80&fit=crop',
  false, now() - interval '25 days'
),
(
  'b0000001-0000-0000-0000-000000000006',
  'a0000001-0000-0000-0000-000000000002',
  'Mango Lassi',
  'Cold, sweet, slightly tart and beautifully golden. The perfect drink alongside a spicy curry or honestly just as a mid-afternoon treat. Use the ripest, most fragrant mangoes you can find — Alphonso are ideal.',
  'Indian',
  ARRAY['vegetarian']::dietary_pref[], 'beginner', 5, 0, 2, 4.4, 18, 72,
  '[
    {"id":"1","name":"ripe mango","quantity":2,"unit":"piece","notes":"Alphonso or Ataulfo, peeled and diced"},
    {"id":"2","name":"full-fat yoghurt","quantity":250,"unit":"g"},
    {"id":"3","name":"cold whole milk","quantity":100,"unit":"ml"},
    {"id":"4","name":"sugar","quantity":2,"unit":"tbsp","notes":"adjust to taste"},
    {"id":"5","name":"cardamom","quantity":2,"unit":"piece","notes":"pods, seeds only"},
    {"id":"6","name":"ice","quantity":6,"unit":"piece"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Blend mango flesh until completely smooth. Add yoghurt, milk, sugar and crushed cardamom seeds. Blend again until frothy."},
    {"order":2,"instruction":"Taste and adjust sweetness. Add ice and blend once more until chilled and thick. Pour into tall glasses, optionally garnish with a pinch of cardamom or mango slices."}
  ]'::jsonb,
  null,
  false, now() - interval '18 days'
),

-- ── Sophie Laurent — French ───────────────────────────────────
(
  'b0000001-0000-0000-0000-000000000007',
  'a0000001-0000-0000-0000-000000000003',
  'Crème Brûlée',
  'The most elegant of all desserts — cool, wobbling vanilla cream under a thin pane of caramelised sugar you shatter with a spoon. The crack is half the pleasure. Technique matters here, but once you have it, you''ll make it forever.',
  'French',
  '{}'::dietary_pref[], 'intermediate', 20, 45, 4, 4.9, 52, 187,
  '[
    {"id":"1","name":"double cream","quantity":500,"unit":"ml"},
    {"id":"2","name":"egg yolks","quantity":6,"unit":"piece"},
    {"id":"3","name":"caster sugar","quantity":80,"unit":"g","notes":"plus extra for brûléeing"},
    {"id":"4","name":"vanilla pod","quantity":1,"unit":"piece","notes":"split and scraped"},
    {"id":"5","name":"pinch of salt","quantity":1,"unit":"pinch"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Heat cream with vanilla pod and seeds over medium heat until just steaming — do not boil. Remove from heat and let infuse for 15 minutes.","timer_mins":15},
    {"order":2,"instruction":"Whisk egg yolks with sugar and salt until pale and smooth. Slowly pour the warm cream in while whisking constantly. Skim any foam from the surface."},
    {"order":3,"instruction":"Strain through a fine sieve into a jug. Pour into 4 ramekins. Place in a deep baking tray and fill with hot water halfway up the sides.","timer_mins":5},
    {"order":4,"instruction":"Bake at 150°C (300°F) for 35–40 minutes until just set — they should wobble like jelly in the centre, not ripple like liquid. Refrigerate for at least 3 hours.","timer_mins":40},
    {"order":5,"instruction":"When ready to serve, sprinkle 1 tsp sugar over each. Use a blowtorch in small circles until deep amber — not black. Wait 1 minute for the caramel to set before serving."}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1551024506-0bccd828d73c?w=600&q=80&fit=crop',
  false, now() - interval '29 days'
),
(
  'b0000001-0000-0000-0000-000000000008',
  'a0000001-0000-0000-0000-000000000003',
  'French Onion Soup',
  'The most warming bowl in French cuisine. Low and slow caramelised onions, rich beef broth, and a floating island of bread drenched in molten Gruyère. A Parisian winter evening in a bowl.',
  'French',
  '{}'::dietary_pref[], 'intermediate', 15, 75, 4, 4.7, 33, 119,
  '[
    {"id":"1","name":"yellow onions","quantity":1.2,"unit":"kg","notes":"about 6 large, thinly sliced"},
    {"id":"2","name":"butter","quantity":60,"unit":"g"},
    {"id":"3","name":"dry white wine or dry sherry","quantity":150,"unit":"ml"},
    {"id":"4","name":"beef stock","quantity":1.5,"unit":"l","notes":"good quality"},
    {"id":"5","name":"thyme","quantity":4,"unit":"piece","notes":"fresh sprigs"},
    {"id":"6","name":"bay leaf","quantity":2,"unit":"piece"},
    {"id":"7","name":"baguette","quantity":8,"unit":"slice","notes":"1.5cm thick, toasted"},
    {"id":"8","name":"Gruyère","quantity":200,"unit":"g","notes":"grated"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Melt butter in a large heavy pot over medium heat. Add onions, stir to coat, cover and cook for 20 minutes stirring occasionally. Uncover, add 1 tsp salt and continue cooking uncovered, stirring every 5 minutes, until deeply golden and jammy — about 45 minutes total. Don''t rush this.","timer_mins":45},
    {"order":2,"instruction":"Add wine, scrape up the caramelised bits and simmer until almost completely evaporated. Add stock, thyme and bay leaves. Simmer 20 minutes. Season well.","timer_mins":20},
    {"order":3,"instruction":"Ladle soup into oven-safe bowls. Place on a baking sheet. Float 2 croutons on each. Pile Gruyère over the top so it covers the bread and hangs over the edges."},
    {"order":4,"instruction":"Grill (broil) until cheese is bubbling, blistered and golden in spots — about 3–4 minutes. Serve immediately, warning guests that the bowls are very hot.","timer_mins":4}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80&fit=crop',
  false, now() - interval '21 days'
),
(
  'b0000001-0000-0000-0000-000000000009',
  'a0000001-0000-0000-0000-000000000003',
  'Tarte Tatin',
  'The most forgiving "accident" in culinary history — caramelised apples baked under buttery pastry, then inverted so the glossy amber apples sit on top. Made with love and a healthy disregard for perfection.',
  'French',
  '{}'::dietary_pref[], 'intermediate', 25, 35, 6, 4.8, 27, 104,
  '[
    {"id":"1","name":"apples","quantity":6,"unit":"piece","notes":"firm variety like Pink Lady or Braeburn, peeled, halved"},
    {"id":"2","name":"caster sugar","quantity":150,"unit":"g"},
    {"id":"3","name":"butter","quantity":75,"unit":"g","notes":"unsalted, cubed"},
    {"id":"4","name":"all-butter puff pastry","quantity":320,"unit":"g","notes":"one sheet, chilled"},
    {"id":"5","name":"vanilla extract","quantity":1,"unit":"tsp"},
    {"id":"6","name":"crème fraîche","quantity":1,"unit":"piece","notes":"to serve"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"In a 24cm ovenproof frying pan, melt sugar over medium heat without stirring until a deep amber caramel forms, about 8–10 minutes. Remove from heat and stir in butter until smooth.","timer_mins":10},
    {"order":2,"instruction":"Arrange apple halves cut-side up tightly in the caramel. Return to medium heat and cook for 10 minutes until apples soften slightly and caramel bubbles up the sides.","timer_mins":10},
    {"order":3,"instruction":"Roll out pastry to just larger than the pan. Drape over apples, tucking the edges down around them. Pierce a few holes in the top."},
    {"order":4,"instruction":"Bake at 200°C (390°F) for 25–30 minutes until pastry is deeply golden and crisp. Rest for 5 minutes, then carefully invert onto a plate. Serve warm with cold crème fraîche.","timer_mins":30}
  ]'::jsonb,
  null,
  false, now() - interval '12 days'
),

-- ── Carlos Mendez — Mexican ──────────────────────────────────
(
  'b0000001-0000-0000-0000-000000000010',
  'a0000001-0000-0000-0000-000000000004',
  'Tacos al Pastor',
  'The prince of Mexican street food. Pork marinated in dried chillies and achiote, cooked until slightly charred, piled into warm corn tortillas with pineapple, onion and cilantro. Every single bite is a party.',
  'Mexican',
  '{}'::dietary_pref[], 'intermediate', 30, 20, 6, 4.7, 41, 163,
  '[
    {"id":"1","name":"pork shoulder","quantity":800,"unit":"g","notes":"thinly sliced"},
    {"id":"2","name":"dried guajillo chillies","quantity":4,"unit":"piece","notes":"soaked in hot water"},
    {"id":"3","name":"dried ancho chillies","quantity":2,"unit":"piece","notes":"soaked in hot water"},
    {"id":"4","name":"achiote paste","quantity":2,"unit":"tbsp"},
    {"id":"5","name":"pineapple","quantity":0.5,"unit":"piece","notes":"fresh, half for marinade, half for serving"},
    {"id":"6","name":"white onion","quantity":2,"unit":"piece","notes":"one for marinade, one diced for serving"},
    {"id":"7","name":"garlic","quantity":5,"unit":"piece"},
    {"id":"8","name":"corn tortillas","quantity":12,"unit":"piece","notes":"small, warmed"},
    {"id":"9","name":"fresh cilantro","quantity":1,"unit":"bunch"},
    {"id":"10","name":"lime","quantity":3,"unit":"piece"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Blend soaked chillies, achiote, half the pineapple, garlic, half an onion, 1 tsp oregano, 1 tsp cumin and 2 tsp salt until smooth. Toss pork slices in this marinade. Rest 2+ hours, ideally overnight."},
    {"order":2,"instruction":"Cook pork in batches in a very hot cast iron pan or grill until caramelised and slightly charred at the edges, about 3 minutes per side. Chop roughly.","timer_mins":15},
    {"order":3,"instruction":"Warm tortillas directly over a gas flame or dry pan. Pile with pork, diced pineapple, white onion and cilantro. Squeeze lime over everything."}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80&fit=crop',
  false, now() - interval '20 days'
),
(
  'b0000001-0000-0000-0000-000000000011',
  'a0000001-0000-0000-0000-000000000004',
  'Perfect Guacamole',
  'Not a recipe — a philosophy. Ripe avocados, nothing that doesn''t belong, and a molcajete if you have one. The key is to go chunky, season late, and eat immediately while the colour is that electric green.',
  'Mexican',
  ARRAY['vegan']::dietary_pref[], 'beginner', 10, 0, 4, 4.5, 35, 141,
  '[
    {"id":"1","name":"ripe avocados","quantity":3,"unit":"piece","notes":"should yield to gentle pressure"},
    {"id":"2","name":"white onion","quantity":0.25,"unit":"piece","notes":"very finely diced, rinsed"},
    {"id":"3","name":"fresh jalapeño","quantity":1,"unit":"piece","notes":"seeds removed, minced"},
    {"id":"4","name":"lime juice","quantity":2,"unit":"tbsp","notes":"fresh"},
    {"id":"5","name":"fresh cilantro","quantity":3,"unit":"tbsp","notes":"chopped"},
    {"id":"6","name":"sea salt","quantity":0.75,"unit":"tsp"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Rinse diced onion under cold water for 30 seconds to remove the raw bite. Pat dry. Mash the jalapeño and a pinch of salt in a molcajete or with the back of a fork until a paste forms."},
    {"order":2,"instruction":"Halve avocados and scoop flesh into a bowl. Mash with a fork — go for chunky, not smooth. You want texture."},
    {"order":3,"instruction":"Fold in onion, jalapeño paste and cilantro. Add lime juice and salt. Taste — adjust lime and salt until bright and balanced. Serve immediately with warm tortilla chips."}
  ]'::jsonb,
  null,
  false, now() - interval '15 days'
),
(
  'b0000001-0000-0000-0000-000000000012',
  'a0000001-0000-0000-0000-000000000004',
  'Churros with Chocolate Sauce',
  'Crispy, ridged, cinnamon-sugar coated and dipped into thick dark chocolate. A fairground in your kitchen. The dough takes 5 minutes, the frying takes confidence, the eating takes restraint (which I don''t have).',
  'Mexican',
  '{}'::dietary_pref[], 'beginner', 15, 20, 4, 4.6, 23, 89,
  '[
    {"id":"1","name":"water","quantity":250,"unit":"ml"},
    {"id":"2","name":"plain flour","quantity":150,"unit":"g"},
    {"id":"3","name":"butter","quantity":30,"unit":"g"},
    {"id":"4","name":"salt","quantity":0.5,"unit":"tsp"},
    {"id":"5","name":"eggs","quantity":2,"unit":"piece"},
    {"id":"6","name":"sunflower oil","quantity":1,"unit":"l","notes":"for frying"},
    {"id":"7","name":"caster sugar","quantity":100,"unit":"g"},
    {"id":"8","name":"cinnamon","quantity":2,"unit":"tsp"},
    {"id":"9","name":"dark chocolate","quantity":150,"unit":"g","notes":"70%, for sauce"},
    {"id":"10","name":"double cream","quantity":150,"unit":"ml","notes":"for sauce"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Bring water, butter and salt to a boil. Remove from heat and stir in flour until a smooth, non-sticky dough forms. Cool for 5 minutes then beat in eggs one at a time until glossy."},
    {"order":2,"instruction":"Heat oil to 180°C (355°F). Pipe dough through a star-nozzle piping bag directly into the oil in 10–12cm lengths, snipping with scissors. Fry in batches for 3–4 minutes until deep golden.","timer_mins":4},
    {"order":3,"instruction":"Drain on paper towels for 30 seconds, then immediately roll in cinnamon sugar while still hot."},
    {"order":4,"instruction":"For the sauce: heat cream until steaming, pour over chopped chocolate and stir until silky. Serve churros immediately alongside the warm sauce."}
  ]'::jsonb,
  null,
  false, now() - interval '8 days'
),

-- ── Yuki Tanaka — Japanese ───────────────────────────────────
(
  'b0000001-0000-0000-0000-000000000013',
  'a0000001-0000-0000-0000-000000000005',
  'Tonkotsu Ramen from Scratch',
  'A two-day project and worth every minute. Milky, porky, collagen-rich broth with soft eggs, chashu pork belly and bamboo shoots. This is not a quick dinner. This is an act of devotion.',
  'Japanese',
  '{}'::dietary_pref[], 'advanced', 60, 360, 4, 4.9, 29, 134,
  '[
    {"id":"1","name":"pork trotters","quantity":2,"unit":"piece"},
    {"id":"2","name":"pork neck bones","quantity":1,"unit":"kg"},
    {"id":"3","name":"pork belly","quantity":600,"unit":"g","notes":"for chashu"},
    {"id":"4","name":"ramen noodles","quantity":400,"unit":"g","notes":"fresh or dried"},
    {"id":"5","name":"eggs","quantity":4,"unit":"piece","notes":"for ajitsuke tamago"},
    {"id":"6","name":"soy sauce","quantity":60,"unit":"ml"},
    {"id":"7","name":"mirin","quantity":60,"unit":"ml"},
    {"id":"8","name":"garlic","quantity":6,"unit":"piece"},
    {"id":"9","name":"ginger","quantity":5,"unit":"cm"},
    {"id":"10","name":"spring onions","quantity":4,"unit":"piece"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Day 1: Blanch pork bones and trotters in boiling water for 10 minutes. Rinse thoroughly under cold water to remove impurities. This step is not optional.","timer_mins":10},
    {"order":2,"instruction":"Place cleaned bones in a large pot with cold water. Bring to a vigorous boil and cook, uncovered, for 4–6 hours, adding water to keep bones submerged. The broth should turn milky white. Season with salt.","timer_mins":300},
    {"order":3,"instruction":"For chashu: roll pork belly tightly, tie with kitchen twine. Sear until golden. Braise in soy, mirin, sake and sugar for 90 minutes. Slice and chill overnight.","timer_mins":90},
    {"order":4,"instruction":"Soft boil eggs for exactly 6.5 minutes. Ice bath, peel, and marinate overnight in 1:1 soy and mirin.","timer_mins":7},
    {"order":5,"instruction":"Day 2: Strain and reheat broth. Cook noodles separately. Build bowls: noodles, hot broth, 2 slices chashu, halved egg, bamboo shoots, nori and spring onion. Serve immediately."}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80&fit=crop',
  false, now() - interval '11 days'
),
(
  'b0000001-0000-0000-0000-000000000014',
  'a0000001-0000-0000-0000-000000000005',
  'Salmon Onigiri',
  'The best packed lunch in the world. Perfectly seasoned rice, a pocket of flaked salmon mayo, wrapped in a crisp sheet of nori. Simple, portable, and deeply satisfying in that way only Japanese food can be.',
  'Japanese',
  '{}'::dietary_pref[], 'beginner', 15, 20, 6, 4.3, 19, 77,
  '[
    {"id":"1","name":"Japanese short-grain rice","quantity":300,"unit":"g","notes":"sushi rice"},
    {"id":"2","name":"rice vinegar","quantity":3,"unit":"tbsp"},
    {"id":"3","name":"salt","quantity":1,"unit":"tsp"},
    {"id":"4","name":"sugar","quantity":1,"unit":"tsp"},
    {"id":"5","name":"salmon fillet","quantity":200,"unit":"g"},
    {"id":"6","name":"Japanese mayo","quantity":2,"unit":"tbsp"},
    {"id":"7","name":"nori sheets","quantity":3,"unit":"piece","notes":"cut in half"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Cook rice according to package directions. While hot, gently fold in vinegar, salt and sugar. Fan to cool to just above body temperature."},
    {"order":2,"instruction":"Season salmon with salt and bake at 200°C for 12 minutes. Flake into a bowl, mix with mayo and a tiny pinch of salt.","timer_mins":12},
    {"order":3,"instruction":"Wet hands, salt them lightly. Take a handful of rice, flatten in your palm, add a spoonful of salmon in the centre, close the rice around it and shape into a triangle, pressing firmly."},
    {"order":4,"instruction":"Wrap base in a half-sheet of nori. Eat immediately for maximum crunch, or wrap tightly in clingfilm to pack for lunch."}
  ]'::jsonb,
  null,
  false, now() - interval '6 days'
),
(
  'b0000001-0000-0000-0000-000000000015',
  'a0000001-0000-0000-0000-000000000005',
  'Gyoza (Pan-Fried Dumplings)',
  'The perfect ratio of crispy bottom to tender, steamed top. Pork and cabbage filling seasoned with ginger and sesame. Once you make the dough from scratch you can never go back to shop-bought wrappers.',
  'Japanese',
  '{}'::dietary_pref[], 'intermediate', 45, 15, 4, 4.7, 38, 147,
  '[
    {"id":"1","name":"plain flour","quantity":200,"unit":"g"},
    {"id":"2","name":"boiling water","quantity":100,"unit":"ml"},
    {"id":"3","name":"pork mince","quantity":300,"unit":"g"},
    {"id":"4","name":"napa cabbage","quantity":200,"unit":"g","notes":"finely shredded, salted and squeezed"},
    {"id":"5","name":"garlic","quantity":3,"unit":"piece","notes":"minced"},
    {"id":"6","name":"ginger","quantity":2,"unit":"cm","notes":"grated"},
    {"id":"7","name":"soy sauce","quantity":2,"unit":"tbsp"},
    {"id":"8","name":"sesame oil","quantity":1,"unit":"tbsp"},
    {"id":"9","name":"sake or dry sherry","quantity":1,"unit":"tbsp"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Pour boiling water into flour while stirring with chopsticks. Once cool enough to handle, knead until smooth — about 5 minutes. Rest covered for 30 minutes.","timer_mins":30},
    {"order":2,"instruction":"Salt shredded cabbage, rest 10 minutes, squeeze out all moisture. Mix with pork, garlic, ginger, soy, sesame oil and sake until combined."},
    {"order":3,"instruction":"Roll dough thin, cut into 8cm circles. Place a teaspoon of filling in the centre. Fold and pleat one side to seal into a crescent. Make 24 gyoza."},
    {"order":4,"instruction":"Heat oil in a non-stick pan over medium-high. Add gyoza flat-side down. Fry 2 minutes until golden. Add 60ml water, cover immediately, steam for 3 minutes. Uncover and fry 1 more minute until bases are crispy again.","timer_mins":6}
  ]'::jsonb,
  null,
  false, now() - interval '4 days'
),

-- ── Emma Wilson — Vegan ───────────────────────────────────────
(
  'b0000001-0000-0000-0000-000000000016',
  'a0000001-0000-0000-0000-000000000006',
  'Golden Turmeric Buddha Bowl',
  'Everything a bowl should be: colour, texture, contrast and nourishment. Roasted veg, crispy chickpeas, tahini dressing that you''ll want to put on everything. The kind of lunch that makes you feel genuinely good.',
  'Mediterranean',
  ARRAY['vegan','gluten-free']::dietary_pref[], 'beginner', 15, 30, 2, 4.6, 47, 198,
  '[
    {"id":"1","name":"cooked quinoa","quantity":200,"unit":"g"},
    {"id":"2","name":"canned chickpeas","quantity":400,"unit":"g","notes":"drained and rinsed"},
    {"id":"3","name":"sweet potato","quantity":1,"unit":"piece","notes":"cubed"},
    {"id":"4","name":"broccoli","quantity":200,"unit":"g","notes":"florets"},
    {"id":"5","name":"avocado","quantity":1,"unit":"piece"},
    {"id":"6","name":"turmeric","quantity":1,"unit":"tsp"},
    {"id":"7","name":"tahini","quantity":3,"unit":"tbsp"},
    {"id":"8","name":"lemon juice","quantity":2,"unit":"tbsp"},
    {"id":"9","name":"garlic","quantity":1,"unit":"piece","notes":"minced, for dressing"},
    {"id":"10","name":"pumpkin seeds","quantity":2,"unit":"tbsp"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Toss chickpeas and sweet potato with olive oil, turmeric, salt and pepper. Roast at 200°C for 25–30 minutes, shaking halfway, until chickpeas are crispy and sweet potato is caramelised.","timer_mins":30},
    {"order":2,"instruction":"Steam or roast broccoli for the last 10 minutes alongside the chickpeas.","timer_mins":10},
    {"order":3,"instruction":"Make tahini dressing: whisk tahini, lemon juice, garlic and 3 tbsp water until smooth and pourable. Season generously."},
    {"order":4,"instruction":"Build your bowl: quinoa base, roasted veg and chickpeas, sliced avocado. Drizzle generously with dressing, scatter with pumpkin seeds."}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&fit=crop',
  false, now() - interval '5 days'
),
(
  'b0000001-0000-0000-0000-000000000017',
  'a0000001-0000-0000-0000-000000000006',
  'Cashew Cream Pasta',
  'Silky, rich and entirely plant-based. Soaked cashews blended with nutritional yeast create a sauce so creamy and satisfying that even my cheese-obsessed partner asks for seconds. It sounds too good to be true. It isn''t.',
  'Italian',
  ARRAY['vegan']::dietary_pref[], 'beginner', 10, 15, 4, 4.5, 31, 112,
  '[
    {"id":"1","name":"raw cashews","quantity":150,"unit":"g","notes":"soaked in cold water for 4+ hours"},
    {"id":"2","name":"pasta","quantity":320,"unit":"g","notes":"linguine or penne"},
    {"id":"3","name":"nutritional yeast","quantity":4,"unit":"tbsp"},
    {"id":"4","name":"garlic","quantity":3,"unit":"piece"},
    {"id":"5","name":"lemon juice","quantity":2,"unit":"tbsp"},
    {"id":"6","name":"pasta water","quantity":200,"unit":"ml","notes":"reserved starchy"},
    {"id":"7","name":"baby spinach","quantity":100,"unit":"g"},
    {"id":"8","name":"cherry tomatoes","quantity":200,"unit":"g","notes":"halved"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Cook pasta until al dente, reserving 200ml pasta water before draining."},
    {"order":2,"instruction":"Blend drained cashews, nutritional yeast, garlic, lemon juice, 150ml pasta water and 1 tsp salt until completely smooth and silky — about 2 minutes in a high-speed blender."},
    {"order":3,"instruction":"In the empty pasta pot, warm the cashew cream over low heat. Add pasta and toss to coat, adding pasta water as needed. Add spinach and fold through until wilted."},
    {"order":4,"instruction":"Top with cherry tomatoes, a drizzle of olive oil and freshly cracked black pepper. Serve immediately."}
  ]'::jsonb,
  null,
  false, now() - interval '3 days'
),
(
  'b0000001-0000-0000-0000-000000000018',
  'a0000001-0000-0000-0000-000000000006',
  'Chocolate Avocado Mousse',
  'This sounds like a health food compromise. It isn''t. It''s genuinely the creamiest, most indulgent chocolate mousse I''ve ever had, and it takes 5 minutes to make. The avocado disappears completely behind the chocolate.',
  'American',
  ARRAY['vegan','gluten-free']::dietary_pref[], 'beginner', 5, 0, 4, 4.4, 22, 88,
  '[
    {"id":"1","name":"ripe avocados","quantity":2,"unit":"piece","notes":"very ripe"},
    {"id":"2","name":"cocoa powder","quantity":4,"unit":"tbsp","notes":"good quality"},
    {"id":"3","name":"maple syrup","quantity":3,"unit":"tbsp","notes":"adjust to taste"},
    {"id":"4","name":"vanilla extract","quantity":1,"unit":"tsp"},
    {"id":"5","name":"oat milk or coconut cream","quantity":60,"unit":"ml"},
    {"id":"6","name":"pinch of salt","quantity":1,"unit":"pinch"},
    {"id":"7","name":"raspberries","quantity":100,"unit":"g","notes":"to serve"}
  ]'::jsonb,
  '[
    {"order":1,"instruction":"Blend avocado flesh, cocoa, maple syrup, vanilla, milk and salt until completely smooth — scrape down the sides and blend again until there is zero graininess."},
    {"order":2,"instruction":"Taste and adjust: more cocoa for intensity, more maple for sweetness. Chill for 30 minutes if you can wait — it sets firmer and the flavour deepens."},
    {"order":3,"instruction":"Serve in small glasses or bowls, topped with fresh raspberries and a dusting of cocoa. This will keep in the fridge for up to 2 days."}
  ]'::jsonb,
  null,
  false, now() - interval '1 day'
);


-- ================================================================
-- 4. FOLLOWS  (social graph)
-- ================================================================
INSERT INTO public.follows (follower_id, following_id, created_at) VALUES
  -- Emma has the most followers (everyone follows her)
  ('a0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000006', now()-interval'40 days'),
  ('a0000001-0000-0000-0000-000000000002','a0000001-0000-0000-0000-000000000006', now()-interval'35 days'),
  ('a0000001-0000-0000-0000-000000000003','a0000001-0000-0000-0000-000000000006', now()-interval'28 days'),
  ('a0000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000006', now()-interval'20 days'),
  ('a0000001-0000-0000-0000-000000000005','a0000001-0000-0000-0000-000000000006', now()-interval'12 days'),
  -- Aisha is second most followed
  ('a0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000002', now()-interval'38 days'),
  ('a0000001-0000-0000-0000-000000000003','a0000001-0000-0000-0000-000000000002', now()-interval'25 days'),
  ('a0000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000002', now()-interval'18 days'),
  ('a0000001-0000-0000-0000-000000000005','a0000001-0000-0000-0000-000000000002', now()-interval'10 days'),
  -- Marco followed by many
  ('a0000001-0000-0000-0000-000000000002','a0000001-0000-0000-0000-000000000001', now()-interval'30 days'),
  ('a0000001-0000-0000-0000-000000000003','a0000001-0000-0000-0000-000000000001', now()-interval'22 days'),
  ('a0000001-0000-0000-0000-000000000005','a0000001-0000-0000-0000-000000000001', now()-interval'8 days'),
  -- Sophie
  ('a0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000003', now()-interval'35 days'),
  ('a0000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000003', now()-interval'15 days'),
  ('a0000001-0000-0000-0000-000000000006','a0000001-0000-0000-0000-000000000003', now()-interval'6 days'),
  -- Carlos
  ('a0000001-0000-0000-0000-000000000002','a0000001-0000-0000-0000-000000000004', now()-interval'20 days'),
  ('a0000001-0000-0000-0000-000000000006','a0000001-0000-0000-0000-000000000004', now()-interval'5 days'),
  -- Yuki
  ('a0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000005', now()-interval'12 days'),
  ('a0000001-0000-0000-0000-000000000006','a0000001-0000-0000-0000-000000000005', now()-interval'4 days');


-- ================================================================
-- 5. RATINGS
-- ================================================================
INSERT INTO public.ratings (recipe_id, user_id, stars, created_at) VALUES
  -- Cacio e Pepe (r01) — rated by 4 users
  ('b0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000002',5,now()-interval'38 days'),
  ('b0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000003',5,now()-interval'32 days'),
  ('b0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000004',5,now()-interval'28 days'),
  ('b0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000006',5,now()-interval'20 days'),
  -- Osso Buco (r02)
  ('b0000001-0000-0000-0000-000000000002','a0000001-0000-0000-0000-000000000002',5,now()-interval'30 days'),
  ('b0000001-0000-0000-0000-000000000002','a0000001-0000-0000-0000-000000000005',4,now()-interval'22 days'),
  ('b0000001-0000-0000-0000-000000000002','a0000001-0000-0000-0000-000000000006',5,now()-interval'15 days'),
  -- Tiramisu (r03)
  ('b0000001-0000-0000-0000-000000000003','a0000001-0000-0000-0000-000000000003',5,now()-interval'26 days'),
  ('b0000001-0000-0000-0000-000000000003','a0000001-0000-0000-0000-000000000004',5,now()-interval'18 days'),
  ('b0000001-0000-0000-0000-000000000003','a0000001-0000-0000-0000-000000000005',4,now()-interval'10 days'),
  -- Chicken Tikka Masala (r04)
  ('b0000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000001',5,now()-interval'30 days'),
  ('b0000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000003',5,now()-interval'25 days'),
  ('b0000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000005',5,now()-interval'12 days'),
  -- Crème Brûlée (r07)
  ('b0000001-0000-0000-0000-000000000007','a0000001-0000-0000-0000-000000000001',5,now()-interval'27 days'),
  ('b0000001-0000-0000-0000-000000000007','a0000001-0000-0000-0000-000000000002',5,now()-interval'20 days'),
  ('b0000001-0000-0000-0000-000000000007','a0000001-0000-0000-0000-000000000004',5,now()-interval'14 days'),
  -- Tacos al Pastor (r10)
  ('b0000001-0000-0000-0000-000000000010','a0000001-0000-0000-0000-000000000001',5,now()-interval'18 days'),
  ('b0000001-0000-0000-0000-000000000010','a0000001-0000-0000-0000-000000000002',4,now()-interval'15 days'),
  ('b0000001-0000-0000-0000-000000000010','a0000001-0000-0000-0000-000000000006',5,now()-interval'8 days'),
  -- Buddha Bowl (r16)
  ('b0000001-0000-0000-0000-000000000016','a0000001-0000-0000-0000-000000000001',5,now()-interval'4 days'),
  ('b0000001-0000-0000-0000-000000000016','a0000001-0000-0000-0000-000000000002',4,now()-interval'3 days'),
  ('b0000001-0000-0000-0000-000000000016','a0000001-0000-0000-0000-000000000003',5,now()-interval'2 days'),
  -- Tonkotsu Ramen (r13)
  ('b0000001-0000-0000-0000-000000000013','a0000001-0000-0000-0000-000000000001',5,now()-interval'10 days'),
  ('b0000001-0000-0000-0000-000000000013','a0000001-0000-0000-0000-000000000002',5,now()-interval'8 days'),
  ('b0000001-0000-0000-0000-000000000013','a0000001-0000-0000-0000-000000000006',5,now()-interval'5 days');


-- ================================================================
-- 6. COMMENTS
-- ================================================================
INSERT INTO public.comments (recipe_id, author_id, body, created_at) VALUES
  -- Cacio e Pepe
  ('b0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000002',
   'Made this last night — the pasta water trick is the real secret. Mine finally came out silky instead of clumpy. Thank you Marco!!', now()-interval'35 days'),
  ('b0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000003',
   'I have been making this wrong for years. The tip about not boiling the cream is everything. Magnifique 👏', now()-interval'28 days'),
  ('b0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000006',
   'This converted my (non-vegan) partner to pasta. We make it every Friday now.', now()-interval'18 days'),

  -- Chicken Tikka Masala
  ('b0000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000001',
   'Aisha this is better than any restaurant version I''ve had. The overnight marinade is non-negotiable — learned that the hard way.', now()-interval'28 days'),
  ('b0000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000003',
   'My French soul says I shouldn''t love Indian food this much. My French soul is wrong.', now()-interval'22 days'),
  ('b0000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000005',
   'The charred bits on the chicken make it. Don''t skip grilling them first!', now()-interval'10 days'),

  -- Crème Brûlée
  ('b0000001-0000-0000-0000-000000000007','a0000001-0000-0000-0000-000000000002',
   'I''ve tried so many brûlée recipes and they always overcook. The wobble test is the key. Sophie, this changed everything for me.', now()-interval'24 days'),
  ('b0000001-0000-0000-0000-000000000007','a0000001-0000-0000-0000-000000000004',
   'Used a kitchen torch I bought for this specifically. My family thought I was insane. Now they ask for it every Sunday dinner.', now()-interval'14 days'),

  -- Tacos al Pastor
  ('b0000001-0000-0000-0000-000000000010','a0000001-0000-0000-0000-000000000002',
   'Carlos you''ve ruined me for all other tacos. I can''t eat regular ones anymore.', now()-interval'16 days'),
  ('b0000001-0000-0000-0000-000000000010','a0000001-0000-0000-0000-000000000001',
   'The pineapple in the marinade is genius. Never seen that before — it tenderises everything.', now()-interval'12 days'),

  -- Buddha Bowl
  ('b0000001-0000-0000-0000-000000000016','a0000001-0000-0000-0000-000000000001',
   'I make this every Sunday for meal prep. The crispy chickpeas are addictive.', now()-interval'3 days'),
  ('b0000001-0000-0000-0000-000000000016','a0000001-0000-0000-0000-000000000003',
   'The tahini dressing recipe should be illegal. I put it on everything now.', now()-interval'2 days'),

  -- Tonkotsu Ramen
  ('b0000001-0000-0000-0000-000000000013','a0000001-0000-0000-0000-000000000002',
   'Two days of work. Worth every single second. My partner cried a little. I did too honestly.', now()-interval'7 days'),
  ('b0000001-0000-0000-0000-000000000013','a0000001-0000-0000-0000-000000000001',
   'Yuki, the blanching step makes such a difference. First time my broth came out properly milky white.', now()-interval'5 days'),

  -- Tiramisu
  ('b0000001-0000-0000-0000-000000000003','a0000001-0000-0000-0000-000000000004',
   'No cream! Finally a proper Italian recipe. My Italian colleague approved. That''s the highest praise I can give.', now()-interval'15 days');


-- ================================================================
-- 7. COLLECTIONS & SAVED RECIPES
-- ================================================================
INSERT INTO public.collections (id, user_id, name, is_public, created_at) VALUES
  ('c0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000001','Saved',false,now()-interval'40 days'),
  ('c0000001-0000-0000-0000-000000000002','a0000001-0000-0000-0000-000000000001','Weekend projects',true,now()-interval'30 days'),
  ('c0000001-0000-0000-0000-000000000003','a0000001-0000-0000-0000-000000000002','Saved',false,now()-interval'35 days'),
  ('c0000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000002','Quick weeknights',true,now()-interval'25 days'),
  ('c0000001-0000-0000-0000-000000000005','a0000001-0000-0000-0000-000000000006','Saved',false,now()-interval'5 days');

INSERT INTO public.collection_recipes (collection_id, recipe_id, added_at) VALUES
  ('c0000001-0000-0000-0000-000000000001','b0000001-0000-0000-0000-000000000004',now()-interval'33 days'),
  ('c0000001-0000-0000-0000-000000000001','b0000001-0000-0000-0000-000000000007',now()-interval'28 days'),
  ('c0000001-0000-0000-0000-000000000001','b0000001-0000-0000-0000-000000000013',now()-interval'10 days'),
  ('c0000001-0000-0000-0000-000000000002','b0000001-0000-0000-0000-000000000002',now()-interval'30 days'),
  ('c0000001-0000-0000-0000-000000000002','b0000001-0000-0000-0000-000000000013',now()-interval'10 days'),
  ('c0000001-0000-0000-0000-000000000003','b0000001-0000-0000-0000-000000000001',now()-interval'38 days'),
  ('c0000001-0000-0000-0000-000000000003','b0000001-0000-0000-0000-000000000010',now()-interval'18 days'),
  ('c0000001-0000-0000-0000-000000000004','b0000001-0000-0000-0000-000000000006',now()-interval'17 days'),
  ('c0000001-0000-0000-0000-000000000004','b0000001-0000-0000-0000-000000000011',now()-interval'14 days'),
  ('c0000001-0000-0000-0000-000000000004','b0000001-0000-0000-0000-000000000016',now()-interval'4 days'),
  ('c0000001-0000-0000-0000-000000000005','b0000001-0000-0000-0000-000000000001',now()-interval'4 days'),
  ('c0000001-0000-0000-0000-000000000005','b0000001-0000-0000-0000-000000000007',now()-interval'3 days'),
  ('c0000001-0000-0000-0000-000000000005','b0000001-0000-0000-0000-000000000013',now()-interval'2 days');


-- ================================================================
-- 8. NOTIFICATIONS
-- ================================================================
INSERT INTO public.notifications (user_id, type, actor_id, recipe_id, read, created_at) VALUES
  -- Marco gets followers and comments
  ('a0000001-0000-0000-0000-000000000001','new_follower','a0000001-0000-0000-0000-000000000005',null,true,now()-interval'8 days'),
  ('a0000001-0000-0000-0000-000000000001','recipe_comment','a0000001-0000-0000-0000-000000000002','b0000001-0000-0000-0000-000000000001',true,now()-interval'35 days'),
  ('a0000001-0000-0000-0000-000000000001','recipe_comment','a0000001-0000-0000-0000-000000000003','b0000001-0000-0000-0000-000000000001',false,now()-interval'28 days'),
  ('a0000001-0000-0000-0000-000000000001','recipe_rating','a0000001-0000-0000-0000-000000000004','b0000001-0000-0000-0000-000000000001',false,now()-interval'28 days'),
  ('a0000001-0000-0000-0000-000000000001','recipe_like','a0000001-0000-0000-0000-000000000006','b0000001-0000-0000-0000-000000000003',false,now()-interval'20 days'),
  -- Aisha gets lots of engagement
  ('a0000001-0000-0000-0000-000000000002','new_follower','a0000001-0000-0000-0000-000000000001',null,true,now()-interval'38 days'),
  ('a0000001-0000-0000-0000-000000000002','recipe_comment','a0000001-0000-0000-0000-000000000001','b0000001-0000-0000-0000-000000000004',true,now()-interval'28 days'),
  ('a0000001-0000-0000-0000-000000000002','recipe_comment','a0000001-0000-0000-0000-000000000003','b0000001-0000-0000-0000-000000000004',false,now()-interval'22 days'),
  ('a0000001-0000-0000-0000-000000000002','recipe_like','a0000001-0000-0000-0000-000000000005','b0000001-0000-0000-0000-000000000004',false,now()-interval'12 days'),
  -- Emma gets followers
  ('a0000001-0000-0000-0000-000000000006','new_follower','a0000001-0000-0000-0000-000000000001',null,true,now()-interval'40 days'),
  ('a0000001-0000-0000-0000-000000000006','new_follower','a0000001-0000-0000-0000-000000000004',null,false,now()-interval'5 days'),
  ('a0000001-0000-0000-0000-000000000006','recipe_comment','a0000001-0000-0000-0000-000000000001','b0000001-0000-0000-0000-000000000016',false,now()-interval'3 days'),
  ('a0000001-0000-0000-0000-000000000006','recipe_rating','a0000001-0000-0000-0000-000000000003','b0000001-0000-0000-0000-000000000016',false,now()-interval'2 days');


-- ================================================================
-- 9. SYNC COUNTS  (follower, following, recipe, save, avg_rating)
-- ================================================================

-- recipe_count per user
UPDATE public.users u
SET recipe_count = (SELECT count(*) FROM public.recipes r WHERE r.author_id = u.id);

-- follower_count
UPDATE public.users u
SET follower_count = (SELECT count(*) FROM public.follows f WHERE f.following_id = u.id);

-- following_count
UPDATE public.users u
SET following_count = (SELECT count(*) FROM public.follows f WHERE f.follower_id = u.id);

-- save_count per recipe
UPDATE public.recipes r
SET save_count = (SELECT count(*) FROM public.collection_recipes cr WHERE cr.recipe_id = r.id);

-- avg_rating and rating_count per recipe
UPDATE public.recipes r
SET
  rating_count = (SELECT count(*) FROM public.ratings rt WHERE rt.recipe_id = r.id),
  avg_rating   = COALESCE((SELECT round(avg(stars)::numeric, 2) FROM public.ratings rt WHERE rt.recipe_id = r.id), 0);

-- avg_rating per user (average of their recipes' avg_ratings)
UPDATE public.users u
SET avg_rating = COALESCE(
  (SELECT round(avg(avg_rating)::numeric, 2) FROM public.recipes r WHERE r.author_id = u.id AND rating_count > 0), 0
);

-- ================================================================
-- Done! 6 chefs · 18 recipes · follows · ratings · comments ✓
-- Log in with any @dish.test email, password: dish123
-- ================================================================
