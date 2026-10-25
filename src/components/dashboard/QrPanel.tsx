import { useEffect, useRef } from 'react';
import { absoluteUrl } from '@/config/env';
import { eventPath } from '@/config/site';
import type { EventConfig } from '@/types/event';
import { copyText } from '../game/VoucherCard';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { downloadQr, QRCode } from '../ui/QRCode';
import { useToast } from '../ui/Toast';

/** Event URL + scannable QR with copy and high-res PNG download. */
export function QrPanel({ event, size = 180 }: { event: Pick<EventConfig, 'slug' | 'brandName'>; size?: number }) {
  const toast = useToast();
  const url = absoluteUrl(eventPath(event.slug));
  const isLocalhost = /\/\/(localhost|127\.0\.0\.1)/.test(url);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <QRCode value={url} size={size} label={`QR code linking to ${event.brandName}`} />
      <div className="w-full">
        <p className="break-all rounded-xl bg-white/5 px-3 py-2 font-mono text-xs text-slate-200">{url}</p>
        {isLocalhost && (
          <p className="mt-2 text-[11px] text-gold-300">
            Tip: localhost only works on this computer. Open the dev server via your LAN IP (shown by <code>npm run dev</code>) or deploy, so phones can scan it.
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          icon={<Icon name="copy" size={14} />}
          onClick={async () => toast((await copyText(url)) ? 'Link copied' : 'Copy failed', 'success')}
        >
          Copy link
        </Button>
        <Button size="sm" icon={<Icon name="download" size={14} />} onClick={() => void downloadQr(url, `${event.slug}-qr.png`)}>
          Download PNG
        </Button>
      </div>
    </div>
  );
}

export function QrDialog({ event, onClose }: { event: EventConfig; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    d.showModal();
    const onCancel = () => onClose();
    d.addEventListener('close', onCancel);
    return () => d.removeEventListener('close', onCancel);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="qr-title"
      className="glass-strong w-[min(92vw,380px)] rounded-3xl p-0 text-white backdrop:bg-midnight-950/70 backdrop:backdrop-blur-sm"
      onClick={(e) => e.target === ref.current && ref.current?.close()}
    >
      <div className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="qr-title" className="text-lg font-semibold">
            {event.brandName}
          </h2>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10">
            <Icon name="close" size={18} />
          </button>
        </div>
        <QrPanel event={event} />
      </div>
    </dialog>
  );
}
