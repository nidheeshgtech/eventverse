# EventVerse

White-label interactive gaming platform for exhibitions, retail activations, winter festivals and corporate events. Visitors scan a QR code, play **Catch the Gift** (a 30-second, skill-based browser game), and earn a sample voucher when they hit the target score. Organisers configure events and watch engagement from a dashboard.

> **Demo build.** All brands, events, rewards and analytics shown are fictional. Vouchers are marked **SAMPLE / DEMO ONLY**. Dashboard analytics in local mode are generated sample data and are always labelled as such.

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 18 + TypeScript + Vite 5 |
| Game | Phaser 3 (lazy-loaded only on game routes) |
| Styling | Tailwind CSS 3, Outfit + Inter |
| Motion | GSAP 3 |
| Charts | Recharts (lazy-loaded with the dashboard) |
| Backend (optional) | Supabase: Postgres + RLS + RPC functions |
| Hosting | Vercel (or any static host), MAMP/Apache supported |

## Quick start

```bash
cd /Applications/MAMP/htdocs/events-2026/eventverse
npm install
npm run dev            # http://localhost:5173
```

No credentials needed. Without Supabase keys the app runs in **local demo mode**: events, plays and vouchers are saved in the browser's localStorage.

### Test on a phone

`npm run dev` prints a **Network** URL (e.g. `http://192.168.1.20:5173`). Open the dashboard through that URL so the QR codes it generates point at your machine, then scan them on a phone that's on the same Wi-Fi network.

## Routes

| Path | What it is |
| --- | --- |
| `/` | Landing page with hero, interactive preview, How it works, benefits, use cases and the Book a Demo form |
| `/demo/winter-festival` | Built-in demo: Aurora Winter Nights (gold/blue, Normal, target 400) |
| `/demo/retail-brand` | Built-in demo: Maison Lumière (rose/gold, Normal, target 420) |
| `/demo/exhibition-booth` | Built-in demo: NovaGrid Systems (blue/violet, Easy, target 300) |
| `/e/:slug` | Events you create in the dashboard |
| `/voucher/:code` | Voucher verification page (where the voucher QR code points). Staff can mark a voucher redeemed here |
| `/dashboard` | Analytics overview |
| `/dashboard/events` | Event list with QR, duplicate, open and delete |
| `/dashboard/events/new`, `/dashboard/events/:id` | Event editor: details, logo, colours, game, rewards, QR, with a live preview |
| `/dashboard/vouchers` | Voucher list, search, redeem, verify by reference |
| `/login` | Admin sign-in (Supabase mode only) |

## Game design

- 30-second round (configurable from 15 to 90s), with a 3-2-1 countdown before it starts.
- Move the basket by touch-drag, mouse or ←/→ (A/D). Press P or Esc to pause.
- Scoring (configurable per event): Gold +30, Blue +20, Purple +10, Snowball −10. The score never drops below 0.
- Difficulty ramps up during each round: items spawn more often, fall faster, and snowballs become more common. Easy, Normal and Hard presets are in `src/config/game.ts`.
- Calibration from automated playtests (Normal, 30s): standing still scores about 250–280, and flawless play scores about 540. A target of about 400 rewards real skill.
- The game auto-pauses when the tab is hidden, the window loses focus or the phone locks. Resuming re-runs the countdown.
- Rendered at device pixel ratio (capped at 2), with object pooling, no physics engine and procedural art (no image or audio files). Sound effects are synthesised with Web Audio.
- Rewards are skill-based only: no paid entry and no random draws. One voucher per visit.

## Project structure

