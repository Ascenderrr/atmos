import { clamp01 } from '../utils/clamp';

export type AudioStatus =
  'unconfigured' | 'loading' | 'ready' | 'playing' | 'paused' | 'failed' | 'disposed';

export interface AudioSnapshot {
  status: AudioStatus;
  configured: boolean;
  muted: boolean;
  volume: number;
}

export interface AudioManagerOptions {
  volume?: number;
  fadeMs?: number;
  loadTimeoutMs?: number;
  createAudio?: () => HTMLAudioElement;
}

// Optional music bed. Works perfectly with zero audio files: when no source
// is configured every method is a safe no-op and no control is shown.
// Playback only ever starts from a user gesture (toggle click / intro start),
// so autoplay policies are respected; rejections are absorbed, never thrown.
export class AudioManager {
  readonly configured: boolean;

  private readonly src: string | null;
  private element: HTMLAudioElement | null = null;
  private status: AudioStatus;
  private volume: number;
  private muted = false;
  private loaded = false;
  private suspendedByVisibility = false;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;
  private fadeSettle: (() => void) | null = null;
  private readonly fadeMs: number;
  private readonly loadTimeoutMs: number;
  private readonly createAudio: () => HTMLAudioElement;
  private readonly listeners = new Set<() => void>();

  constructor(src: string | null, options: AudioManagerOptions = {}) {
    this.src = src && src.length > 0 ? src : null;
    this.configured = this.src !== null;
    this.volume = clamp01(options.volume ?? 0.7);
    this.fadeMs = options.fadeMs ?? 1500;
    this.loadTimeoutMs = options.loadTimeoutMs ?? 4000;
    this.createAudio = options.createAudio ?? (() => new Audio());
    this.status = 'unconfigured';
    this.ensureElement();
  }

  snapshot(): AudioSnapshot {
    return {
      status: this.status,
      configured: this.configured,
      muted: this.muted,
      volume: this.volume,
    };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private setStatus(status: AudioStatus): void {
    this.status = status;
    this.notify();
  }

  // Rebuilds the element after a dispose (StrictMode remounts, HMR). The
  // manager is a stable singleton; disposal must never permanently kill it.
  private ensureElement(): void {
    if (this.element || !this.configured || !this.src) {
      return;
    }
    const element = this.createAudio();
    element.src = this.src;
    element.loop = true;
    element.preload = 'auto';
    element.volume = this.volume;
    element.muted = this.muted;
    this.element = element;
    this.loaded = false;
    this.suspendedByVisibility = false;
    this.setStatus('paused');
  }

  private isUnusable(): boolean {
    return (
      !this.configured || !this.element || this.status === 'disposed' || this.status === 'failed'
    );
  }

  /** Best-effort load: true when playable, false on error. Never rejects, never blocks UX. */
  load(): Promise<boolean> {
    this.ensureElement();
    if (!this.configured || !this.element || this.status === 'disposed') {
      return Promise.resolve(false);
    }
    if (this.loaded) {
      return Promise.resolve(this.status !== 'failed');
    }
    this.setStatus('loading');
    const element = this.element;
    return new Promise<boolean>((resolve) => {
      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) {
          return;
        }
        settled = true;
        globalThis.clearTimeout(timer);
        this.loaded = ok;
        this.setStatus(ok ? 'paused' : 'failed');
        resolve(ok);
      };
      const timer = globalThis.setTimeout(() => finish(true), this.loadTimeoutMs);
      element.addEventListener('canplaythrough', () => finish(true), { once: true });
      element.addEventListener('error', () => finish(false), { once: true });
      element.load();
    });
  }

  /** Starts playback. Call only from a user gesture. False when unavailable/blocked. */
  async play(): Promise<boolean> {
    this.ensureElement();
    if (this.isUnusable()) {
      return false;
    }
    if (!this.loaded) {
      const ok = await this.load();
      if (!ok || this.isUnusable()) {
        return false;
      }
    }
    try {
      await this.element?.play();
    } catch {
      return false;
    }
    if (this.isUnusable()) {
      return false;
    }
    this.setStatus('playing');
    return true;
  }

  pause(): void {
    this.cancelFade();
    this.element?.pause();
    if (this.status === 'playing') {
      this.setStatus('paused');
    }
  }

  stop(): void {
    this.cancelFade();
    if (this.element) {
      this.element.pause();
      this.element.currentTime = 0;
    }
    if (this.status === 'playing' || this.status === 'paused' || this.status === 'ready') {
      this.setStatus('paused');
    }
  }

  setMuted(muted: boolean): void {
    if (!this.configured || this.status === 'disposed') {
      return;
    }
    this.muted = muted;
    if (this.element) {
      this.element.muted = muted;
    }
    this.notify();
  }

  setVolume(volume: number): void {
    if (!this.configured || this.status === 'disposed') {
      return;
    }
    this.cancelFade();
    this.applyVolume(clamp01(volume));
  }

  fadeIn(ms: number = this.fadeMs): Promise<void> {
    this.setMuted(false);
    return this.fadeTo(this.volume === 0 ? 0.7 : this.volume, ms);
  }

  fadeOut(ms: number = this.fadeMs): Promise<void> {
    return this.fadeTo(0, ms).then(() => {
      this.pause();
    });
  }

  fadeTo(target: number, ms: number = this.fadeMs): Promise<void> {
    this.cancelFade();
    const destination = clamp01(target);
    if (!this.configured || !this.element || this.status === 'disposed') {
      return Promise.resolve();
    }
    if (ms <= 0) {
      this.applyVolume(destination);
      return Promise.resolve();
    }
    const start = this.volume;
    if (start === destination) {
      return Promise.resolve();
    }
    const steps = Math.max(1, Math.round(ms / 50));
    let step = 0;
    return new Promise<void>((resolve) => {
      this.fadeSettle = resolve;
      this.fadeTimer = setInterval(() => {
        step += 1;
        this.applyVolume(start + (destination - start) * (step / steps));
        if (step >= steps) {
          this.cancelFade();
          resolve();
        }
      }, 50);
    });
  }

  handleVisibilityHidden(): void {
    if (this.status === 'playing') {
      this.suspendedByVisibility = true;
      this.pause();
    }
  }

  handleVisibilityVisible(): void {
    if (this.suspendedByVisibility) {
      this.suspendedByVisibility = false;
      void this.play();
    }
  }

  dispose(): void {
    this.cancelFade();
    if (this.element) {
      this.element.pause();
      this.element.removeAttribute('src');
      this.element.load();
    }
    // The element is dropped but subscribers survive: a later play() rebuilds
    // via ensureElement (StrictMode remounts must not permanently kill audio).
    this.element = null;
    this.loaded = false;
    this.suspendedByVisibility = false;
    this.status = 'disposed';
  }

  private applyVolume(volume: number): void {
    this.volume = volume;
    if (this.element) {
      this.element.volume = volume;
    }
    this.notify();
  }

  private cancelFade(): void {
    if (this.fadeTimer !== null) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    // A superseded fade settles (rather than hangs): cancellation is success.
    if (this.fadeSettle !== null) {
      const settle = this.fadeSettle;
      this.fadeSettle = null;
      settle();
    }
  }
}
