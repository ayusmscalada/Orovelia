import { Link } from 'react-router-dom';
import SaveButton from './SaveButton.jsx';
import { prefetch } from '../routes.js';
import { getIndustry } from '../data/jobs.js';
import { formatPay, locationLabel, postedLabel } from '../utils/format.js';
import { useApp, stageLabel } from '../store/AppStore.jsx';

export default function JobCard({ job, compact = false }) {
  const industry = getIndustry(job.industry);
  const { applicationFor } = useApp();
  const app = applicationFor(job.id);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className={`job-card ${compact ? 'job-card--compact' : ''}`}
      style={{ '--hue': industry.hue }}
      onMouseEnter={() => prefetch(`/jobs/${job.id}`)}
    >
      <span className="job-card__icon" aria-hidden="true">{industry.icon}</span>
      <span className="job-card__main">
        <span className="job-card__top">
          {job.urgent && <span className="pill-tag pill-tag--hot">Hiring fast</span>}
          {job.remote && <span className="pill-tag">Remote</span>}
          {app && <span className="pill-tag pill-tag--stage">{stageLabel(app.stage)}</span>}
          <span className="job-card__posted">{postedLabel(job.postedDaysAgo)}</span>
        </span>
        <span className="job-card__title">{job.title}</span>
        <span className="job-card__employer">{job.employer}</span>
        <span className="job-card__meta">
          <span>⌖ {locationLabel(job)}</span>
          <span>◷ {job.type}</span>
          {!compact && <span>☀ {job.schedule}</span>}
        </span>
      </span>
      <span className="job-card__side">
        <span className="job-card__pay">{formatPay(job)}</span>
        <SaveButton jobId={job.id} />
      </span>
    </Link>
  );
}