```
src/
  assets/        art.ts: procedural SVG gifts, basket and snowball (shared by React and Phaser)
  components/
    ui/          Button, Field, Icon, Brand, QRCode, Snowfall, Toast…
    layout/      SiteNav, Footer
    landing/     Hero, GamePreview, Sections, BookDemo
    game/        WelcomeScreen, GameStage (HUD/pause), ResultScreen, VoucherCard, Confetti
    dashboard/   DashboardLayout, Charts, KpiCard, QrPanel, BrandingFields
  config/        env, game (scores, difficulty curves, limits), demoEvents, site
  game/          CatchScene.ts (Phaser scene), createGame.ts (boot, DPR scaling, resize)
  hooks/         useAsync, useReveal, useReducedMotion, useDocumentHidden, useAdmin
  pages/         LandingPage, EventPage, VoucherPage, LoginPage, dashboard/*
  services/      data/ (local + Supabase backends), analytics, validation, color, ids, sound, storage
  styles/        index.css (design tokens and glass utilities)
  types/         event, game, analytics
supabase/migrations/0001_eventverse.sql
```

## White-labelling

Each event has its own slug/URL, brand name, logo (PNG/JPG/WebP, resized to 256px, SVG rejected), primary and accent colours, welcome message, start/end dates, game settings and reward settings. Colours are applied through CSS variables (`--brand-primary`, `--brand-accent`), so buttons, glows, gradients, the basket and the QR pages all re-theme. Visitors see an "opens on…" or "ended" screen outside the event dates. Demo events offer a preview override.

## Supabase (optional)

1. Create a Supabase project.
2. Run `supabase/migrations/0001_eventverse.sql`, either in the SQL editor or with `supabase db push`.
3. Create an admin user under **Authentication → Users**, then grant them a role:
   ```sql
   insert into public.admin_users (user_id, role)
   values ('<auth-user-uuid>', 'owner');
   ```
4. Copy `.env.example` to `.env.local` and fill in:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   VITE_PUBLIC_BASE_URL=https://your-domain.com   # used in QR codes
   ```
5. Restart `npm run dev`. The dashboard now requires sign-in at `/login`.

### Data model

| Table | Purpose |
| --- | --- |
| `events` | Brand, slug, colours, dates, `environment` (`demo` / `production`) |
| `event_configs` | `game` and `reward` JSON per event |
| `game_sessions` | One row per visit |
| `scores` | One row per round (start, completion, score, items caught) |
| `vouchers` | Issued vouchers. Unique per visit and per round |
| `voucher_redemptions` | Who redeemed which voucher, and when |
| `admin_users` | Role-based access: `viewer` < `editor` < `admin` < `owner` |
| `demo_requests` | Book a Demo form submissions |

### Security model

- RLS is enabled on every table. Anonymous visitors can only read published events and call the visitor RPCs.
- `register_visit`, `start_play` and `complete_play` are `SECURITY DEFINER` functions. The server checks that a round lasted at least 90% of its configured duration, caps the score at the highest achievable value, and **mints the voucher code server-side**. Clients never insert vouchers.
- `redeem_voucher`, `admin_upsert_event` and `event_analytics` check `is_admin()` roles.
- `event_analytics` reports **production data only**, so demo events never inflate client reports.
- Client-side validation and sanitisation (`src/services/validation.ts`) mirror the database `CHECK` constraints.
- Client-reported scores can't be fully trusted in any browser game. The server-side plausibility checks limit abuse. For high-value rewards, add rate limiting (for example with a Supabase Edge Function) and manual verification at the counter.

Review the policies before you load real customer data.

## Build and deploy

```bash
npm run build      # type-checks, then builds to dist/
npm run preview    # serves the production build locally
```

**Vercel:** import the repo with the framework set to Vite, add the `VITE_*` environment variables, and deploy. `vercel.json` already rewrites all routes to the SPA.

**MAMP / Apache:** run `npm run build:mamp`, then open `http://localhost:8888/events-2026/eventverse/dist/` (adjust the port to your MAMP setting). The bundled `.htaccess` handles deep links like `/demo/winter-festival`.

## Accessibility and performance

- Portrait-first, respects safe-area insets, `100dvh` layouts, no horizontal scroll at 390px.
- `prefers-reduced-motion` turns off the animated snowfall, GSAP intros, confetti, basket tilt, item sway and camera shake.
- Labelled form controls, keyboard play, focus-visible rings, skip link, live regions for results, and dialogs with focus handling.
- The initial landing load is about 50 KB of gzipped JS plus React. Phaser, Recharts, the QR library and Supabase load only on the routes that need them.
