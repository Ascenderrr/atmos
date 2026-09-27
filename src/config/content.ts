// Central content configuration — the single source of truth for all visible
// copy. Used by the WebGL experience, DOM typography, the static fallback,
// and SEO metadata. All strings here are ORIGINAL temporary placeholders and
// are meant to be replaced; never scatter copy across components.

export interface SiteContent {
  kicker: string;
  heroTitle: string;
  heroLede: string;
  buildNote: string;
  scrollHint: string;
  skipLabel: string;
  endingMessage: string;
}

export const siteContent: SiteContent = {
  kicker: 'An original cinematic flight study',
  heroTitle: 'Meridian',
  heroLede: 'One continuous flight through a procedural sky. Scroll to travel.',
  buildNote: 'Experience under construction — the journey assembles phase by phase.',
  scrollHint: 'Scroll to begin the journey',
  skipLabel: 'Skip animation and view text version',
  endingMessage: 'Thank you for flying Meridian. The sky keeps the rest.',
};
