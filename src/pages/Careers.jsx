import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import TiltCard from '../components/TiltCard.jsx';
import Magnetic from '../components/Magnetic.jsx';
import { jobs, perks } from '../data/company.js';

const teams = ['All', ...new Set(jobs.map((j) => j.team))];

export default function Careers() {
  const [filter, setFilter] = useState('All');
  const shown = filter === 'All' ? jobs : jobs.filter((j) => j.team === filter);

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title={<>Do the <em>best</em> work of your life.</>}
        sub="Join a remote-first crew that values craft, kindness and momentum. We hire curious people from everywhere and give them room to grow."
      >
        <div className="page-hero__actions">
          <Magnetic>
            <a href="#roles" className="btn btn--gold">
              View open roles <span className="btn__shine" />
            </a>
          </Magnetic>
          <Magnetic>
            <Link to="/about" className="btn btn--ghost">Our culture</Link>
          </Magnetic>
        </div>
      </PageHero>

      <section className="section section--tight">
        <div className="container">
          <Reveal className="section__head">
            <span className="eyebrow">Life at Orovelia</span>
            <h2>
              Perks that <em>actually</em> matter.
            </h2>
          </Reveal>
          <div className="perks">
            {perks.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <TiltCard className="perk">
                  <span className="perk__icon">{p.icon}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="roles">
        <div className="container">
          <Reveal className="section__head section__head--split">
            <div>
              <span className="eyebrow">Open roles</span>
              <h2>
                Find your <em>place</em> on deck.
              </h2>
            </div>
            <div className="chips" role="group" aria-label="Filter by team">
              {teams.map((t) => (
                <button key={t} className={`chip ${filter === t ? 'is-active' : ''}`} onClick={() => setFilter(t)}>
                  {t}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="jobs">
            {shown.map((j, i) => (
              <Reveal key={j.title} delay={i * 70}>
                <Link to="/contact" className="job">
                  <span className="job__title">{j.title}</span>
                  <span className="job__meta">{j.team}</span>
                  <span className="job__meta">{j.location}</span>
                  <span className="job__type">{j.type}</span>
                  <span className="job__arrow">→</span>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal className="jobs__note">
            Don’t see your role? <Link to="/contact" className="link-arrow">Send us an open application <span>→</span></Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
