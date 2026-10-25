const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';
const publicBase = (import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined)?.trim() ?? '';

export const env = {
  supabaseUrl: url,
  supabaseAnonKey: anonKey,
  /** True only when both Supabase values are present. Otherwise the app runs in local demo mode. */
  supabaseEnabled: Boolean(url && anonKey),
  /** Router basename, derived from Vite's base (e.g. "/events-2026/eventverse/dist"). */
  basePath: import.meta.env.BASE_URL.replace(/\/$/, ''),
  publicBase,
};

/** Absolute URL for an in-app path, used for QR codes and share links. */
export function absoluteUrl(path: string): string {
  const origin = env.publicBase || (typeof window !== 'undefined' ? window.location.origin : '');
  const base = env.publicBase ? '' : env.basePath;
  return `${origin.replace(/\/$/, '')}${base}${path.startsWith('/') ? path : `/${path}`}`;
}
