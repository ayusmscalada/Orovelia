import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Stardust from './Stardust.jsx';
import Magnetic from './Magnetic.jsx';

const words = ['brands', 'products', 'experiences', 'futures'];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero" id="top">
      <div className="hero__aurora" aria-hidden="true">
        <span className="blob blob--gold" />
        <span className="blob blob--violet" />
        <span className="blob blob--rose" />
      </div>
      <Stardust />
      <div className="hero__grid" aria-hidden="true" />

      <div className="container hero__content">
        <a href="#services" className="pill">
          <span className="pill__dot" />
          Now shaping 2026 — explore the studio
          <span className="pill__arrow">→</span>
        </a>

        <h1 className="hero__title">
          We craft golden
          <br />
          <span className="hero__rotator" aria-live="polite">
            {words.map((w, i) => (
              <span key={w} className={`hero__word ${i === index ? 'is-active' : ''}`}>
                <em>{w}</em>
              </span>
            ))}
          </span>
          <br />
          that set sail.
        </h1>

        <p className="hero__sub">
          Orovelia is a design &amp; technology house blending strategy, craft and
          code to help ambitious teams build what comes next — beautifully.
        </p>

        <div className="hero__actions">
          <Magnetic>
            <Link to="/contact" className="btn btn--gold">
              Start a project
              <span className="btn__shine" />
            </Link>
          </Magnetic>
          <Magnetic>
            <Link to="/products" className="btn btn--ghost">Explore products</Link>
          </Magnetic>
        </div>
      </div>

      <div className="hero__orb" aria-hidden="true">
        <div className="orb">
          <div className="orb__core" />
          <div className="orb__ring orb__ring--1" />
          <div className="orb__ring orb__ring--2" />
          <div className="orb__ring orb__ring--3" />
        </div>
      </div>

      <a href="#services" className="scroll-cue" aria-label="Scroll down">
        <span />
      </a>
    </section>
  );
}
