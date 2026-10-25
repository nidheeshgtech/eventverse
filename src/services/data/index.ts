import { env } from '@/config/env';
import { LocalDataService } from './localService';
import type { DataService } from './types';

let backend: Promise<DataService> | null = null;

/**
 * Supabase (and its SDK) is only downloaded when credentials are configured,
 * so local demo mode keeps the initial bundle small.
 */
function load(): Promise<DataService> {
  backend ??= env.supabaseEnabled
    ? Promise.all([import('./supabaseService'), import('../supabase')]).then(([m, s]) => new m.SupabaseDataService(s.getSupabase()!))
    : Promise.resolve(new LocalDataService());
  return backend;
}

type Method = Exclude<keyof DataService, 'mode'>;

function call<K extends Method>(name: K) {
  return ((...args: unknown[]) => load().then((b) => (b[name] as (...a: unknown[]) => unknown).apply(b, args))) as DataService[K];
}

/** The active backend: Supabase when configured, otherwise browser-only demo mode. */
export const data: DataService = {
  mode: env.supabaseEnabled ? 'supabase' : 'local',
  listEvents: call('listEvents'),
  getEventBySlug: call('getEventBySlug'),
  saveEvent: call('saveEvent'),
  deleteEvent: call('deleteEvent'),
  registerVisit: call('registerVisit'),
  startPlay: call('startPlay'),
  completePlay: call('completePlay'),
  getVoucher: call('getVoucher'),
  redeemVoucher: call('redeemVoucher'),
  listVouchers: call('listVouchers'),
  getAnalytics: call('getAnalytics'),
  getDeviceActivity: call('getDeviceActivity'),
  submitDemoRequest: call('submitDemoRequest'),
};

export type { DataService, AnalyticsResult, VoucherLookup } from './types';
