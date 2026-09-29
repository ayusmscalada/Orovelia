import { useEffect, useState } from 'react';
import Reveal from './Reveal.jsx';

// Placeholder testimonials — replace with real client quotes.
const quotes = [
  {
    text: 'Orovelia didn’t just redesign our product — they reimagined how our customers feel about us. The results were immediate.',
    name: 'Amara Lindqvist',
    role: 'CEO, Northwind Labs',
  },
  {
    text: 'Rare combination of taste and technical depth. Every detail was considered, and they shipped ahead of schedule.',
    name: 'Daniel Okafor',
    role: 'CTO, Lumen Health',
  },
  {
    text: 'Working with them felt like adding a world-class team overnight. Our conversion rate doubled within a quarter.',
    name: 'Sofia Marchetti',
    role: 'Head of Growth, Vela Commerce',
  },
];

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
