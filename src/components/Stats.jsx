import { useEffect, useState } from 'react';
import useReveal from '../hooks/useReveal.js';

const stats = [
  { value: 120, suffix: '+', label: 'Projects launched' },
  { value: 98, suffix: '%', label: 'Client satisfaction' },
  { value: 24, suffix: '', label: 'Countries reached' },
  { value: 3, suffix: 'x', label: 'Average growth lift' },
];

function Counter({ value, suffix, start }) {
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

  return <>{n}{suffix}</>;
}

export default function Stats() {
  const [ref, visible] = useReveal(0.3);
  return (
    <section className="section stats" id="impact" ref={ref}>
      <div className="container stats__grid">
        {stats.map((s, i) => (
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
