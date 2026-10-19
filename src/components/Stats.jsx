import { useEffect, useState } from 'react';
import useReveal from '../hooks/useReveal.js';
import { jobs, industries } from '../data/jobs.js';
import { team } from '../data/team.js';

const defaultStats = [
  { value: jobs.length, label: 'Open jobs' },
  { value: industries.length, label: 'Industries' },
  { value: industries.reduce((n, i) => n + i.occupations.length, 0), label: 'Occupations' },
  { value: team.length, label: 'People helping you' },
  { value: 0, prefix: '$', label: 'Cost to job seekers' },
];

function Counter({ value, prefix = '', suffix = '', start }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!start) return;
    let raf;
    const t0 = performance.now();
    const duration = 1800;
    const tick = (t) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value]);

  return <>{prefix}{n}{suffix}</>;
}

export default function Stats({ items = defaultStats }) {
  const [ref, visible] = useReveal(0.3);
  return (
    <section className="section stats" id="impact" ref={ref}>
      <div className="container stats__grid" style={{ '--cols': items.length }}>
        {items.map((s, i) => (
          <div
            key={s.label}
            className={`stat reveal ${visible ? 'is-visible' : ''}`}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            <div className="stat__value">
              <Counter {...s} start={visible} />
            </div>
            <div className="stat__label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
