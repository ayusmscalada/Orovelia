import { useEffect, useRef, useState } from 'react';

// Words light up one by one as the paragraph scrolls through the viewport.
export default function ScrollText({ text, className = '' }) {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const words = text.split(' ');

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      setProgress(Math.max(0, Math.min(1, p)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const lit = Math.round(progress * words.length);

  return (
    <p ref={ref} className={`scroll-text ${className}`}>
      {words.map((w, i) => (
        <span key={i} className={i < lit ? 'is-lit' : ''}>
          {w}{' '}
        </span>
      ))}
    </p>
  );
}
