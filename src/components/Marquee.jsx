import { industries } from '../data/jobs.js';

const items = industries.flatMap((i) => i.occupations.slice(0, 2));

export default function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {row.map((item, i) => (
          <span key={i} className="marquee__item">
            {item}
            <span className="marquee__star">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
