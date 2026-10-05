import { useEffect, useRef } from 'react';
import Reveal from './Reveal.jsx';

// Vertical timeline whose glowing line fills as you scroll past it.
export default function Timeline({ items }) {
  const ref = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = (window.innerHeight * 0.6 - r.top) / r.height;
      el.style.setProperty('--fill', Math.max(0, Math.min(1, p)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <ol className="timeline" ref={ref}>
      {items.map((m, i) => (
        <Reveal as="li" key={m.year} className={`timeline__item ${i % 2 ? 'timeline__item--right' : ''}`}>
          <span className="timeline__dot" aria-hidden="true" />
          <span className="timeline__year">{m.year}</span>
          <h3>{m.title}</h3>
          <p>{m.text}</p>
        </Reveal>
      ))}
    </ol>
  );
}
