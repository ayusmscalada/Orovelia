import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import JobCard from '../components/JobCard.jsx';
import StageTracker from '../components/StageTracker.jsx';
import Chat from '../components/Chat.jsx';
import Logo from '../components/Logo.jsx';
import {
  AvailabilityFields,
  BasicsFields,
  SkillsFields,
  WorkFields,
  completeness,
} from '../components/ProfileFields.jsx';
import { useApp, stageLabel } from '../store/AppStore.jsx';
import { useJobs } from '../store/JobsStore.jsx';
import { getMember } from '../data/team.js';
import { firstName, formatPay, locationLabel, timeAgo } from '../utils/format.js';

const tabs = [
  { id: 'overview', label: 'Overview', icon: '◎' },
  { id: 'applications', label: 'Applications', icon: '✦' },
  { id: 'saved', label: 'Saved jobs', icon: '♡' },
  { id: 'messages', label: 'Messages', icon: '✉' },
  { id: 'profile', label: 'Profile', icon: '◇' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

function Ring({ value }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <svg className="ring" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe3a3" />
          <stop offset="1" stopColor="#9b6bff" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r={r} className="ring__track" />
      <circle cx="50" cy="50" r={r} className="ring__bar" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
    </svg>
  );
}

function Empty({ icon, title, text, cta }) {
  return (
    <div className="empty">
      <span className="empty__icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {cta}
    </div>
  );
}

function Overview({ goTo }) {
  const { user, state, unreadMessages } = useApp();
  const { jobs } = useJobs();
  const score = completeness(user);
  const applied = new Set(state.applications.map((a) => a.jobId));
  const recommended = jobs
    .filter((j) => !applied.has(j.id) && (!user.industries.length || user.industries.includes(j.industry)))
    .sort((a, b) => (b.city === user.city) - (a.city === user.city) || a.postedDaysAgo - b.postedDaysAgo)
    .slice(0, 4);

  return (
    <div className="dash-stack">
      <div className="dash-tiles">
        <button className="dash-tile dash-tile--ring" onClick={() => goTo('profile')}>
          <span className="ring-wrap">
            <Ring value={score} />
            <strong>{score}%</strong>
          </span>
          <span>
            <strong>Profile strength</strong>
            <small>{score < 100 ? 'Complete your profile to get better matches →' : 'Looking great!'}</small>
          </span>
        </button>
        <button className="dash-tile" onClick={() => goTo('applications')}>
          <strong>{state.applications.length}</strong>
          <small>Applications</small>
        </button>
        <button className="dash-tile" onClick={() => goTo('saved')}>
          <strong>{state.saved.length}</strong>
          <small>Saved jobs</small>
        </button>
        <button className="dash-tile" onClick={() => goTo('messages')}>
          <strong>{unreadMessages}</strong>
          <small>Unread messages</small>
        </button>
      </div>

      <div className="dash-panel">
        <div className="dash-panel__head">
          <h3>Recommended for you</h3>
          <Link to="/jobs" className="link-arrow">Browse all <span>→</span></Link>
        </div>
        {recommended.length ? (
          <div className="job-list">
            {recommended.map((j) => <JobCard key={j.id} job={j} compact />)}
          </div>
        ) : (
          <Empty icon="✦" title="You’ve said yes to everything!" text="New roles arrive daily — we’ll notify you." />
        )}
      </div>

      <div className="dash-panel">
        <div className="dash-panel__head">
          <h3>Recent activity</h3>
        </div>
        {state.notifications.length ? (
          <ul className="activity">
            {state.notifications.slice(0, 6).map((n) => (
              <li key={n.id}>
                <span className="activity__dot" />
                <Link to={n.to || '/dashboard'}>{n.text}</Link>
                <small>{timeAgo(n.at)}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted-note">Your updates will show up here — say yes to a job to get started.</p>
        )}
      </div>
    </div>
  );
}

function Applications() {
  const { state, withdraw } = useApp();
  const { getJob } = useJobs();

  if (!state.applications.length) {
    return (
      <Empty
        icon="✦"
        title="No applications yet"
        text="Find a role you like and tap “I’m interested” — you’ll track it here."
        cta={<Link to="/jobs" className="btn btn--gold">Find jobs <span className="btn__shine" /></Link>}
      />
    );
  }

  return (
    <div className="dash-stack">
      {state.applications.map((a) => {
        const job = getJob(a.jobId);
        const recruiter = job && getMember(job.recruiterId);
        return (
          <div key={a.id} className="app-card">
            <div className="app-card__head">
              <div>
                {job ? (
                  <Link to={`/jobs/${job.id}`} className="app-card__title">{job.title}</Link>
                ) : (
                  <span className="app-card__title">A job that’s no longer listed</span>
                )}
                <p>{job ? `${job.employer} · ${locationLabel(job)} · ${formatPay(job)}` : 'This role has been filled or closed.'}</p>
              </div>
              <span className={`pill-tag pill-tag--stage stage--${a.stage}`}>{stageLabel(a.stage)}</span>
            </div>
            <StageTracker stage={a.stage} history={a.history} />
            <div className="app-card__foot">
              <span className="app-card__recruiter">
                {recruiter && <Avatar name={recruiter.name} hue={recruiter.hue} photo={recruiter.photo} size={32} />}
                {recruiter ? recruiter.name : 'Orovelia team'}
              </span>
              <span className="app-card__actions">
                <Link to="/dashboard?tab=messages" className="chip chip--sm">Message</Link>
                <button className="chip chip--sm" onClick={() => withdraw(a.jobId).catch(() => {})}>Withdraw</button>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Saved() {
  const { state } = useApp();
  const { getJob } = useJobs();
  const jobs = state.saved.map((id) => getJob(id)).filter(Boolean);
  if (!jobs.length) {
    return (
      <Empty
        icon="♡"
        title="No saved jobs"
        text="Tap the heart on any job to keep it for later."
        cta={<Link to="/jobs" className="btn btn--gold">Find jobs <span className="btn__shine" /></Link>}
      />
    );
  }
  return <div className="job-list">{jobs.map((j) => <JobCard key={j.id} job={j} />)}</div>;
}

function Messages() {
  const { user, state, sendMessage, readThread } = useApp();
  const { getJob } = useJobs();
  const appliedJobs = state.applications.map((a) => getJob(a.jobId)).filter(Boolean);

  // Opening the conversation (or a new reply arriving while open) marks it read.
  useEffect(() => {
    readThread().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.messages.length]);

  return (
    <div className="inbox inbox--single">
      <Chat
        header={
          <>
            <span className="chat__team-logo"><Logo size={26} /></span>
            <span>
              <strong>Orovelia recruiting team</strong>
              <small>Usually replies within a few hours · Mon–Sat</small>
            </span>
          </>
        }
        messages={state.messages}
        meId={user.id}
        onSend={sendMessage}
        jobOptions={appliedJobs}
        placeholder="Ask about pay, schedules, interviews…"
        emptyText={`Hi ${firstName(user.name)}! Questions about a job, your profile or an interview? Send us a message and a recruiter will reply here.`}
      />
    </div>
  );
}

function Profile() {
  const { user, updateProfile } = useApp();
  const [draft, setDraft] = useState(user);
  const [status, setStatus] = useState('idle'); // idle | saving | saved
  const [error, setError] = useState('');
  const dirty = JSON.stringify(draft) !== JSON.stringify(user);
  const saved = status === 'saved';

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    setError('');
    try {
      await updateProfile(draft);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  return (
    <form className="dash-stack" onSubmit={onSubmit}>
      {[
        ['The basics', BasicsFields],
        ['Your work', WorkFields],
        ['Skills & resume', SkillsFields],
        ['Availability', AvailabilityFields],
      ].map(([title, Fields]) => (
        <div key={title} className="dash-panel">
          <div className="dash-panel__head"><h3>{title}</h3></div>
          <Fields value={draft} onChange={setDraft} lockEmail />
        </div>
      ))}
      <div className={`save-bar ${dirty || saved || error ? 'is-visible' : ''}`}>
        <span className={error ? 'form-error' : ''}>
          {error ? `Couldn’t save: ${error}` : saved ? '✓ Profile saved' : 'You have unsaved changes'}
        </span>
        {!saved && (
          <span className="save-bar__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setDraft(user)}>Discard</button>
            <button type="submit" className="btn btn--gold" disabled={status === 'saving'}>
              {status === 'saving' ? 'Saving…' : 'Save profile'} <span className="btn__shine" />
            </button>
          </span>
        )}
      </div>
    </form>
  );
}

function Settings() {
  const { state, setAlerts, logout, deleteAccount } = useApp();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');
  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';

  return (
    <div className="dash-stack">
      <div className="dash-panel">
        <div className="dash-panel__head"><h3>Notifications</h3></div>
        <label className="switch switch--row">
          <span>
            <strong>Desktop alerts</strong>
            <small>
              Get a pop-up when an application moves stage or a recruiter messages you.
              {permission === 'denied' && ' Alerts are blocked in your browser settings.'}
            </small>
          </span>
          <input type="checkbox" checked={state.alerts} onChange={(e) => setAlerts(e.target.checked)} />
          <span className="switch__track" aria-hidden="true" />
        </label>
      </div>

      <div className="dash-panel">
        <div className="dash-panel__head"><h3>Account</h3></div>
        <div className="settings-actions">
          <button className="btn btn--ghost" onClick={async () => { await logout(); navigate('/'); }}>Log out</button>
          {confirm ? (
            <span className="danger-confirm">
              Delete your profile and all data?
              <button
                className="btn btn--danger"
                onClick={async () => {
                  try {
                    await deleteAccount();
                    navigate('/');
                  } catch (err) {
                    setError(err.message);
                  }
                }}
              >
                Yes, delete
              </button>
              <button className="text-btn" onClick={() => setConfirm(false)}>Cancel</button>
            </span>
          ) : (
            <button className="text-btn text-btn--danger" onClick={() => setConfirm(true)}>Delete account</button>
          )}
        </div>
        {error && <p className="form-error" role="alert" style={{ marginTop: 16 }}>{error}</p>}
      </div>
    </div>
  );
}

const panels = { overview: Overview, applications: Applications, saved: Saved, messages: Messages, profile: Profile, settings: Settings };

export default function Dashboard() {
  const { user, state, unreadMessages, authLoading, authStatus, profileError, logout } = useApp();
  const [params, setParams] = useSearchParams();

  if (authLoading) {
    return (
      <section className="dashboard dashboard--loading">
        <span className="loader" aria-label="Loading your dashboard" />
      </section>
    );
  }
  if (authStatus === 'signedIn' && profileError) {
    return (
      <section className="dashboard">
        <div className="container">
          <div className="empty">
            <span className="empty__icon">!</span>
            <h3>We couldn’t load your profile</h3>
            <p>{profileError}</p>
            <button className="btn btn--ghost" onClick={logout}>Log out</button>
          </div>
        </div>
      </section>
    );
  }
  if (!user) return <Navigate to="/login?next=/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;

  const tab = panels[params.get('tab')] ? params.get('tab') : 'overview';
  const Panel = panels[tab];
  const goTo = (id) => setParams(id === 'overview' ? {} : { tab: id }, { replace: true });
  const badge = { applications: state.applications.length, messages: unreadMessages, saved: state.saved.length };

  return (
    <section className="dashboard">
      <div className="container dashboard__inner">
        <aside className="dash-nav">
          <div className="dash-nav__me">
            <Avatar name={user.name || 'You'} hue={40} size={56} />
            <span>
              <strong>{user.name}</strong>
              <small>{user.headline || `${user.city}, ${user.state}`}</small>
            </span>
          </div>
          <nav>
            {tabs.map((t) => (
              <button key={t.id} className={tab === t.id ? 'is-active' : ''} onClick={() => goTo(t.id)}>
                <span className="dash-nav__icon">{t.icon}</span>
                {t.label}
                {badge[t.id] > 0 && <span className="chip__count">{badge[t.id]}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <div className="dash-main">
          <header className="dash-main__head">
            <span className="eyebrow">{tabs.find((t) => t.id === tab).label}</span>
            <h1>
              {tab === 'overview' ? <>Hi {firstName(user.name)}, <em>welcome back</em>.</> : tabs.find((t) => t.id === tab).label}
            </h1>
          </header>
          <div key={tab} className="dash-main__body">
            <Panel goTo={goTo} />
          </div>
        </div>
      </div>
    </section>
  );
}
