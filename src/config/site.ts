// Site metadata shared by index.html, SEO tags, and the app shell.
// Keep in sync with index.html when values change.

export interface SiteMetadata {
  title: string;
  description: string;
  themeColor: string;
  locale: string;
}

export const siteMetadata: SiteMetadata = {
  title: 'Meridian — A Cinematic Flight Study',
  description:
    'Meridian — an original cinematic WebGL flight study. One continuous journey through a procedural sky, driven by scroll.',
  themeColor: '#101a33',
  locale: 'en',
};
