import { DEMO_SLUGS } from './demoEvents';

export const SITE = {
  name: 'EventVerse',
  /** Fictional company details for the demo. */
  company: 'EventVerse Interactive (demo)',
  email: 'hello@eventverse.example',
  city: 'Dubai, UAE',
};

export const NAV_LINKS = [
  { href: '#demos', label: 'Demos' },
  { href: '#how', label: 'How it works' },
  { href: '#benefits', label: 'Benefits' },
  { href: '#book', label: 'Book a demo' },
];

export const EVENT_TYPES = [
  'Winter / seasonal festival',
  'Retail activation',
  'Exhibition booth',
  'Corporate event',
  'Mall campaign',
  'Other',
];

/** Public visitor path for an event. Built-in demos live under /demo, client events under /e. */
export function eventPath(slug: string): string {
  return DEMO_SLUGS.has(slug) ? `/demo/${slug}` : `/e/${slug}`;
}
