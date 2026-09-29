import Reveal from './Reveal.jsx';

const steps = [
  { n: '01', title: 'Discover', text: 'We listen deeply, map the landscape, and find the insight that changes everything.' },
  { n: '02', title: 'Design', text: 'Ideas take shape through rapid exploration, prototypes, and honest feedback.' },
  { n: '03', title: 'Build', text: 'Engineering meets craft — robust, accessible, and delightfully fast.' },
  { n: '04', title: 'Elevate', text: 'We launch, measure, and keep refining so your momentum never fades.' },
];

export default function Process() {
  return (
    <section className="section" id="process">
      <div className="container">
        <Reveal className="section__head">
          <span className="eyebrow">How we work</span>
          <h2>
            A voyage in <em>four</em> movements.
          </h2>
        </Reveal>
        <ol className="process">
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
