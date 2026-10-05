import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import OfficeClocks from '../components/OfficeClocks.jsx';

const topics = ['New project', 'Product demo', 'Support', 'Partnership', 'Careers', 'Press'];
const budgets = ['< $10k', '$10k–50k', '$50k–150k', '$150k+'];

export default function Contact() {
  const [topic, setTopic] = useState(topics[0]);
  const [budget, setBudget] = useState(budgets[1]);
  const [sent, setSent] = useState(false);

  // TODO: send the form to a real backend / form service.
  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Let’s start <em>something</em>.</>}
        sub="Tell us a little about what you’re working on. A real person will reply within one business day."
      />

      <section className="section section--tight">
        <div className="container contact">
          <Reveal className="contact__form-wrap">
            {sent ? (
              <div className="contact__sent">
                <span className="contact__sent-icon">✦</span>
                <h2>Message received.</h2>
                <p>Thank you — someone from the crew will be in touch within one business day.</p>
                <button className="btn btn--ghost" onClick={() => setSent(false)}>Send another</button>
              </div>
            ) : (
              <form className="contact__form" onSubmit={onSubmit}>
                <fieldset>
                  <legend>What can we help with?</legend>
                  <div className="chips">
                    {topics.map((t) => (
                      <button type="button" key={t} className={`chip ${topic === t ? 'is-active' : ''}`} onClick={() => setTopic(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="field-row">
                  <label className="field">
                    <input required placeholder=" " name="name" />
                    <span>Your name</span>
                  </label>
                  <label className="field">
                    <input required type="email" placeholder=" " name="email" />
                    <span>Work email</span>
                  </label>
                </div>
                <label className="field">
                  <input placeholder=" " name="company" />
                  <span>Company (optional)</span>
                </label>

                {topic === 'New project' && (
                  <fieldset>
                    <legend>Estimated budget</legend>
                    <div className="chips">
                      {budgets.map((b) => (
                        <button type="button" key={b} className={`chip ${budget === b ? 'is-active' : ''}`} onClick={() => setBudget(b)}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}

                <label className="field">
                  <textarea required rows={5} placeholder=" " name="message" />
                  <span>Tell us about it</span>
                </label>

                <button type="submit" className="btn btn--gold contact__submit">
                  Send message <span className="btn__shine" />
                </button>
              </form>
            )}
          </Reveal>

          <Reveal className="contact__aside" delay={150}>
            <div className="contact__card">
              <h3>Prefer email?</h3>
              <a href="mailto:hello@orovelia.com" className="contact__email">hello@orovelia.com</a>
              <p>For product support, visit the <Link to="/help" className="link-arrow">Help Center <span>→</span></Link></p>
            </div>
            <div className="contact__card">
              <h3>Response promise</h3>
              <ul className="checklist">
                <li>Reply within 1 business day</li>
                <li>Intro call with a senior lead</li>
                <li>Proposal in under a week</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section__head">
            <span className="eyebrow">Visit us</span>
            <h2>
              Come say <em>hello</em>.
            </h2>
          </Reveal>
          <OfficeClocks />
        </div>
      </section>
    </>
  );
}
