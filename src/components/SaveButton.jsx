import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore.jsx';

export default function SaveButton({ jobId, withLabel = false }) {
  const { user, isAdmin, isSaved, toggleSave } = useApp();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const saved = isSaved(jobId);

  if (isAdmin) return null; // saved jobs are a job-seeker feature

  return (
    <button
      type="button"
      className={`save-btn ${saved ? 'is-saved' : ''} ${withLabel ? 'save-btn--label' : ''}`}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          navigate(`/login?next=${encodeURIComponent(pathname + search)}`);
          return;
        }
        toggleSave(jobId).catch(() => {}); // reverted optimistically on failure
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />
      </svg>
      {withLabel && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
