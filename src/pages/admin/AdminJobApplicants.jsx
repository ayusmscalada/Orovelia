import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdminHeader } from './AdminLayout.jsx';
import Avatar from '../../components/Avatar.jsx';
import { useAdmin } from '../../admin/AdminStore.jsx';
import { STAGES, stageLabel } from '../../store/AppStore.jsx';
import { formatPay, locationLabel, timeAgo } from '../../utils/format.js';

const columns = [...STAGES.map((s) => s.id), 'rejected'];

// Kanban pipeline for one job: drag a card (or use its menu) to move the candidate.
export default function AdminJobApplicants() {
  const { id } = useParams();
  const { getJob, applicationsForJob, getCandidate, moveStage, setJobStatus } = useAdmin();
  const [dragging, setDragging] = useState(null);
  const [over, setOver] = useState(null);
  const [error, setError] = useState('');
  const job = getJob(id);

  if (!job) {
    return (
      <div className="empty">
        <span className="empty__icon">?</span>
        <h3>Job not found</h3>
        <p>It may have been deleted.</p>
        <Link to="/admin/jobs" className="btn btn--ghost">Back to jobs</Link>
      </div>
    );
  }

  const apps = applicationsForJob(id);
  const move = async (appId, stage) => {
    setError('');
    try {
      await moveStage(appId, stage);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <AdminHeader
        eyebrow={`${job.employer} · ${locationLabel(job)} · ${formatPay(job)}`}
        title={<>{job.title} <em>applicants</em></>}
        actions={
          <>
            <Link to={`/jobs/${job.id}`} className="btn btn--ghost" target="_blank" rel="noreferrer">View listing ↗</Link>
            <Link to={`/admin/jobs/${job.id}/edit`} className="btn btn--ghost">Edit</Link>
            <button className="btn btn--ghost" onClick={() => setJobStatus(job.id, job.status === 'open' ? 'closed' : 'open').catch((e) => setError(e.message))}>
              {job.status === 'open' ? 'Close job' : 'Reopen job'}
            </button>
          </>
        }
      />
      {job.status === 'closed' && <p className="form-notice">This job is closed — it’s hidden from the site and no longer accepts applications.</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {apps.length === 0 ? (
        <div className="empty">
          <span className="empty__icon">✦</span>
          <h3>No applicants yet</h3>
          <p>Candidates who tap “I’m interested” on this job appear here instantly.</p>
        </div>
      ) : (
        <div className="kanban">
          {columns.map((stage) => {
            const items = apps.filter((a) => a.stage === stage);
            return (
              <section
                key={stage}
                className={`kanban__col stage-col--${stage} ${over === stage ? 'is-over' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(stage);
                }}
                onDragLeave={() => setOver((o) => (o === stage ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  setOver(null);
                  const appId = e.dataTransfer.getData('text/plain');
                  if (appId && apps.find((a) => a.id === appId)?.stage !== stage) move(appId, stage);
                }}
              >
                <header className="kanban__head">
                  <span>{stageLabel(stage)}</span>
                  <span className="chip__count">{items.length}</span>
                </header>
                {items.map((a) => {
                  const c = getCandidate(a.candidateId);
                  return (
                    <article
                      key={a.id}
                      className={`kanban__card ${dragging === a.id ? 'is-dragging' : ''}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', a.id);
                        setDragging(a.id);
                      }}
                      onDragEnd={() => setDragging(null)}
                    >
                      <div className="kanban__who">
                        <Avatar name={c?.name || '?'} hue={200} size={34} />
                        <span>
                          <Link to={`/admin/candidates/${a.candidateId}`}><strong>{c?.name || 'Candidate'}</strong></Link>
                          <small>{c ? `${c.city}${c.state ? `, ${c.state}` : ''}` : ''}</small>
                        </span>
                      </div>
                      {c?.headline && <p className="kanban__headline">{c.headline}</p>}
                      {c?.skills?.length > 0 && (
                        <div className="tags">
                          {c.skills.slice(0, 3).map((s) => <span key={s} className="tag tag--sm">{s}</span>)}
                        </div>
                      )}
                      <div className="kanban__foot">
                        <small>Applied {timeAgo(a.createdAt)}</small>
                        <span className="kanban__actions">
                          <Link to={`/admin/messages?with=${a.candidateId}&job=${job.id}`} className="chip chip--sm" aria-label={`Message ${c?.name}`}>✉</Link>
                          <select value={a.stage} onChange={(e) => move(a.id, e.target.value)} aria-label="Move to stage" className="kanban__select">
                            {columns.map((s) => <option key={s} value={s}>{stageLabel(s)}</option>)}
                          </select>
                        </span>
                      </div>
                    </article>
                  );
                })}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
