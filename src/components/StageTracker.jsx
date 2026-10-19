import { STAGES } from '../store/AppStore.jsx';

export default function StageTracker({ stage, history = [] }) {
  const current = STAGES.findIndex((s) => s.id === stage);

  return (
    <ol className="stages" style={{ '--progress': current / (STAGES.length - 1) }}>
      {STAGES.map((s, i) => {
        const at = history.find((h) => h.stage === s.id)?.at;
        const state = i < current ? 'is-done' : i === current ? 'is-current' : '';
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
  );
}
