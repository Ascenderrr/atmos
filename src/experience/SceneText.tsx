import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { experienceSections } from '../config/sections';
import { evaluateTypography, typographyTimings } from '../config/typography';
import { clamp01 } from '../utils/clamp';
import { getFlightCurve } from './FlightPath';
import type { ProgressStore } from '../animation/progressStore';

interface ChapterSprite {
  sprite: THREE.Sprite;
  sectionId: string;
  texture: THREE.CanvasTexture;
}

const _viewDir = new THREE.Vector3();
const _toSprite = new THREE.Vector3();

function drawChapterTexture(title: string, subtitle: string): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const letterSpaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  letterSpaced.letterSpacing = '16px';
  ctx.fillStyle = '#eef2ff';
  ctx.font = '600 88px "Space Grotesk Variable", system-ui, sans-serif';
  ctx.fillText(title.toUpperCase(), canvas.width / 2, 104);
  ctx.font = '400 40px "Space Grotesk Variable", system-ui, sans-serif';
  ctx.globalAlpha = 0.75;
  ctx.fillText(subtitle, canvas.width / 2, 196);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// Decorative 3D chapter titles floating above the route. Texture text renders
// with the already-bundled webfont (no runtime CDN); the DOM chapters remain
// the semantic source of truth, so this whole layer is safe to drop.
export default function SceneText({ store }: { store: ProgressStore }) {
  const [fontsReady, setFontsReady] = useState(false);
  const spriteRefs = useRef<(THREE.Sprite | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    const done = () => {
      if (!cancelled) {
        setFontsReady(true);
      }
    };
    if (typeof document === 'undefined' || !('fonts' in document)) {
      done();
      return () => {
        cancelled = true;
      };
    }
    document.fonts.ready.then(done).catch(done);
    const fallback = window.setTimeout(done, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, []);

  const chapters = useMemo<ChapterSprite[] | null>(() => {
    void fontsReady;
    try {
      const curve = getFlightCurve();
      const point = new THREE.Vector3();
      return experienceSections.map((section) => {
        const texture = drawChapterTexture(section.title, section.subtitle);
        if (!texture) {
          throw new Error('2d canvas unavailable');
        }
        curve.getPointAt((section.start + section.end) / 2, point);
        const material = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          toneMapped: false,
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(point.x, point.y + 9, point.z);
        sprite.scale.set(18, 4.5, 1);
        return { sprite, sectionId: section.id, texture };
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[SceneText] decorative titles disabled:', error);
      }
      return null;
    }
  }, [fontsReady]);

  useEffect(() => {
    return () => {
      for (const chapter of chapters ?? []) {
        chapter.texture.dispose();
        chapter.sprite.material.dispose();
      }
    };
  }, [chapters]);

  useFrame(({ camera }) => {
    if (!chapters) {
      return;
    }
    camera.getWorldDirection(_viewDir);
    for (let i = 0; i < chapters.length; i += 1) {
      const node = spriteRefs.current[i];
      if (!node) {
        continue;
      }
      const timing = typographyTimings[chapters[i].sectionId];
      const windowOpacity = evaluateTypography(timing, store.current).opacity;
      // Fade wide sprites out toward the frame edges instead of clipping half-on.
      _toSprite.copy(node.position).sub(camera.position).normalize();
      const edgeFade = clamp01((_viewDir.dot(_toSprite) - 0.88) / (0.966 - 0.88));
      const opacity = windowOpacity * edgeFade;
      node.visible = opacity > 0.01;
      (node.material as THREE.SpriteMaterial).opacity = opacity;
    }
  });

  if (!chapters) {
    return null;
  }
  return (
    <group>
      {chapters.map((chapter, i) => (
        <primitive
          key={chapter.sectionId}
          object={chapter.sprite}
          ref={(node: THREE.Sprite | null) => {
            spriteRefs.current[i] = node;
          }}
        />
      ))}
    </group>
  );
}
