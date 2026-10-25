import { useEffect, useState } from 'react';
import QR from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  label: string;
  dark?: string;
  light?: string;
  className?: string;
}

export async function qrDataUrl(value: string, size = 512, dark = '#0a0b26', light = '#ffffff'): Promise<string> {
  return QR.toDataURL(value, { width: size, margin: 2, errorCorrectionLevel: 'M', color: { dark, light } });
}

/** Scannable QR code rendered as a PNG data URL (dark on light for reliable scanning). */
export function QRCode({ value, size = 200, label, dark = '#0a0b26', light = '#ffffff', className = '' }: QRCodeProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    qrDataUrl(value, size * 2, dark, light)
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setSrc(null));
    return () => {
      alive = false;
    };
  }, [value, size, dark, light]);

  return (
    <div className={`inline-grid place-items-center rounded-2xl bg-white p-2 ${className}`} style={{ width: size + 16, height: size + 16 }}>
      {src ? (
        <img src={src} width={size} height={size} alt={label} className="block" />
      ) : (
        <span className="h-full w-full animate-pulse rounded-xl bg-slate-200" aria-hidden="true" />
      )}
    </div>
  );
}

export async function downloadQr(value: string, filename: string): Promise<void> {
  const url = await qrDataUrl(value, 1024);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}
