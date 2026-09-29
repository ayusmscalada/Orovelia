import Reveal from './Reveal.jsx';

const services = [
  {
    icon: '◎',
    title: 'Brand & Identity',
    text: 'Distinctive visual systems and voices that make people stop, feel, and remember.',
    size: 'wide',
  },
  {
    icon: '⬡',
    title: 'Product Design',
    text: 'Intuitive interfaces grounded in research and polished to the last pixel.',
  },
  {
    icon: '⟡',
    title: 'Web Engineering',
    text: 'Blazing-fast sites and apps built on modern, scalable foundations.',
  },
  {
    icon: '✧',
    title: 'AI & Automation',
    text: 'Intelligent workflows and assistants that turn complexity into momentum.',
  },
  {
    icon: '◇',
    title: 'Growth Strategy',
    text: 'Data-led roadmaps that connect bold ideas to measurable outcomes.',
    size: 'wide',
  },
];

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
      <span className="card__arrow">↗</span>
    </Reveal>
  );
}

export default function Services() {
  return (
    <section className="section" id="services">
      <div className="container">
        <Reveal className="section__head">
          <span className="eyebrow">What we do</span>
          <h2>
            Everything you need to <em>shine</em>,<br /> under one sail.
          </h2>
        </Reveal>
        <div className="bento">
          {services.map((s, i) => (
            <Card key={s.title} {...s} delay={i * 90} />
          ))}
        </div>
      </div>
    </section>
  );
}
