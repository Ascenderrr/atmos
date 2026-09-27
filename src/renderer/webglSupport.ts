// WebGL2 capability detection. Must run BEFORE any R3F Canvas is created so
// unsupported browsers immediately get the static fallback instead of a
// broken canvas. No THREE import here — pure DOM feature detection.

export function isWebGL2Available(): boolean {
  try {
    if (typeof document === 'undefined') {
      return false;
    }
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      return false;
    }
    // Release the probe context immediately; the real context is created later.
    const loseExt = gl.getExtension('WEBGL_lose_context');
    if (loseExt) {
      loseExt.loseContext();
    }
    return true;
  } catch {
    return false;
  }
}
