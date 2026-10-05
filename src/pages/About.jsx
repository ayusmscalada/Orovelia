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
  const leaders = team.filter((m) => m.department === 'Leadership' || m.role.includes('Director') || m.role.includes('Head'));

  return (
    <>
      <PageHero
        eyebrow="About Orovelia"
        title={<>Golden ideas, <em>set</em> in motion.</>}
        sub="We’re a crew of designers, engineers and strategists spread across three continents, united by a love of craft and a stubborn belief that great work changes things."
      />

      <section className="section section--tight">
        <div className="container">
          <span className="eyebrow">Our story</span>
          <ScrollText
            className="about-manifesto"
            text="Orovelia was born from two words — oro, gold, and vela, the sail. Gold for the value we create, the sail for the momentum we bring. We started in a small Lisbon studio with three clients and one belief: that the best products feel inevitable, honest and quietly beautiful. Today that belief guides every brand we shape and every line of code we ship."
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
              Seven years of <em>fair</em> winds.
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
                The hands on the <em>helm</em>.
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
              Three studios. <em>One</em> crew.
            </h2>
          </Reveal>
          <OfficeClocks />
        </div>
      </section>

      <CTA />
    </>
  );
}
