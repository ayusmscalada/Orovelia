import Reveal from './Reveal.jsx';
import { whyUs } from '../data/company.js';

function Card({ icon, title, text, size, delay }) {
  // Feed pointer position to CSS for the spotlight hover effect.
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <Reveal className={`card ${size === 'wide' ? 'card--wide' : ''}`} delay={delay} onMouseMove={onMove}>
      <div className="card__icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </Reveal>
  );
}

export default function Services() {
  return (
    <section className="section" id="why">
      <div className="container">
        <Reveal className="section__head">
          <span className="eyebrow">Why Orovelia</span>
          <h2>
            Job hunting, <em>minus</em> the guesswork.
          </h2>
        </Reveal>
        <div className="bento">
          {whyUs.map((s, i) => (
            <Card key={s.title} {...s} delay={i * 90} />
          ))}
        </div>
      </div>
    </section>
  );
}
