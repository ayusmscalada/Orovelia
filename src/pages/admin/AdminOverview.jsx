import { Link } from 'react-router-dom';
import Avatar from '../../components/Avatar.jsx';
import { AdminHeader } from './AdminLayout.jsx';
import { useAdmin } from '../../admin/AdminStore.jsx';
import { useApp, STAGES, stageLabel } from '../../store/AppStore.jsx';
import { firstName, timeAgo } from '../../utils/format.js';

const WEEK = 7 * 86400000;

export default function AdminOverview() {
  const { user } = useApp();
  const { jobs, applications, candidates, threads, unreadTotal, getJob, getCandidate } = useAdmin();
  const openJobs = jobs.filter((j) => j.status === 'open');
  const newThisWeek = applications.filter((a) => Date.now() - new Date(a.createdAt) < WEEK).length;
  const pipeline = [...STAGES.map((s) => s.id), 'rejected'].map((id) => ({ id, n: applications.filter((a) => a.stage === id).length }));
  const maxStage = Math.max(1, ...pipeline.map((p) => p.n));

  return (
    <>
      <AdminHeader eyebrow="Admin" title={<>Hi {firstName(user.name)}, <em>here’s today</em>.</>} />

      <div className="dash-stack">
        <div className="admin-kpis">
          <Link to="/admin/jobs" className="dash-tile">
            <strong>{openJobs.length}</strong>
            <small>Open jobs · {jobs.length - openJobs.length} closed</small>
          </Link>
          <Link to="/admin/candidates" className="dash-tile">
            <strong>{candidates.length}</strong>
            <small>Candidates</small>
          </Link>
          <Link to="/admin/jobs" className="dash-tile">
            <strong>{newThisWeek}</strong>
            <small>New applications this week</small>
          </Link>
          <Link to="/admin/messages" className="dash-tile">
            <strong>{unreadTotal}</strong>
            <small>Unread messages</small>
          </Link>
        </div>

        <div className="admin-grid">
          <div className="dash-panel">
            <div className="dash-panel__head"><h3>Pipeline</h3></div>
            <ul className="funnel">
              {pipeline.map((p) => (
                <li key={p.id}>
                  <span>{stageLabel(p.id)}</span>
                  <span className="funnel__bar"><span style={{ width: `${(p.n / maxStage) * 100}%` }} className={`stage--${p.id}`} /></span>
                  <strong>{p.n}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="dash-panel">
            <div className="dash-panel__head">
              <h3>Latest messages</h3>
              <Link to="/admin/messages" className="link-arrow">Inbox <span>→</span></Link>
            </div>
            {threads.length ? (
              <ul className="admin-list">
                {threads.slice(0, 5).map((t) => {
                  const c = getCandidate(t.candidateId);
                  return (
                    <li key={t.candidateId}>
                      <Link to={`/admin/messages?with=${t.candidateId}`} className="admin-list__row">
                        <Avatar name={c?.name || '?'} hue={200} size={36} />
                        <span className="admin-list__main">
                          <strong>{c?.name || 'Candidate'}</strong>
                          <small>{t.last.body}</small>
                        </span>
                        <span className="admin-list__meta">
                          {t.unread > 0 && <span className="chip__count">{t.unread}</span>}
                          <small>{timeAgo(t.last.createdAt)}</small>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="muted-note">No messages yet. Candidates who say yes to a job start a conversation here.</p>
            )}
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel__head">
            <h3>Recent applications</h3>
            <Link to="/admin/candidates" className="link-arrow">All candidates <span>→</span></Link>
          </div>
          {applications.length ? (
            <ul className="admin-list">
              {applications.slice(0, 8).map((a) => {
                const c = getCandidate(a.candidateId);
                const job = getJob(a.jobId);
                return (
                  <li key={a.id}>
                    <Link to={`/admin/jobs/${a.jobId}`} className="admin-list__row">
                      <Avatar name={c?.name || '?'} hue={200} size={36} />
                      <span className="admin-list__main">
                        <strong>{c?.name || 'Candidate'}</strong>
                        <small>{job ? `${job.title} · ${job.employer}` : 'Deleted job'}</small>
                      </span>
                      <span className="admin-list__meta">
                        <span className={`pill-tag pill-tag--stage stage--${a.stage}`}>{stageLabel(a.stage)}</span>
                        <small>{timeAgo(a.createdAt)}</small>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted-note">No applications yet. They’ll appear here the moment a candidate taps “I’m interested”.</p>
          )}
        </div>
      </div>
    </>
  );
}
