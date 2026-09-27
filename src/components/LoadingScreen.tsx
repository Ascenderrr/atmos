// Loading boundary shown while the async experience bundle initializes.
// Only required assets may block here; optional assets never gate startup.

export default function LoadingScreen() {
  return (
    <div className="loading" role="status" aria-label="Loading the experience">
      <p className="loading-pulse" aria-hidden="true" />
      <p>Preparing the sky…</p>
    </div>
  );
}
