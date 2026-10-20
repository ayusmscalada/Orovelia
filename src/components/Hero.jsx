import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Stardust from './Stardust.jsx';
import SearchBar from './SearchBar.jsx';
import GoldenWaterfall from './GoldenWaterfall.jsx';
import { seedJobs } from '../data/jobs.js';
import { useJobs } from '../store/JobsStore.jsx';
import { formatPay } from '../utils/format.js';

const words = ['life', 'schedule', 'skills', 'city'];
const quick = ['Cook', 'Delivery Driver', 'Caregiver', 'House Cleaner', 'Electrician', 'Cashier'];
export default function Hero() {
  const [index, setIndex] = useState(0);
  const { jobs, getJob } = useJobs();
  // Decorative "recommendation" card — falls back to a starter listing while jobs load.
  const featured = getJob('line-cook-nashville') || jobs.find((j) => j.urgent) || jobs[0] || seedJobs[0];

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero" id="top">
      <div className="hero__aurora" aria-hidden="true">
        <span className="blob blob--gold" />
        <span className="blob blob--violet" />
        <span className="blob blob--rose" />
      </div>
      <Stardust />
      <div className="hero__grid" aria-hidden="true" />

      <div className="container hero__content">
        <Link to="/jobs" className="pill">
          <span className="pill__dot" />
          {jobs.length ? `${jobs.length} open jobs right now` : 'New jobs every day'} — always free for job seekers
          <span className="pill__arrow">→</span>
        </Link>

        <h1 className="hero__title">
          Find work that
          <br />
          fits your{' '}
          <span className="hero__rotator" aria-live="polite">
            {words.map((w, i) => (
              <span key={w} className={`hero__word ${i === index ? 'is-active' : ''}`}>
                <em>{w}.</em>
              </span>
            ))}
          </span>
        </h1>

        <p className="hero__sub">
          Local, hourly and skilled jobs — hand-picked by real recruiters, with honest pay up front.
          Build one profile, say yes to the roles you love, and we’ll take it from there.
        </p>

        <div className="hero__search">
          <SearchBar />
          <div className="hero__quick">
            <span>Popular:</span>
            {quick.map((q) => (
              <Link key={q} to={`/jobs?q=${encodeURIComponent(q)}`} className="chip chip--sm">
                {q}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="hero__falls" aria-hidden="true">
        <GoldenWaterfall />
        <div className="rec-card">
          <span className="rec-card__label">✦ New recommendation</span>
          <strong>{featured.title}</strong>
          <span className="rec-card__employer">{featured.employer}</span>
          <span className="rec-card__meta">
            {featured.remote ? 'Remote' : `${featured.city}, ${featured.state}`} · {formatPay(featured)}
          </span>
          <span className="rec-card__btn">I’m interested</span>
        </div>
        <div className="toast-card">
          <span className="toast-card__icon">✓</span>
          <span>
            <strong>You’re shortlisted!</strong>
            <small>Medical Assistant · Sacramento</small>
          </span>
        </div>
      </div>

      <a href="#how" className="scroll-cue" aria-label="Scroll down">
        <span />
      </a>
    </section>
  );
}
