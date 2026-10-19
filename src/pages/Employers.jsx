import { useState } from 'react';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import Process from '../components/Process.jsx';
import Stats from '../components/Stats.jsx';
import TiltCard from '../components/TiltCard.jsx';
import Magnetic from '../components/Magnetic.jsx';
import Accordion from '../components/Accordion.jsx';
import { employerSteps, partners } from '../data/company.js';
import { industries, jobTypes } from '../data/jobs.js';
import { faqs } from '../data/help.js';

const benefits = [
  { icon: '✦', title: 'Only people who said yes', text: 'Every candidate you meet has seen the pay and schedule and wants the job.' },
  { icon: '◎', title: 'A recruiter who gets it', text: 'Specialists in your industry screen for licenses, certificates and fit.' },
  { icon: '⟡', title: 'Pay only for success', text: 'No posting fees. You pay when your hire completes their first two weeks.' },
  { icon: '◇', title: 'Fast first matches', text: 'Most partners meet pre-screened candidates within 72 hours.' },
];

const employerStats = [
  { value: 72, suffix: 'h', label: 'To first candidates' },
  { value: 91, suffix: '%', label: 'Hires still on after 90 days' },
  { value: 0, prefix: '$', label: 'Upfront cost' },
  { value: industries.length, label: 'Industries served' },
];

export default function Employers() {
  const [sent, setSent] = useState(false);

  // TODO: send to the partnerships backend / CRM.
  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <PageHero
        eyebrow="For employers"
        title={<>Hire people who <em>already</em> said yes.</>}
        sub="Become an Orovelia hiring partner. Tell us about the role — our recruiters write the listing, find the people, and introduce you only to candidates who want the job."
      >
        <div className="page-hero__actions">
          <Magnetic>
            <a href="#partner-form" className="btn btn--gold">Become a hiring partner <span className="btn__shine" /></a>
          </Magnetic>
          <Magnetic>
            <a href="#process" className="btn btn--ghost">How we recruit</a>
          </Magnetic>
        </div>
      </PageHero>

      <div className="marquee marquee--partners" id="partners" aria-label="Some of our hiring partners">
        <div className="marquee__track">
          {[...partners, ...partners].map((p, i) => (
            <span key={i} className="marquee__item">
              {p}
              <span className="marquee__star">✦</span>
            </span>
          ))}
        </div>
      </div>

      <Stats items={employerStats} />

      <Process
        id="process"
        eyebrow="How we recruit"
        title={<>Three steps to your <em>next</em> great hire.</>}
        steps={employerSteps}
      />

      <section className="section section--tight">
        <div className="container">
          <div className="values">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 90}>
                <TiltCard className="value">
                  <span className="value__icon">{b.icon}</span>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="partner-form">
        <div className="container contact">
          <Reveal className="contact__form-wrap">
            {sent ? (
              <div className="contact__sent">
                <span className="contact__sent-icon">✦</span>
                <h2>We’re on it.</h2>
                <p>A partnerships manager will call you within one business day to finalise your listing.</p>
                <button className="btn btn--ghost" onClick={() => setSent(false)}>Add another role</button>
              </div>
            ) : (
              <form className="contact__form" onSubmit={onSubmit}>
                <div>
                  <span className="eyebrow">Tell us about the role</span>
                  <h2 className="form-title">Start hiring in <em>minutes</em>.</h2>
                </div>
                <div className="field-row">
                  <label className="field">
                    <input required placeholder=" " name="role" />
                    <span>Job title</span>
                  </label>
                  <label className="field field--select">
                    <select required name="industry" defaultValue="">
                      <option value="" disabled>Choose…</option>
                      {industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                    <span>Industry</span>
                  </label>
                </div>
                <div className="field-row">
                  <label className="field">
                    <input required placeholder=" " name="location" />
                    <span>City, state</span>
                  </label>
                  <label className="field field--select">
                    <select name="type" defaultValue={jobTypes[0]}>
                      {jobTypes.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <span>Job type</span>
                  </label>
                </div>
                <div className="field-row">
                  <label className="field">
                    <input placeholder=" " name="pay" />
                    <span>Pay range (e.g. $18–22/hr)</span>
                  </label>
                  <label className="field">
                    <input type="number" min="1" placeholder=" " name="openings" />
                    <span>Openings</span>
                  </label>
                </div>
                <div className="field-row">
                  <label className="field">
                    <input required placeholder=" " name="company" />
                    <span>Business name</span>
                  </label>
                  <label className="field">
                    <input required type="email" placeholder=" " name="email" />
                    <span>Work email</span>
                  </label>
                </div>
                <label className="field">
                  <textarea rows={4} placeholder=" " name="notes" />
                  <span>Anything else we should know?</span>
                </label>
                <button type="submit" className="btn btn--gold contact__submit">
                  Send to our partnerships team <span className="btn__shine" />
                </button>
              </form>
            )}
          </Reveal>

          <Reveal className="contact__aside" delay={150}>
            <div className="contact__card">
              <h3>Prefer a call?</h3>
              <a href="tel:+15550142026" className="contact__email">+1 (555) 014-2026</a>
              <p>Talk to Amara and the partnerships team, Mon–Fri, 8am–6pm CT.</p>
            </div>
            <div className="contact__card">
              <h3>Employer FAQ</h3>
              <Accordion items={faqs.filter((f) => f.category === 'employers')} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
