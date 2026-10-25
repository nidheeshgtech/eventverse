-- EventVerse schema for Supabase (Postgres 15+)
-- Apply with: supabase db push   (or paste into the SQL editor)
--
-- Security model
--   * Visitors use the anon key. They can read published events and call the
--     game RPCs below. They cannot read or write sessions, scores or vouchers directly.
--   * Scores are validated and vouchers are minted server-side (SECURITY DEFINER),
--     so a visitor cannot forge a voucher by editing client code.
--   * Staff access is granted through admin_users roles: owner > admin > editor > viewer.
--   * Every activity row carries `environment` ('demo' | 'production') so demo
--     data never mixes with real customer analytics.

create extension if not exists pgcrypto with schema extensions;

-- ─────────────────────────────────────────────────────────────── roles
create type public.admin_role as enum ('viewer', 'editor', 'admin', 'owner');

create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       public.admin_role not null default 'viewer',
  created_at timestamptz not null default now()
);

create or replace function public.admin_rank(r public.admin_role)
returns int language sql immutable as $$
  select case r when 'viewer' then 1 when 'editor' then 2 when 'admin' then 3 when 'owner' then 4 end
$$;

-- True when the signed-in user holds at least `min_role`.
create or replace function public.is_admin(min_role public.admin_role default 'viewer')
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and public.admin_rank(a.role) >= public.admin_rank(min_role)
  )
$$;

