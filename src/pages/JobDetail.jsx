import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import Avatar from '../components/Avatar.jsx';
import SaveButton from '../components/SaveButton.jsx';
import JobCard from '../components/JobCard.jsx';
import StageTracker from '../components/StageTracker.jsx';
import NotFound from './NotFound.jsx';
import { getJob, getIndustry, jobs } from '../data/jobs.js';
import { getMember } from '../data/team.js';
import { formatPay, locationLabel, postedLabel } from '../utils/format.js';
import { useApp } from '../store/AppStore.jsx';

export default function JobDetail() {
  const { id } = useParams();
  const job = getJob(id);
  const navigate = useNavigate();
  const { user, applicationFor, expressInterest, withdraw } = useApp();
  const [reported, setReported] = useState(false);

  if (!job) return <NotFound />;

  const industry = getIndustry(job.industry);
  const recruiter = getMember(job.recruiterId);
  const app = applicationFor(job.id);
  const similar = jobs.filter((j) => j.industry === job.industry && j.id !== job.id).slice(0, 3);

  const onInterest = () => {
    if (!user) {
      navigate(`/signup?next=/jobs/${job.id}`);
      return;
    }
    expressInterest(job.id);
  };

  return (
    <>
      <section className="job-hero" style={{ '--hue': industry.hue }}>
        <div className="hero__aurora" aria-hidden="true">
          <span className="blob blob--gold" />
          <span className="blob blob--violet" />
        </div>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/jobs">Jobs</Link>
            <span>/</span>
            <Link to={`/jobs?industry=${industry.id}`}>{industry.name}</Link>
          </nav>
          <div className="job-hero__head">
            <span className="job-hero__icon" aria-hidden="true">{industry.icon}</span>
            <div>
              <div className="job-card__top">
                {job.urgent && <span className="pill-tag pill-tag--hot">Hiring fast</span>}
                {job.remote && <span className="pill-tag">Remote</span>}
                <span className="pill-tag">✓ Verified employer</span>
              </div>
              <h1>{job.title}</h1>
              <p className="job-hero__employer">{job.employer}</p>
            </div>
          </div>
          <div className="job-facts">
            <div><small>Pay</small><strong>{formatPay(job)}</strong></div>
            <div><small>Location</small><strong>{locationLabel(job)}</strong></div>
            <div><small>Job type</small><strong>{job.type}</strong></div>
            <div><small>Schedule</small><strong>{job.schedule}</strong></div>
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container job-layout">
          <div className="job-body">
            <Reveal>
              <h2>About the role</h2>
              <p className="job-body__summary">{job.summary}</p>
            </Reveal>
            <Reveal>
              <h2>What you’ll do</h2>
              <ul className="checklist">
                {job.responsibilities.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </Reveal>
            <Reveal>
              <h2>What you’ll need</h2>
              <ul className="bullets">
                {job.requirements.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </Reveal>
            <Reveal>
              <h2>Perks & benefits</h2>
              <div className="tags">
                {job.benefits.map((b) => <span key={b} className="tag">{b}</span>)}
              </div>
            </Reveal>
            <Reveal className="job-body__note">
              <span>🛡</span>
              <p>
                This listing was written by an Orovelia recruiter after speaking with {job.employer}. You’ll never be
                asked to pay for applying, training or equipment.{' '}
                <button className="text-btn" onClick={() => setReported(true)} disabled={reported}>
                  {reported ? 'Thanks — our safety team will review it.' : 'Report this job'}
                </button>
              </p>
            </Reveal>
          </div>

          <aside className="job-aside">
            <div className="apply-card">
              <span className="apply-card__pay">{formatPay(job)}</span>
              <span className="apply-card__posted">{postedLabel(job.postedDaysAgo)}</span>

              {app ? (
                <>
                  <div className="apply-card__status">
                    <span className="status-dot" /> You said yes to this job
                  </div>
                  <StageTracker stage={app.stage} history={app.history} />
                  <Link to={`/dashboard?tab=messages&with=${recruiter.id}`} className="btn btn--gold apply-card__btn">
                    Message {recruiter.name.split(' ')[0]} <span className="btn__shine" />
                  </Link>
                  <button className="text-btn" onClick={() => withdraw(job.id)}>Withdraw interest</button>
                </>
              ) : (
                <>
                  <button className="btn btn--gold apply-card__btn" onClick={onInterest}>
                    I’m interested <span className="btn__shine" />
                  </button>
                  <p className="apply-card__hint">
                    {user
                      ? 'One tap — your recruiter takes it from here.'
                      : 'Create a free profile in 5 minutes to say yes.'}
                  </p>
                </>
              )}
              <SaveButton jobId={job.id} withLabel />
            </div>

            <div className="recruiter-card">
              <span className="recruiter-card__label">Your recruiter for this role</span>
              <div className="recruiter-card__who">
                <Avatar name={recruiter.name} hue={recruiter.hue} photo={recruiter.photo} size={56} />
                <span>
                  <strong>{recruiter.name}</strong>
                  <small>{recruiter.role}</small>
                </span>
              </div>
              <p>Speaks {recruiter.languages.join(' & ')} · Usually replies within a few hours</p>
              <Link
                to={user ? `/dashboard?tab=messages&with=${recruiter.id}` : `/help?member=${recruiter.id}#team`}
                className="link-arrow"
              >
                {user ? 'Ask a question' : 'View profile'} <span>→</span>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="section section--tight">
          <div className="container">
            <Reveal className="section__head section__head--split">
              <div>
                <span className="eyebrow">Similar jobs</span>
                <h2>More in <em>{industry.name}</em></h2>
              </div>
              <Link to={`/jobs?industry=${industry.id}`} className="link-arrow">See all <span>→</span></Link>
            </Reveal>
            <div className="job-list">
              {similar.map((j) => <JobCard key={j.id} job={j} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
