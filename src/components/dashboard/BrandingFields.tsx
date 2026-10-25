import { useRef, useState } from 'react';
import { isHexColor } from '@/services/color';
import { processLogo } from '@/services/validation';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

const PRESETS = ['#f9d36b', '#4cc3ff', '#a57bff', '#f2b8c6', '#34d399', '#ff8a5c', '#e5e7eb'];

export function ColorField({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
  const [text, setText] = useState(value);
  const shown = text.toLowerCase() === value.toLowerCase() ? text : value;

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-200">{label}</p>
      <div className="flex items-center gap-3">
        <label className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 ring-white/15" style={{ background: value }}>
          <span className="sr-only">Pick {label.toLowerCase()}</span>
          <input type="color" value={isHexColor(value) ? value : '#000000'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
        <input
          aria-label={`${label} hex value`}
          value={shown}
          maxLength={7}
          onChange={(e) => {
            const v = e.target.value.trim();
            setText(v);
            if (isHexColor(v)) onChange(v.toLowerCase());
          }}
          className="w-28 rounded-xl border border-white/10 bg-midnight-950/60 px-3 py-3 font-mono text-sm uppercase text-white focus:border-electric-400/60 focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setText(c);
                onChange(c);
              }}
              aria-label={`Use ${c}`}
              className={`h-6 w-6 rounded-full ring-1 transition hover:scale-110 ${value === c ? 'ring-2 ring-white' : 'ring-white/20'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

export function LogoUploader({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await processLogo(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-200">Client logo</p>
      <div
        className="flex items-center gap-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handle(e.dataTransfer.files[0]);
        }}
      >
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/95">
          {value ? <img src={value} alt="Logo preview" className="max-h-full max-w-full object-contain" /> : <Icon name="upload" size={22} className="text-slate-400" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-200">{value ? 'Logo uploaded' : 'Drop an image or browse'}</p>
          <p className="text-xs text-slate-400">PNG, JPG or WebP · max 1 MB · resized to 256px</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => input.current?.click()} disabled={busy}>
              {busy ? 'Processing…' : value ? 'Replace' : 'Upload'}
            </Button>
            {value && (
              <Button size="sm" variant="ghost" onClick={() => onChange(null)}>
                Remove
              </Button>
            )}
          </div>
        </div>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => void handle(e.target.files?.[0])} />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
