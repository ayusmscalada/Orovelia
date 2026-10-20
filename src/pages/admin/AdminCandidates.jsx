import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AdminHeader } from './AdminLayout.jsx';
import Avatar from '../../components/Avatar.jsx';
import { useAdmin } from '../../admin/AdminStore.jsx';
import { STAGES, stageLabel } from '../../store/AppStore.jsx';
import { getIndustry, industries } from '../../data/jobs.js';
import { completeness } from '../../components/ProfileFields.jsx';
import { timeAgo } from '../../utils/format.js';

const stageOptions = [...STAGES.map((s) => s.id), 'rejected'];

function CandidateDetail({ candidate, onClose }) {
  const { applicationsForCandidate, getJob, moveStage } = useAdmin();
  const [error, setError] = useState('');
  const apps = applicationsForCandidate(candidate.id);
  const av = candidate.availability || { days: [], shifts: [] };

  return (
    <aside className="admin-detail" aria-label={`${candidate.name} profile`}>
      <div className="admin-detail__head">
        <Avatar name={candidate.name || '?'} hue={200} size={64} />
        <div>
          <h2>{candidate.name || 'Unnamed candidate'}</h2>
          <p>{candidate.headline || 'No headline yet'}</p>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close profile">×</button>
      </div>

      <div className="admin-detail__actions">
        <Link to={`/admin/messages?with=${candidate.id}`} className="btn btn--gold">Message <span className="btn__shine" /></Link>
        <a href={`mailto:${candidate.email}`} className="btn btn--ghost">Email</a>
        {candidate.phone && <a href={`tel:${candidate.phone}`} className="btn btn--ghost">Call</a>}
      </div>

      <dl className="facts">
        <div><dt>Email</dt><dd>{candidate.email}</dd></div>
        <div><dt>Phone</dt><dd>{candidate.phone || '—'}</dd></div>
        <div><dt>Location</dt><dd>{[candidate.city, candidate.state].filter(Boolean).join(', ') || '—'}</dd></div>
        <div><dt>Joined</dt><dd>{candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : '—'}</dd></div>
        <div><dt>Profile strength</dt><dd>{completeness(candidate)}%</dd></div>
        <div><dt>Resume</dt><dd>{candidate.resumeName || 'Not uploaded'}</dd></div>
      </dl>

      <h4>Applications</h4>
      {error && <p className="form-error">{error}</p>}
      {apps.length ? (
        <ul className="admin-apps">
          {apps.map((a) => {
            const job = getJob(a.jobId);
            return (
              <li key={a.id}>
                <Link to={`/admin/jobs/${a.jobId}`}>
                  <strong>{job?.title || 'Deleted job'}</strong>
                  <small>{job?.employer} · applied {timeAgo(a.createdAt)}</small>
                </Link>
                <select
                  value={a.stage}
                  onChange={(e) => moveStage(a.id, e.target.value).catch((err) => setError(err.message))}
                  aria-label="Stage"
                >
                  {stageOptions.map((s) => <option key={s} value={s}>{stageLabel(s)}</option>)}
                </select>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="muted-note">Hasn’t applied to anything yet.</p>
      )}

      <h4>Industries</h4>
      <div className="tags">
        {candidate.industries.length ? candidate.industries.map((i) => <span key={i} className="tag">{getIndustry(i).icon} {getIndustry(i).name}</span>) : <span className="muted-note">—</span>}
      </div>

      <h4>Experience</h4>
      {candidate.experience.length ? (
        <ul className="admin-exp">
          {candidate.experience.map((e, i) => (
            <li key={i}><strong>{e.title}</strong> · {e.company} <small>{e.years}</small></li>
          ))}
        </ul>
      ) : (
        <p className="muted-note">—</p>
      )}

      <h4>Skills & certificates</h4>
      <div className="tags">
        {[...candidate.skills, ...candidate.certificates].map((s) => <span key={s} className="tag">{s}</span>)}
        {!candidate.skills.length && !candidate.certificates.length && <span className="muted-note">—</span>}
      </div>

      <h4>Availability</h4>
      <p className="muted-note">
        {av.days.length ? av.days.join(', ') : 'Days not set'} · {av.shifts.length ? av.shifts.join(', ') : 'Shifts not set'}
      </p>
    </aside>
  );
}

export default function AdminCandidates() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates, getCandidate, applicationsForCandidate, threadFor } = useAdmin();
  const [q, setQ] = useState('');
  const [industry, setIndustry] = useState('');
  const selected = id ? getCandidate(id) : null;

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return candidates.filter(
      (c) =>
        (!industry || c.industries.includes(industry)) &&
        (!needle || `${c.name} ${c.email} ${c.city} ${c.state} ${c.headline} ${c.skills.join(' ')}`.toLowerCase().includes(needle))
    );
  }, [candidates, q, industry]);

  return (
    <>
      <AdminHeader eyebrow="Candidates" title={<>{candidates.length} job <em>{candidates.length === 1 ? 'seeker' : 'seekers'}</em>.</>} />

      <div className="admin-toolbar">
        <label className="admin-search">
          <span aria-hidden="true">⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, city or skill" aria-label="Search candidates" />
        </label>
        <label className="select">
          <span>Industry</span>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">All</option>
            {industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </label>
      </div>

      <div className={`admin-split ${selected ? 'has-detail' : ''}`}>
        {shown.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Location</th>
                  <th>Applications</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => {
                  const apps = applicationsForCandidate(c.id);
                  const unread = threadFor(c.id)?.unread || 0;
                  return (
                    <tr key={c.id} className={`is-clickable ${selected?.id === c.id ? 'is-selected' : ''}`} onClick={() => navigate(`/admin/candidates/${c.id}`)}>
                      <td>
                        <span className="admin-job">
                          <Avatar name={c.name || '?'} hue={200} size={36} />
                          <span>
                            <strong>{c.name || 'Unnamed'} {unread > 0 && <span className="chip__count">{unread} unread</span>}</strong>
                            <small>{c.email}</small>
                          </span>
                        </span>
                      </td>
                      <td>{[c.city, c.state].filter(Boolean).join(', ') || '—'}</td>
                      <td>
                        {apps.length ? (
                          <span className="admin-stages">
                            {apps.slice(0, 3).map((a) => <span key={a.id} className={`pill-tag pill-tag--stage stage--${a.stage}`}>{stageLabel(a.stage)}</span>)}
                            {apps.length > 3 && <small>+{apps.length - 3}</small>}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="nowrap">{c.createdAt ? timeAgo(c.createdAt) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <span className="empty__icon">◇</span>
            <h3>{candidates.length ? 'No candidates match' : 'No candidates yet'}</h3>
            <p>{candidates.length ? 'Try a different search.' : 'Job seekers appear here as soon as they create a profile.'}</p>
          </div>
        )}
        {selected && <CandidateDetail key={selected.id} candidate={selected} onClose={() => navigate('/admin/candidates')} />}
      </div>
    </>
  );
}
