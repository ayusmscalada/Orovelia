import { useState } from 'react';
import Reveal from './Reveal.jsx';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  // TODO: wire up to a real backend / form service.
  const onSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail('');
  };

  return (
    <section className="section" id="contact">
      <div className="container">
        <Reveal className="cta">
          <div className="cta__glow" aria-hidden="true" />
          <span className="eyebrow">Ready when you are</span>
          <h2>
            Let’s build something <em>luminous</em> together.
          </h2>
          <p>Tell us where you want to go. We’ll reply within one business day.</p>

          {sent ? (
            <p className="cta__thanks">✦ Thank you — we’ll be in touch soon.</p>
          ) : (
            <form className="cta__form" onSubmit={onSubmit}>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <button type="submit" className="btn btn--gold">
                Get in touch
                <span className="btn__shine" />
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
