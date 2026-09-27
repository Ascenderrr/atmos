import { siteContent } from '../config/content';
import { experienceSections } from '../config/sections';

interface StaticFallbackProps {
  contextLost: boolean;
}

// Static accessible fallback: the same section table as the WebGL chapters,
// rendered as a normal responsive document with native scrolling. Shown when
// WebGL2 is unavailable, forced via ?forceFallback=1, or after a WebGL
// context loss. Intentional and polished — never an error page.
export default function StaticFallback({ contextLost }: StaticFallbackProps) {
  return (
    <main className="fallback">
      <header className="fallback-hero">
        <p className="kicker">{siteContent.kicker}</p>
        <h1>{siteContent.heroTitle}</h1>
        <p className="lede">{siteContent.heroLede}</p>
        {contextLost && (
          <p role="alert" className="fallback-notice">
            The 3D view could not keep running on this device, so here is the full story in text.
          </p>
        )}
      </header>
      {experienceSections.map((section) => (
        <section key={section.id} aria-label={section.title}>
          <h2>{section.title}</h2>
          <p>{section.subtitle}</p>
        </section>
      ))}
      <section aria-label="Closing">
        <h2>Arrival</h2>
        <p>{siteContent.endingMessage}</p>
      </section>
    </main>
  );
}
