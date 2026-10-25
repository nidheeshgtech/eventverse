import { useState } from 'react';
import { absoluteUrl } from '@/config/env';
import type { EventConfig, Voucher } from '@/types/event';
import { Icon } from '../ui/Icon';
import { QRCode } from '../ui/QRCode';
import { useToast } from '../ui/Toast';

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older mobile browsers / insecure contexts (e.g. LAN IP during testing).
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function VoucherCard({ voucher, event }: { voucher: Voucher; event: EventConfig }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const url = absoluteUrl(`/voucher/${voucher.code}`);

  const copy = async () => {
    const ok = await copyText(voucher.code);
    setCopied(ok);
    toast(ok ? 'Voucher reference copied' : 'Copy failed — please write it down', ok ? 'success' : 'error');
    if (ok) window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.12] to-white/[0.03] shadow-glow">
      {/* SAMPLE ribbon — always visible on demo vouchers */}
      <div className="absolute right-[-44px] top-5 z-10 rotate-45 bg-gold-400 px-12 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-midnight-950 shadow">
        Sample
      </div>

      <div className="p-5 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-accent">{event.brandName}</p>
        <h3 className="mt-1 text-lg font-semibold">{voucher.title}</h3>
        <p className="mt-2 font-display text-4xl font-extrabold text-brand">{voucher.discountLabel}</p>
        {event.reward.description && <p className="mt-1 text-xs text-slate-400">{event.reward.description}</p>}
      </div>

      <div className="relative flex items-center px-3" aria-hidden="true">
        <span className="absolute -left-3 h-6 w-6 rounded-full bg-midnight-950" />
        <span className="h-px flex-1 border-t border-dashed border-white/25" />
        <span className="absolute -right-3 h-6 w-6 rounded-full bg-midnight-950" />
      </div>

      <div className="flex items-center gap-4 p-5 pt-4">
        <QRCode value={url} size={104} label={`QR code for voucher ${voucher.code}`} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Reference</p>
          <p className="mt-0.5 break-all font-mono text-[15px] font-semibold tracking-wider text-white">{voucher.code}</p>
          <button
            type="button"
            onClick={copy}
            className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3 text-xs font-semibold text-white transition hover:bg-white/15"
          >
            <Icon name={copied ? 'check' : 'copy'} size={14} />
            {copied ? 'Copied' : 'Copy reference'}
          </button>
          <p className="mt-2 text-[11px] text-slate-400">Valid until {formatDate(voucher.expiresAt)}</p>
        </div>
      </div>

      <p className="border-t border-white/10 bg-gold-400/10 px-5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-300">
        Sample / Demo only — not a real offer
      </p>
    </article>
  );
}
