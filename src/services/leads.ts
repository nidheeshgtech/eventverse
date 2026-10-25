import type { DemoRequest } from '@/types/event';

/**
 * Book-a-Demo leads are emailed through FormSubmit (https://formsubmit.co), so the
 * static site needs no backend. The first submission from a new domain sends an
 * activation email to the inbox; nothing is delivered until that link is clicked.
 * After activation FormSubmit offers a random alias — set VITE_LEADS_ENDPOINT to
 * https://formsubmit.co/ajax/<alias> to keep the address out of the bundle.
 */
const ENDPOINT =
  (import.meta.env.VITE_LEADS_ENDPOINT as string | undefined)?.trim() || 'https://formsubmit.co/ajax/hello.nidheesh@gmail.com';

export async function emailDemoRequest(request: DemoRequest): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: `EventVerse demo request — ${request.company}`,
      _template: 'table',
      _replyto: request.email,
      Name: request.name,
      Email: request.email,
      Company: request.company,
      Phone: request.phone || '—',
      'Event type': request.eventType,
      Message: request.message || '—',
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
  if (!res.ok || String(body.success) !== 'true') throw new Error(body.message || `Lead email failed (${res.status})`);
}
