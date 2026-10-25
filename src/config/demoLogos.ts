import { svgDataUri } from '@/assets/art';

/**
 * Logos for the fictional demo brands, drawn as full-bleed SVG tiles.
 * Text uses system serif/sans fonts because SVGs loaded via <img> can't use web fonts.
 */

const maisonAmbre = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe7a1"/><stop offset=".5" stop-color="#d4af37"/><stop offset="1" stop-color="#9c7a1e"/></linearGradient></defs>
<rect width="256" height="256" rx="56" fill="#0b0a08"/>
<circle cx="128" cy="112" r="70" fill="none" stroke="url(#g)" stroke-width="3"/>
<circle cx="128" cy="112" r="62" fill="none" stroke="url(#g)" stroke-width="1" opacity=".6"/>
<text x="128" y="134" text-anchor="middle" font-family="Didot, 'Bodoni 72', Georgia, serif" font-size="66" fill="url(#g)" letter-spacing="2">MA</text>
<text x="128" y="214" text-anchor="middle" font-family="Didot, Georgia, serif" font-size="19" fill="#d4af37" letter-spacing="7">PARFUMS</text>
</svg>`;

const auroraFestival = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b1f7a"/><stop offset="1" stop-color="#0b4f9c"/></linearGradient>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1bf"/><stop offset="1" stop-color="#e8b84a"/></linearGradient>
</defs>
<rect width="256" height="256" rx="56" fill="url(#bg)"/>
<g stroke="url(#g)" stroke-width="7" stroke-linecap="round" fill="none" transform="translate(128 108)">
<path d="M0-58V58M-50-29L50 29M-50 29L50-29"/>
<path d="M-12-46L0-34 12-46M-12 46L0 34 12 46M-46-12l10 12-14 4M46 12l-10-12 14-4M-46 12l14-4-10-12M46-12l-14 4 10 12" stroke-width="5"/>
</g>
<circle cx="128" cy="108" r="9" fill="#fff"/>
<text x="128" y="214" text-anchor="middle" font-family="'Avenir Next', 'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="26" fill="#fff" letter-spacing="6">AURORA</text>
</svg>`;

const novaGrid = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>
<rect width="256" height="256" rx="56" fill="#0f172a"/>
<rect x="1.5" y="1.5" width="253" height="253" rx="54.5" fill="none" stroke="#1e293b" stroke-width="3"/>
<g transform="translate(128 104)">
<path d="M0-56l48 28v56L0 56-48 28v-56z" fill="none" stroke="url(#g)" stroke-width="8" stroke-linejoin="round"/>
<path d="M0-56V0M0 0l48 28M0 0l-48 28" stroke="url(#g)" stroke-width="6" stroke-linecap="round" opacity=".55"/>
<circle r="9" fill="#fff"/>
</g>
<text x="128" y="212" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="25" fill="#e2e8f0" letter-spacing="5">NOVAGRID</text>
</svg>`;

export const DEMO_LOGOS = {
  maisonAmbre: svgDataUri(maisonAmbre),
  auroraFestival: svgDataUri(auroraFestival),
  novaGrid: svgDataUri(novaGrid),
};
