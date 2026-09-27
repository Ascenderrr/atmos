import type { RefObject } from 'react';

// Screen-reader progress announcement for the journey. The value is mutated
// imperatively (never React state) so per-frame updates cause no re-renders.
// Also the deterministic observable the e2e suite reads.
export default function ProgressAnnouncer({
  nodeRef,
}: {
  nodeRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={nodeRef}
      role="progressbar"
      aria-label="Journey progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      className="sr-only"
    />
  );
}
