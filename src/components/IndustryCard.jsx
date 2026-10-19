import { Link } from 'react-router-dom';
import TiltCard from './TiltCard.jsx';
import { jobsInIndustry } from '../data/jobs.js';

export default function IndustryCard({ industry, showOccupations = false }) {
  const count = jobsInIndustry(industry.id).length;

  return (
    <TiltCard as={Link} to={`/jobs?industry=${industry.id}`} className="industry" style={{ '--hue': industry.hue }}>
      <span className="industry__icon" aria-hidden="true">{industry.icon}</span>
      <span className="industry__name">{industry.name}</span>
      <span className="industry__blurb">{industry.blurb}</span>
      {showOccupations && (
        <span className="industry__occ">
          {industry.occupations.map((o) => (
            <span key={o} className="tag tag--sm">{o}</span>
          ))}
        </span>
      )}
      <span className="industry__count">
        <strong>{count}</strong> open {count === 1 ? 'listing' : 'listings'} <span>→</span>
      </span>
    </TiltCard>
  );
}
