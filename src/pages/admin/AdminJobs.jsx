import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from './AdminLayout.jsx';
import { useAdmin } from '../../admin/AdminStore.jsx';
import { getIndustry, industries } from '../../data/jobs.js';
import { formatPay, locationLabel, timeAgo } from '../../utils/format.js';

export default function AdminJobs() {
  const { jobs, applicationsForJob, setJobStatus, deleteJob } = useAdmin();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [industry, setIndustry] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState('');

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return jobs.filter(
      (j) =>
        (status === 'all' || j.status === status) &&
        (!industry || j.industry === industry) &&
        (!needle || `${j.title} ${j.employer} ${j.city} ${j.state}`.toLowerCase().includes(needle))
    );
  }, [jobs, q, status, industry]);

  const run = async (fn) => {
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <AdminHeader
        eyebrow="Jobs"
        title={<>Every <em>listing</em>, in one place.</>}
        actions={<Link to="/admin/jobs/new" className="btn btn--gold">+ Post a job <span className="btn__shine" /></Link>}
      />

      <div className="admin-toolbar">
        <label className="admin-search">
          <span aria-hidden="true">⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, employer or city" aria-label="Search jobs" />
        </label>
        <div className="chips" role="group" aria-label="Status">
          {['all', 'open', 'closed'].map((s) => (
            <button key={s} className={`chip chip--sm ${status === s ? 'is-active' : ''}`} onClick={() => setStatus(s)}>
              {s === 'all' ? `All ${jobs.length}` : `${s[0].toUpperCase()}${s.slice(1)} ${jobs.filter((j) => j.status === s).length}`}
            </button>
          ))}
        </div>
        <label className="select">
          <span>Industry</span>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">All</option>
            {industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </label>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      {shown.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Location</th>
                <th>Pay</th>
                <th>Applicants</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {shown.map((j) => {
                const apps = applicationsForJob(j.id);
                const fresh = apps.filter((a) => a.stage === 'interested').length;
                const ind = getIndustry(j.industry);
                return (
                  <tr key={j.id} className={j.status === 'closed' ? 'is-closed' : ''}>
                    <td>
                      <Link to={`/admin/jobs/${j.id}`} className="admin-job">
                        <span className="admin-job__icon" style={{ '--hue': ind.hue }}>{ind.icon}</span>
                        <span>
                          <strong>{j.title}</strong>
                          <small>{j.employer} · posted {timeAgo(j.createdAt)}</small>
                        </span>
                      </Link>
                    </td>
                    <td>{locationLabel(j)}</td>
                    <td className="nowrap">{formatPay(j)}</td>
                    <td>
                      <Link to={`/admin/jobs/${j.id}`} className="admin-count">
                        <strong>{apps.length}</strong>
                        {fresh > 0 && <span className="chip__count">{fresh} new</span>}
                      </Link>
                    </td>
                    <td>
                      <span className={`status-pill status-pill--${j.status}`}>{j.status === 'open' ? 'Open' : 'Closed'}</span>
                    </td>
                    <td className="admin-actions">
                      <Link to={`/admin/jobs/${j.id}/edit`} className="chip chip--sm">Edit</Link>
                      <button className="chip chip--sm" onClick={() => run(() => setJobStatus(j.id, j.status === 'open' ? 'closed' : 'open'))}>
                        {j.status === 'open' ? 'Close' : 'Reopen'}
                      </button>
                      {confirmDelete === j.id ? (
                        <>
                          <button className="chip chip--sm chip--danger" onClick={() => run(() => deleteJob(j.id))}>Delete{apps.length ? ` + ${apps.length} applications` : ''}</button>
                          <button className="text-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
                        </>
                      ) : (
                        <button className="icon-btn icon-btn--sm" aria-label={`Delete ${j.title}`} onClick={() => setConfirmDelete(j.id)}>×</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <span className="empty__icon">✦</span>
          <h3>{jobs.length ? 'No jobs match those filters' : 'No jobs yet'}</h3>
          <p>{jobs.length ? 'Try a different search or status.' : 'Post your first listing — it goes live on the site immediately.'}</p>
          <Link to="/admin/jobs/new" className="btn btn--gold">+ Post a job <span className="btn__shine" /></Link>
        </div>
      )}
    </>
  );
}