-- ─────────────────────────────────────────────────────────────── events
create table public.events (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$'),
  environment     text not null default 'production' check (environment in ('demo', 'production')),
  brand_name      text not null check (char_length(brand_name) between 2 and 80),
  event_name      text not null check (char_length(event_name) between 2 and 100),
  tagline         text not null default '' check (char_length(tagline) <= 120),
  welcome_message text not null default '' check (char_length(welcome_message) <= 280),
  venue           text not null default '' check (char_length(venue) <= 120),
  logo_url        text check (logo_url is null or char_length(logo_url) <= 400000),
  primary_color   text not null default '#f9d36b' check (primary_color ~ '^#[0-9a-fA-F]{6}$'),
  accent_color    text not null default '#4cc3ff' check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  start_date      date not null,
  end_date        date not null,
  is_published    boolean not null default true,
  created_by      uuid references auth.users (id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (end_date >= start_date)
);

create table public.event_configs (
  event_id   uuid primary key references public.events (id) on delete cascade,
  game       jsonb not null,
  reward     jsonb not null,
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────── activity
-- One row per visitor page open (a "visit").
create table public.game_sessions (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  environment text not null check (environment in ('demo', 'production')),
  created_at  timestamptz not null default now()
);
create index on public.game_sessions (event_id, created_at);

-- One row per round played.
create table public.scores (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.game_sessions (id) on delete cascade,
  event_id     uuid not null references public.events (id) on delete cascade,
  environment  text not null check (environment in ('demo', 'production')),
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  score        int check (score >= 0),
  caught       jsonb
);
create index on public.scores (event_id, started_at);

create table public.vouchers (
  code           text primary key,
  event_id       uuid not null references public.events (id) on delete cascade,
  session_id     uuid not null unique references public.game_sessions (id) on delete cascade, -- max one voucher per visit
  score_id       uuid not null unique references public.scores (id) on delete cascade,
  environment    text not null check (environment in ('demo', 'production')),
  score          int not null,
  title          text not null,
  discount_label text not null,
  issued_at      timestamptz not null default now(),
  expires_at     timestamptz not null
);
create index on public.vouchers (event_id, issued_at);

create table public.voucher_redemptions (
  id           uuid primary key default gen_random_uuid(),
  voucher_code text not null unique references public.vouchers (code) on delete cascade,
  redeemed_at  timestamptz not null default now(),
  redeemed_by  uuid references auth.users (id)
);

create table public.demo_requests (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 500),
  email      text not null check (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' and char_length(email) <= 254),
  company    text not null check (char_length(company) between 2 and 500),
  phone      text check (phone is null or phone ~ '^[+()0-9\s-]{7,20}$'),
  event_type text not null check (char_length(event_type) <= 60),
  message    text check (message is null or char_length(message) <= 1000),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────── RLS
alter table public.admin_users         enable row level security;
alter table public.events              enable row level security;
alter table public.event_configs       enable row level security;
alter table public.game_sessions       enable row level security;
alter table public.scores              enable row level security;
alter table public.vouchers            enable row level security;
alter table public.voucher_redemptions enable row level security;
alter table public.demo_requests       enable row level security;

create policy "admins read admin list" on public.admin_users
  for select using (user_id = auth.uid() or public.is_admin('admin'));
create policy "owners manage admins" on public.admin_users
  for all using (public.is_admin('owner')) with check (public.is_admin('owner'));

create policy "published events are public" on public.events
  for select using (is_published or public.is_admin('viewer'));
create policy "editors insert events" on public.events
  for insert with check (public.is_admin('editor'));
create policy "editors update events" on public.events
  for update using (public.is_admin('editor')) with check (public.is_admin('editor'));
create policy "admins delete events" on public.events
  for delete using (public.is_admin('admin'));

create policy "configs follow event visibility" on public.event_configs
  for select using (exists (
    select 1 from public.events e where e.id = event_id and (e.is_published or public.is_admin('viewer'))
  ));
create policy "editors write configs" on public.event_configs
  for all using (public.is_admin('editor')) with check (public.is_admin('editor'));

-- Activity tables: staff read-only. Visitors only reach them through the RPCs.
create policy "staff read sessions" on public.game_sessions for select using (public.is_admin('viewer'));
create policy "staff read scores" on public.scores for select using (public.is_admin('viewer'));
create policy "staff read vouchers" on public.vouchers for select using (public.is_admin('viewer'));
create policy "staff read redemptions" on public.voucher_redemptions for select using (public.is_admin('viewer'));

create policy "anyone can request a demo" on public.demo_requests for insert with check (true);
create policy "admins read demo requests" on public.demo_requests for select using (public.is_admin('admin'));

-- ─────────────────────────────────────────────────────────────── voucher codes
-- Must match src/services/ids.ts so codes validate on both sides.
create or replace function public.voucher_check_char(raw text)
returns text language plpgsql immutable as $$
declare
  alphabet constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  s bigint := 0;
  i int;
begin
  for i in 1..char_length(raw) loop
    s := (s * 31 + ascii(substr(raw, i, 1))) % 1000003;
  end loop;
  return substr(alphabet, (s % 32)::int + 1, 1);
end $$;

create or replace function public.generate_voucher_code(prefix text)
returns text language plpgsql volatile as $$
declare
  alphabet constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  bytes bytea := extensions.gen_random_bytes(8);
  p text := coalesce(nullif(left(regexp_replace(upper(prefix), '[^A-Z0-9]', '', 'g'), 5), ''), 'EVT');
  body text := '';
  i int;
begin
  for i in 0..7 loop
    body := body || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return p || '-' || left(body, 4) || '-' || right(body, 4) || '-' || public.voucher_check_char(p || body);
end $$;

-- ─────────────────────────────────────────────────────────────── visitor RPCs
create or replace function public.register_visit(p_event_id uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  ev public.events;
  sid uuid;
begin
  select * into ev from public.events where id = p_event_id and is_published;
  if not found then raise exception 'Event not available'; end if;
  if ev.environment = 'production' and current_date not between ev.start_date and ev.end_date then
    raise exception 'Event is not live';
  end if;
  insert into public.game_sessions (event_id, environment) values (ev.id, ev.environment) returning id into sid;
  return sid;
end $$;

create or replace function public.start_play(p_session_id uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  s public.game_sessions;
  plays int;
  pid uuid;
begin
  select * into s from public.game_sessions where id = p_session_id;
  if not found or s.created_at < now() - interval '6 hours' then raise exception 'Session expired'; end if;
  select count(*) into plays from public.scores where session_id = s.id;
  if plays >= 25 then raise exception 'Play limit reached for this visit'; end if;
  insert into public.scores (session_id, event_id, environment)
    values (s.id, s.event_id, s.environment) returning id into pid;
  return pid;
end $$;

create or replace function public.complete_play(p_score_id uuid, p_score int, p_caught jsonb)
returns table (
  code text, event_id uuid, event_slug text, session_id uuid, score int, title text,
  discount_label text, issued_at timestamptz, expires_at timestamptz, redeemed_at timestamptz, environment text
)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  sc public.scores;
  cfg public.event_configs;
  ev public.events;
  duration_s int;
  best int;
  max_score int;
  final int;
  elapsed numeric;
  v public.vouchers;
begin
  select * into sc from public.scores s where s.id = p_score_id for update;
  if not found then raise exception 'Unknown play'; end if;
  if sc.completed_at is not null then raise exception 'Play already completed'; end if;

  select * into cfg from public.event_configs c where c.event_id = sc.event_id;
  select * into ev from public.events e where e.id = sc.event_id;
  duration_s := coalesce((cfg.game ->> 'durationSec')::int, 30);
  elapsed := extract(epoch from now() - sc.started_at);

  -- Plausibility: the round must have actually run, and the score must be reachable.
  if elapsed < duration_s * 0.9 or elapsed > duration_s + 900 then
    raise exception 'Play duration out of range';
  end if;
  select greatest(max(value::int), 0) into best from jsonb_each_text(cfg.game -> 'scores');
  max_score := ceil(duration_s * 1000.0 / 300) * best;
  final := least(greatest(coalesce(p_score, 0), 0), max_score);

  update public.scores s set completed_at = now(), score = final, caught = p_caught where s.id = sc.id;

  if coalesce((cfg.reward ->> 'enabled')::boolean, false)
     and final >= coalesce((cfg.reward ->> 'threshold')::int, 2147483647)
     and not exists (select 1 from public.vouchers x where x.session_id = sc.session_id) then
    insert into public.vouchers (code, event_id, session_id, score_id, environment, score, title, discount_label, expires_at)
    values (
      public.generate_voucher_code(cfg.reward ->> 'codePrefix'),
      sc.event_id, sc.session_id, sc.id, sc.environment, final,
      coalesce(cfg.reward ->> 'title', 'Reward'),
      coalesce(cfg.reward ->> 'discountLabel', ''),
      now() + make_interval(days => coalesce((cfg.reward ->> 'validDays')::int, 14))
    )
    returning * into v;

    return query select v.code, v.event_id, ev.slug, v.session_id, v.score, v.title,
      v.discount_label, v.issued_at, v.expires_at, null::timestamptz, v.environment;
  end if;
end $$;

-- Public voucher lookup for the QR verification page (only non-sensitive columns).
create or replace function public.get_voucher(p_code text)
returns table (
  code text, event_id uuid, event_slug text, session_id uuid, score int, title text,
  discount_label text, issued_at timestamptz, expires_at timestamptz, redeemed_at timestamptz, environment text
)
language sql stable security definer set search_path = public as $$
  select v.code, v.event_id, e.slug, v.session_id, v.score, v.title, v.discount_label,
         v.issued_at, v.expires_at, r.redeemed_at, v.environment
  from public.vouchers v
  join public.events e on e.id = v.event_id
  left join public.voucher_redemptions r on r.voucher_code = v.code
  where v.code = upper(p_code)
$$;

-- ─────────────────────────────────────────────────────────────── staff RPCs
create or replace function public.redeem_voucher(p_code text)
returns table (
  code text, event_id uuid, event_slug text, session_id uuid, score int, title text,
  discount_label text, issued_at timestamptz, expires_at timestamptz, redeemed_at timestamptz, environment text
)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  v public.vouchers;
begin
  if not public.is_admin('editor') then raise exception 'Not authorised'; end if;
  select * into v from public.vouchers x where x.code = upper(p_code) for update;
  if not found then raise exception 'Voucher not found'; end if;
  if v.expires_at < now() then raise exception 'Voucher has expired'; end if;
  if exists (select 1 from public.voucher_redemptions r where r.voucher_code = v.code) then
    raise exception 'Voucher already redeemed';
  end if;
  insert into public.voucher_redemptions (voucher_code, redeemed_by) values (v.code, auth.uid());
  return query select * from public.get_voucher(v.code);
end $$;

create or replace function public.admin_upsert_event(p_event jsonb, p_game jsonb, p_reward jsonb)
returns public.events
language plpgsql security definer set search_path = public as $$
declare
  ev public.events;
begin
  if not public.is_admin('editor') then raise exception 'Not authorised'; end if;
  insert into public.events (
    id, slug, environment, brand_name, event_name, tagline, welcome_message, venue,
    logo_url, primary_color, accent_color, start_date, end_date, created_by
  ) values (
    coalesce(nullif(p_event ->> 'id', '')::uuid, gen_random_uuid()),
    p_event ->> 'slug', coalesce(p_event ->> 'environment', 'production'),
    p_event ->> 'brand_name', p_event ->> 'event_name', coalesce(p_event ->> 'tagline', ''),
    coalesce(p_event ->> 'welcome_message', ''), coalesce(p_event ->> 'venue', ''),
    p_event ->> 'logo_url', p_event ->> 'primary_color', p_event ->> 'accent_color',
    (p_event ->> 'start_date')::date, (p_event ->> 'end_date')::date, auth.uid()
  )
  on conflict (id) do update set
    slug = excluded.slug, environment = excluded.environment, brand_name = excluded.brand_name,
    event_name = excluded.event_name, tagline = excluded.tagline, welcome_message = excluded.welcome_message,
    venue = excluded.venue, logo_url = excluded.logo_url, primary_color = excluded.primary_color,
    accent_color = excluded.accent_color, start_date = excluded.start_date, end_date = excluded.end_date,
    updated_at = now()
  returning * into ev;

  insert into public.event_configs (event_id, game, reward) values (ev.id, p_game, p_reward)
  on conflict (event_id) do update set game = excluded.game, reward = excluded.reward, updated_at = now();
  return ev;
end $$;

-- Dashboard figures. Pass p_event_id = null for all events. Production data only.
create or replace function public.event_analytics(p_event_id uuid, p_days int default 14)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  since date := current_date - (p_days - 1);
  result jsonb;
begin
  if not public.is_admin('viewer') then raise exception 'Not authorised'; end if;

  with
  s as (select * from public.game_sessions where environment = 'production' and (p_event_id is null or event_id = p_event_id)),
  p as (select * from public.scores where environment = 'production' and (p_event_id is null or event_id = p_event_id)),
  v as (
    select x.*, r.redeemed_at from public.vouchers x
    left join public.voucher_redemptions r on r.voucher_code = x.code
    where x.environment = 'production' and (p_event_id is null or x.event_id = p_event_id)
  ),
  days as (select generate_series(since, current_date, interval '1 day')::date as d)
  select jsonb_build_object(
    'visits', (select count(*) from s),
    'started', (select count(*) from p),
    'completed', (select count(*) from p where completed_at is not null),
    'averageScore', coalesce((select round(avg(score)) from p where completed_at is not null), 0),
    'vouchersIssued', (select count(*) from v),
    'vouchersRedeemed', (select count(*) from v where redeemed_at is not null),
    'daily', (
      select jsonb_agg(jsonb_build_object(
        'date', to_char(d, 'YYYY-MM-DD'),
        'visits', (select count(*) from s where s.created_at::date = d),
        'started', (select count(*) from p where p.started_at::date = d),
        'completed', (select count(*) from p where p.completed_at::date = d),
        'vouchers', (select count(*) from v where v.issued_at::date = d),
        'redeemed', (select count(*) from v where v.redeemed_at::date = d)
      ) order by d) from days
    ),
    'scoreBuckets', (
      select jsonb_agg(jsonb_build_object('range', label, 'players', n) order by i)
      from (
        select i, label, (
          select count(*) from p
          where completed_at is not null and least(floor(score / 100), 5) = i
        ) as n
        from (values (0, '0–99'), (1, '100–199'), (2, '200–299'), (3, '300–399'), (4, '400–499'), (5, '500+')) b(i, label)
      ) t
    )
  ) into result;
  return result;
end $$;

-- Lock down function execution to the roles that need it.
revoke all on function public.generate_voucher_code(text) from public, anon, authenticated;
revoke all on function public.voucher_check_char(text) from public, anon, authenticated;
grant execute on function public.register_visit(uuid) to anon, authenticated;
grant execute on function public.start_play(uuid) to anon, authenticated;
grant execute on function public.complete_play(uuid, int, jsonb) to anon, authenticated;
grant execute on function public.get_voucher(text) to anon, authenticated;
grant execute on function public.redeem_voucher(text) to authenticated;
grant execute on function public.admin_upsert_event(jsonb, jsonb, jsonb) to authenticated;
grant execute on function public.event_analytics(uuid, int) to authenticated;
