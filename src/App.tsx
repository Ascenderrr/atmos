import { siteContent } from './config/content';

// Phase 1 placeholder shell. Later phases replace this with the experience
// state machine (loading → intro → active → ending) and the WebGL canvas.
// All visible copy comes from the content config so the fallback, DOM
// typography, and SEO metadata share one source of truth.
export default function App() {
  return (
    <main className="landing">
      <p className="kicker">{siteContent.kicker}</p>
      <h1>{siteContent.heroTitle}</h1>
      <p className="lede">{siteContent.heroLede}</p>
      <p className="build-note">{siteContent.buildNote}</p>
    </main>
  );
}
