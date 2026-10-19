import { useEffect, useState } from 'react';
import Reveal from './Reveal.jsx';
import { stories as quotes } from '../data/company.js';

export default function Testimonials() {
  const [active, setActive] = useState(0);

  // Restarts on manual selection so the chosen quote gets a full interval.
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % quotes.length), 6000);
    return () => clearInterval(id);
  }, [active]);

  return (
    <section className="section" id="voices">
      <div className="container">
        <Reveal className="quote-card">
          <span className="quote-card__mark">“</span>
          <div className="quote-card__stage">
            {quotes.map((q, i) => (
              <figure key={q.name} className={`quote ${i === active ? 'is-active' : ''}`} aria-hidden={i !== active}>
                <blockquote>{q.text}</blockquote>
                <figcaption>
                  <span className="quote__avatar">
                    {q.name.split(' ').map((p) => p[0]).join('')}
                  </span>
                  <span>
                    <strong>{q.name}</strong>
                    <small>{q.role}</small>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="quote-card__dots">
            {quotes.map((q, i) => (
              <button
                key={q.name}
                className={i === active ? 'is-active' : ''}
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
