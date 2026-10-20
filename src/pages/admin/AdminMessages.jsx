import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AdminHeader } from './AdminLayout.jsx';
import Avatar from '../../components/Avatar.jsx';
import Chat from '../../components/Chat.jsx';
import { useAdmin } from '../../admin/AdminStore.jsx';
import { useApp } from '../../store/AppStore.jsx';
import { timeAgo } from '../../utils/format.js';

export default function AdminMessages() {
  const { user } = useApp();
  const { threads, candidates, getCandidate, threadFor, applicationsForCandidate, getJob, sendMessage, markRead } = useAdmin();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');

  const requested = params.get('with');
  const activeId = requested || threads[0]?.candidateId || null;
  const active = activeId ? getCandidate(activeId) : null;
  const thread = activeId ? threadFor(activeId) : null;
  const messages = thread?.messages || [];
  const appliedJobs = activeId ? applicationsForCandidate(activeId).map((a) => getJob(a.jobId)).filter(Boolean) : [];

  // Threads, plus the requested candidate if they have no messages yet (starting a new conversation).
  const list = useMemo(() => {
    const ids = threads.map((t) => t.candidateId);
    if (requested && !ids.includes(requested)) ids.unshift(requested);
    const needle = q.trim().toLowerCase();
    return ids.filter((id) => {
      if (!needle) return true;
      const c = getCandidate(id);
      return `${c?.name} ${c?.email}`.toLowerCase().includes(needle);
    });
  }, [threads, requested, q, getCandidate]);

  // Opening a thread (or a new reply arriving while open) marks it read.
  useEffect(() => {
    if (activeId) markRead(activeId).catch(() => {});
  }, [activeId, messages.length, markRead]);

  return (
    <>
      <AdminHeader eyebrow="Messages" title={<>Conversations with <em>candidates</em>.</>} />

      {list.length === 0 && !q ? (
        <div className="empty">
          <span className="empty__icon">✉</span>
          <h3>No conversations yet</h3>
          <p>When a candidate says yes to a job or writes to the team, the conversation appears here. You can also message anyone from the Candidates page.</p>
          {candidates.length > 0 && <Link to="/admin/candidates" className="btn btn--ghost">Browse candidates</Link>}
        </div>
      ) : (
        <div className="inbox admin-inbox">
          <div className="inbox__side">
            <label className="admin-search admin-search--inbox">
              <span aria-hidden="true">⌕</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations" aria-label="Search conversations" />
            </label>
            <ul className="inbox__list">
              {list.map((id) => {
                const c = getCandidate(id);
                const t = threadFor(id);
                return (
                  <li key={id}>
                    <button
                      className={`inbox__thread ${id === activeId ? 'is-active' : ''}`}
                      onClick={() => setParams({ with: id }, { replace: true })}
                    >
                      <Avatar name={c?.name || '?'} hue={200} size={40} />
                      <span className="inbox__preview">
                        <strong>{c?.name || 'Candidate'}</strong>
                        <small>{t ? t.last.body : 'New conversation'}</small>
                      </span>
                      <span className="inbox__meta">
                        {t && <small>{timeAgo(t.last.createdAt)}</small>}
                        {t?.unread > 0 && id !== activeId && <span className="chip__count">{t.unread}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {active ? (
            <Chat
              key={activeId}
              header={
                <>
                  <Avatar name={active.name || '?'} hue={200} size={40} />
                  <span>
                    <strong>{active.name}</strong>
                    <small>
                      {active.email}
                      {active.phone ? ` · ${active.phone}` : ''}
                    </small>
                  </span>
                  <Link to={`/admin/candidates/${active.id}`} className="chip chip--sm chat__profile-link">Profile</Link>
                </>
              }
              messages={messages}
              meId={user.id}
              onSend={(body, jobId) => sendMessage(active.id, body, jobId || params.get('job'))}
              jobOptions={appliedJobs}
              lookupJob={getJob}
              placeholder={`Reply to ${active.name?.split(' ')[0] || 'candidate'}…`}
              emptyText={`Start the conversation with ${active.name || 'this candidate'}.`}
            />
          ) : (
            <div className="chat chat--empty">
              <p className="chat__empty">Pick a conversation.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
