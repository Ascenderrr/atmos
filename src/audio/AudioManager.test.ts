import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioManager } from './AudioManager';

type Handler = () => void;

class FakeAudioElement {
  src = '';
  loop = false;
  preload = '';
  volume = 1;
  muted = false;
  paused = true;
  currentTime = 0;
  loadCalls = 0;
  playCalls = 0;
  pauseCalls = 0;
  srcRemoved = false;
  playRejects = false;
  private handlers = new Map<string, Handler[]>();

  load(): void {
    this.loadCalls += 1;
  }

  play(): Promise<void> {
    this.playCalls += 1;
    if (this.playRejects) {
      return Promise.reject(new Error('autoplay blocked'));
    }
    this.paused = false;
    return Promise.resolve();
  }

  pause(): void {
    this.pauseCalls += 1;
    this.paused = true;
  }

  removeAttribute(): void {
    this.srcRemoved = true;
  }

  addEventListener(name: string, handler: Handler): void {
    const list = this.handlers.get(name) ?? [];
    list.push(handler);
    this.handlers.set(name, list);
  }

  emit(name: string): void {
    for (const handler of this.handlers.get(name) ?? []) {
      handler();
    }
  }
}

function managed(fake?: FakeAudioElement) {
  const element = fake ?? new FakeAudioElement();
  const manager = new AudioManager('audio/test-bed.wav', {
    volume: 0.8,
    fadeMs: 200,
    loadTimeoutMs: 1000,
    createAudio: () => element as unknown as HTMLAudioElement,
  });
  return { element, manager };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('AudioManager unconfigured', () => {
  it('is a safe no-op with zero audio files', async () => {
    const manager = new AudioManager(null);
    expect(manager.configured).toBe(false);
    expect(manager.snapshot().status).toBe('unconfigured');
    expect(await manager.load()).toBe(false);
    expect(await manager.play()).toBe(false);
    manager.pause();
    manager.stop();
    manager.setMuted(true);
    manager.setVolume(0.2);
    await manager.fadeIn();
    manager.dispose();
  });
});

describe('AudioManager loading', () => {
  it('resolves ready on canplaythrough', async () => {
    const { element, manager } = managed();
    const pending = manager.load();
    expect(manager.snapshot().status).toBe('loading');
    element.emit('canplaythrough');
    expect(await pending).toBe(true);
    expect(manager.snapshot().status).toBe('paused');
    expect(element.loadCalls).toBe(1);
  });

  it('recovers to failed status on error', async () => {
    const { element, manager } = managed();
    const pending = manager.load();
    element.emit('error');
    expect(await pending).toBe(false);
    expect(manager.snapshot().status).toBe('failed');
  });

  it('absorbs autoplay rejections', async () => {
    const { element, manager } = managed();
    element.playRejects = true;
    const pending = manager.load();
    element.emit('canplaythrough');
    expect(await pending).toBe(true);
    expect(await manager.play()).toBe(false);
    expect(manager.snapshot().status).toBe('paused');
  });
});

describe('AudioManager playback', () => {
  it('auto-loads and plays, then pauses and stops', async () => {
    const { element, manager } = managed();
    const playing = manager.play();
    element.emit('canplaythrough');
    expect(await playing).toBe(true);
    expect(manager.snapshot().status).toBe('playing');
    manager.pause();
    expect(manager.snapshot().status).toBe('paused');
    expect(element.paused).toBe(true);
    manager.stop();
    expect(element.currentTime).toBe(0);
  });

  it('toggles mute without touching volume', async () => {
    const { element, manager } = managed();
    manager.setMuted(true);
    expect(element.muted).toBe(true);
    expect(manager.snapshot().muted).toBe(true);
    manager.setMuted(false);
    expect(element.muted).toBe(false);
  });

  it('fades volume to the target and cancels superseded fades', async () => {
    const { element, manager } = managed();
    const first = manager.fadeTo(0.2, 200);
    const second = manager.fadeTo(0.6, 200);
    await vi.advanceTimersByTimeAsync(500);
    await Promise.all([first, second]);
    expect(element.volume).toBeCloseTo(0.6);
    expect(manager.snapshot().volume).toBeCloseTo(0.6);
  });

  it('fades out and pauses at silence', async () => {
    const { element, manager } = managed();
    const playing = manager.play();
    element.emit('canplaythrough');
    expect(await playing).toBe(true);
    const fading = manager.fadeOut(200);
    await vi.advanceTimersByTimeAsync(500);
    await fading;
    expect(element.volume).toBe(0);
    expect(manager.snapshot().status).toBe('paused');
  });
});

describe('AudioManager visibility and lifecycle', () => {
  it('suspends on hide and resumes on return', async () => {
    const { element, manager } = managed();
    const playing = manager.play();
    element.emit('canplaythrough');
    expect(await playing).toBe(true);
    manager.handleVisibilityHidden();
    expect(manager.snapshot().status).toBe('paused');
    manager.handleVisibilityVisible();
    await vi.waitFor(() => expect(manager.snapshot().status).toBe('playing'));
  });

  it('notifies subscribers and cleans up on dispose', () => {
    const { element, manager } = managed();
    let notifications = 0;
    const unsubscribe = manager.subscribe(() => {
      notifications += 1;
    });
    manager.setMuted(true);
    expect(notifications).toBeGreaterThan(0);
    unsubscribe();
    manager.dispose();
    expect(element.srcRemoved).toBe(true);
    expect(manager.snapshot().status).toBe('disposed');
  });

  it('rebuilds the element after dispose (StrictMode-safe singleton)', async () => {
    const { element, manager } = managed();
    manager.dispose();
    expect(manager.snapshot().status).toBe('disposed');
    const playing = manager.play();
    element.emit('canplaythrough');
    expect(await playing).toBe(true);
    expect(manager.snapshot().status).toBe('playing');
  });
});
