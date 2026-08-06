export default function Loading() {
  return (
    <div className="cx-route-loading" role="status" aria-live="polite">
      <p className="cx-route-loading__label">Opening the next signal…</p>
      <div className="cx-route-loading__frame" aria-hidden="true">
        <div className="cx-route-loading__panel" />
        <div className="cx-route-loading__stack">
          <div className="cx-route-loading__line" />
          <div className="cx-route-loading__line" />
          <div className="cx-route-loading__line" />
        </div>
      </div>
    </div>
  );
}
