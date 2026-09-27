// Typed asset manifest: every runtime-loaded file declares itself here with
// license and preload behavior. The loader only blocks on required assets;
// optional ones (like music) never gate startup. Paths resolve against the
// configured base path — never hard-code absolute /assets/... URLs.

export type AssetType = 'audio' | 'model' | 'texture';

export interface AssetEntry {
  id: string;
  /** Base-relative path, e.g. 'audio/ambience.wav'. */
  path: string;
  type: AssetType;
  required: boolean;
  license: string;
  attribution: string;
  preload: boolean;
}

// No runtime assets configured: music is absent (zero-audio mode), the
// aircraft is procedural, fonts ship via npm. Add entries here first — with
// verified licenses — before referencing them anywhere.
export const assetManifest: AssetEntry[] = [];

export function findAsset(id: string): AssetEntry | undefined {
  return assetManifest.find((entry) => entry.id === id);
}

/** Manifest path → fetchable URL honoring the Vite base (subpath-safe). */
export function assetUrl(entry: AssetEntry): string {
  const base = import.meta.env.BASE_URL || './';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${entry.path}`;
}
