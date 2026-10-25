-- Adds the per-event visual style preset (festive | luxury | corporate).
-- Existing rows default to 'festive', which matches their current look.

alter table public.events
  add column visual_style text not null default 'festive'
  check (visual_style in ('festive', 'luxury', 'corporate'));

create or replace function public.admin_upsert_event(p_event jsonb, p_game jsonb, p_reward jsonb)
returns public.events
language plpgsql security definer set search_path = public as $$
declare
  ev public.events;
begin
  if not public.is_admin('editor') then raise exception 'Not authorised'; end if;
  insert into public.events (
    id, slug, environment, brand_name, event_name, tagline, welcome_message, venue,
    logo_url, primary_color, accent_color, visual_style, start_date, end_date, created_by
  ) values (
    coalesce(nullif(p_event ->> 'id', '')::uuid, gen_random_uuid()),
    p_event ->> 'slug', coalesce(p_event ->> 'environment', 'production'),
    p_event ->> 'brand_name', p_event ->> 'event_name', coalesce(p_event ->> 'tagline', ''),
    coalesce(p_event ->> 'welcome_message', ''), coalesce(p_event ->> 'venue', ''),
    p_event ->> 'logo_url', p_event ->> 'primary_color', p_event ->> 'accent_color',
    coalesce(p_event ->> 'visual_style', 'festive'),
    (p_event ->> 'start_date')::date, (p_event ->> 'end_date')::date, auth.uid()
  )
  on conflict (id) do update set
    slug = excluded.slug, environment = excluded.environment, brand_name = excluded.brand_name,
    event_name = excluded.event_name, tagline = excluded.tagline, welcome_message = excluded.welcome_message,
    venue = excluded.venue, logo_url = excluded.logo_url, primary_color = excluded.primary_color,
    accent_color = excluded.accent_color, visual_style = excluded.visual_style,
    start_date = excluded.start_date, end_date = excluded.end_date, updated_at = now()
  returning * into ev;

  insert into public.event_configs (event_id, game, reward) values (ev.id, p_game, p_reward)
  on conflict (event_id) do update set game = excluded.game, reward = excluded.reward, updated_at = now();
  return ev;
end $$;
