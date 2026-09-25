/**
 * The page's light: a still wash of window light, a softer glow that trails
 * the cursor, and the layout grid itself, visible only where that glow falls.
 * Positions are written by MotionDirector.
 */
export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere-wash" />
      <div className="atmosphere-grid">
        <div className="wrap grid-columns">
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
      </div>
      <div className="atmosphere-glow" />
    </div>
  );
}
