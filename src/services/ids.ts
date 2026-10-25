// Crockford-style alphabet: no I, L, O, U to avoid misreads at a booth counter.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function randomChars(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

function checksumChar(input: string): string {
  let sum = 0;
  for (let i = 0; i < input.length; i++) sum = (sum * 31 + input.charCodeAt(i)) % 1000003;
  return ALPHABET[sum % ALPHABET.length];
}

/** e.g. AWN-7K3Q-9XMD-4 — prefix, 8 random chars, 1 check char. */
export function generateVoucherCode(prefix: string): string {
  const p = (prefix || 'EVT').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'EVT';
  const body = randomChars(8);
  const raw = `${p}${body}`;
  return `${p}-${body.slice(0, 4)}-${body.slice(4)}-${checksumChar(raw)}`;
}

/** Validates the shape and check character of a voucher reference. */
export function isValidVoucherCode(code: string): boolean {
  const m = /^([A-Z0-9]{1,5})-([0-9A-HJKMNP-TV-Z]{4})-([0-9A-HJKMNP-TV-Z]{4})-([0-9A-HJKMNP-TV-Z])$/.exec(code);
  if (!m) return false;
  return checksumChar(`${m[1]}${m[2]}${m[3]}`) === m[4];
}

export function uuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
