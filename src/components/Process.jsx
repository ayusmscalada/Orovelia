import Reveal from './Reveal.jsx';
import { steps as defaultSteps } from '../data/company.js';

export default function Process({
  id = 'how',
  eyebrow = 'How it works',
  title = <>From profile to <em>first shift</em> in three steps.</>,
  steps = defaultSteps,
}) {
  return (
    <section className="section" id={id}>
      <div className="container">
        <Reveal className="section__head">
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </Reveal>
        <ol className="process" style={{ '--cols': steps.length }}>
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} className="process__step" delay={i * 140}>
              <span className="process__num">{s.n}</span>
              <span className="process__dot" />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
