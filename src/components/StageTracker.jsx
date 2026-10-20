import { STAGES } from '../store/AppStore.jsx';

// Five-step pipeline. A "rejected" application shows how far it got, then a "Not selected" note.
export default function StageTracker({ stage, history = [] }) {
  const rejected = stage === 'rejected';
  const reached = rejected
    ? [...history].reverse().find((h) => h.stage !== 'rejected')?.stage || 'interested'
    : stage;
  const current = Math.max(0, STAGES.findIndex((s) => s.id === reached));

  return (
    <div className={`stages-wrap ${rejected ? 'is-rejected' : ''}`}>
      <ol className="stages" style={{ '--progress': current / (STAGES.length - 1) }}>
        {STAGES.map((s, i) => {
          const at = history.find((h) => h.stage === s.id)?.at;
          const state = i < current || (rejected && i === current) ? 'is-done' : i === current ? 'is-current' : '';
          return (
            <li key={s.id} className={`stages__step ${state}`}>
              <span className="stages__dot" aria-hidden="true">{i < current ? '✓' : i + 1}</span>
              <span className="stages__label">{s.label}</span>
              {at && (
                <span className="stages__date">
                  {new Date(at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {rejected && <p className="stages__note">Not selected for this role — your recruiter can suggest similar jobs.</p>}
    </div>
  );
}
