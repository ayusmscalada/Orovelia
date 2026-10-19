import { Link } from 'react-router-dom';
import Reveal from './Reveal.jsx';
import JobCard from './JobCard.jsx';
import { jobs } from '../data/jobs.js';

const latest = [...jobs].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo).slice(0, 6);

export default function LatestJobs() {
  return (
    <section className="section" id="latest">
      <div className="container">
        <Reveal className="section__head section__head--split">
          <div>
            <span className="eyebrow">Latest jobs</span>
            <h2>
              Fresh roles, <em>real</em> pay.
            </h2>
          </div>
          <Link to="/jobs" className="link-arrow">
            Browse all {jobs.length} jobs <span>→</span>
          </Link>
        </Reveal>
        <div className="job-grid">
          {latest.map((job, i) => (
            <Reveal key={job.id} delay={(i % 2) * 90}>
              <JobCard job={job} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
