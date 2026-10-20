import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../store/JobsStore.jsx';
import { timeAgo } from '../utils/format.js';

// One conversation: bubbles (mine on the right), optional job tag per message, and a composer.
// Used by the candidate dashboard and the admin inbox.
export default function Chat({ header, messages, meId, onSend, emptyText, placeholder = 'Write a message…', jobOptions, lookupJob }) {
  const { getJob: getPublicJob } = useJobs();
  const getJob = lookupJob || getPublicJob; // admins can also see closed jobs
  const [text, setText] = useState('');
  const [jobId, setJobId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length]);

  const submit = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    setError('');
    try {
      await onSend(body, jobId || null);
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="chat">
      <div className="chat__head">{header}</div>
      <div className="chat__body">
        {messages.length === 0 && <p className="chat__empty">{emptyText}</p>}
        {messages.map((m) => {
          const job = m.jobId && getJob(m.jobId);
          return (
            <div key={m.id} className={`bubble ${m.senderId === meId ? 'bubble--me' : ''}`}>
              {job && (
                <Link to={`/jobs/${job.id}`} className="bubble__job">
                  ◆ {job.title} · {job.employer}
                </Link>
              )}
              <p>{m.body}</p>
              <small>
                {timeAgo(m.createdAt)}
                {m.senderId === meId && m.readAt && ' · Seen'}
              </small>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {error && <p className="form-error chat__error" role="alert">{error}</p>}
      <form className="chat__form" onSubmit={submit}>
        {jobOptions?.length > 0 && (
          <label className="select chat__job">
            <span>About</span>
            <select value={jobId} onChange={(e) => setJobId(e.target.value)} aria-label="Attach a job">
              <option value="">General</option>
              {jobOptions.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </label>
        )}
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label="Message" maxLength={4000} />
        <button type="submit" className="btn btn--gold" disabled={!text.trim() || busy}>
          {busy ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  );
}
