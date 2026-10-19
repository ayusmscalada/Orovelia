import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import ScrollText from '../components/ScrollText.jsx';
import Timeline from '../components/Timeline.jsx';
import Stats from '../components/Stats.jsx';
import TiltCard from '../components/TiltCard.jsx';
import Avatar from '../components/Avatar.jsx';
import OfficeClocks from '../components/OfficeClocks.jsx';
import CTA from '../components/CTA.jsx';
import { values, milestones } from '../data/company.js';
import { team } from '../data/team.js';

export default function About() {
  const leaders = team.filter((m) => m.department === 'Leadership' || /Head|Lead|Manager/.test(m.role)).slice(0, 4);

  return (
    <>
      <PageHero
        eyebrow="About Orovelia"
        title={<>Good work, <em>found</em> by good people.</>}
        sub="We’re recruiters, support specialists and engineers who believe finding local work should feel personal, honest and completely free for the people doing it."
      />

      <section className="section section--tight">
        <div className="container">
          <span className="eyebrow">Our story</span>
          <ScrollText
            className="about-manifesto"
            text="Orovelia was born from two words — oro, gold, and vela, the sail. Gold for the people who keep our cities running, the sail for the momentum a good job brings. We started in Austin placing line cooks with five neighborhood restaurants, and one belief: every listing should have a real person behind it, real pay on it, and zero cost to the worker. That belief still guides every job we publish."
          />
        </div>
      </section>

      <Stats />

      <section className="section">
        <div className="container">
          <Reveal className="section__head">
            <span className="eyebrow">What we value</span>
            <h2>
              The compass we <em>steer</em> by.
            </h2>
          </Reveal>
          <div className="values">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 100}>
                <TiltCard className="value">
                  <span className="value__num">0{i + 1}</span>
                  <span className="value__icon">{v.icon}</span>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section__head section__head--center">
            <span className="eyebrow">Our journey</span>
            <h2>
              Seven years of <em>first</em> shifts.
            </h2>
          </Reveal>
          <Timeline items={milestones} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section__head section__head--split">
            <div>
              <span className="eyebrow">Leadership</span>
              <h2>
                The people <em>behind</em> every match.
              </h2>
            </div>
            <Link to="/help#team" className="link-arrow">
              Meet the whole team <span>→</span>
            </Link>
          </Reveal>
          <div className="leaders">
            {leaders.map((m, i) => (
              <Reveal key={m.id} delay={i * 100}>
                <TiltCard as={Link} to={`/help?member=${m.id}#team`} className="leader">
                  <Avatar name={m.name} hue={m.hue} photo={m.photo} size={96} />
                  <h3>{m.name}</h3>
                  <span>{m.role}</span>
                  <small>{m.location}</small>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section__head">
            <span className="eyebrow">Where we are</span>
            <h2>
              Three hubs. <em>Every</em> city.
            </h2>
          </Reveal>
          <OfficeClocks />
        </div>
      </section>

      <CTA />
    </>
  );
}
