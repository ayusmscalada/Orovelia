import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import Process from '../components/Process.jsx';
import TiltCard from '../components/TiltCard.jsx';
import StageTracker from '../components/StageTracker.jsx';
import Accordion from '../components/Accordion.jsx';
import Magnetic from '../components/Magnetic.jsx';
import CTA from '../components/CTA.jsx';
import { STAGES } from '../store/AppStore.jsx';
import { faqs, safetyTips } from '../data/help.js';

const stageText = {
  interested: 'You tapped “I’m interested”. Your recruiter reviews your profile — usually the same day.',
  shortlisted: 'The recruiter thinks you’re a fit and shares your profile with the employer.',
  interview: 'The employer wants to meet. Your recruiter schedules a time that works for you.',
  offer: 'You’ve got an offer! Review pay, schedule and start date — and ask anything first.',
  hired: 'Welcome aboard. Your recruiter checks in after your first week.',
};

const demoHistory = STAGES.slice(0, 3).map((s, i) => ({ stage: s.id, at: new Date(Date.now() - (2 - i) * 86400000).toISOString() }));

export default function HowItWorks() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title={<>Real recruiters. <em>Zero</em> runaround.</>}
        sub="Orovelia isn’t a job board where your application vanishes. Every listing has a recruiter behind it — and you can see exactly where you stand."
      >
        <div className="page-hero__actions">
          <Magnetic>
            <Link to="/signup" className="btn btn--gold">Create your profile <span className="btn__shine" /></Link>
          </Magnetic>
          <Magnetic>
            <Link to="/employers" className="btn btn--ghost">I’m hiring</Link>
          </Magnetic>
        </div>
      </PageHero>

      <Process />

      <section className="section" id="stages">
        <div className="container stages-layout">
          <Reveal className="stages-layout__copy">
            <span className="eyebrow">Live tracking</span>
            <h2>
              Always know <em>where</em> you stand.
            </h2>
            <p className="lead">
              Every application moves through five clear stages. You’ll get a notification — and an optional desktop
              alert — the moment anything changes.
            </p>
            <div className="stage-demo">
              <StageTracker stage="interview" history={demoHistory} />
            </div>
          </Reveal>
          <ol className="stage-list">
            {STAGES.map((s, i) => (
              <Reveal as="li" key={s.id} delay={i * 90} className="stage-list__item">
                <span className="stage-list__num">{i + 1}</span>
                <div>
                  <h3>{s.label}</h3>
                  <p>{stageText[s.id]}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="safety">
        <div className="container">
          <Reveal className="section__head section__head--center">
            <span className="eyebrow">Trust & safety</span>
            <h2>
              Safe by <em>design</em>.
            </h2>
          </Reveal>
          <div className="values">
            {safetyTips.map((t, i) => (
              <Reveal key={t.title} delay={i * 90}>
                <TiltCard className="value">
                  <span className="value__icon">{t.icon}</span>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container faq-layout">
          <Reveal className="faq-layout__aside">
            <span className="eyebrow">FAQ</span>
            <h2>
              Applying, <em>explained</em>.
            </h2>
            <Link to="/help#faq" className="link-arrow" style={{ marginTop: 24 }}>
              All questions <span>→</span>
            </Link>
          </Reveal>
          <Reveal className="faq-layout__list" delay={120}>
            <Accordion items={faqs.filter((f) => f.category === 'applications' || f.category === 'job-seekers')} />
          </Reveal>
        </div>
      </section>

      <CTA />
    </>
  );
}
