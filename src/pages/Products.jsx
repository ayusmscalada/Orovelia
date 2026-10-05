import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import TiltCard from '../components/TiltCard.jsx';
import Magnetic from '../components/Magnetic.jsx';
import CTA from '../components/CTA.jsx';
import { products, plans, comparison } from '../data/products.js';

const CYCLE_MS = 7000;

// Deterministic pseudo-random bars so each product's mockup looks distinct but stable.
function barsFor(seed) {
  let s = seed;
  return Array.from({ length: 12 }, () => {
    s = (s * 9301 + 49297) % 233280;
    return 30 + (s / 233280) * 70;
  });
}

function Mockup({ product, index }) {
  const bars = barsFor(index * 97 + 13);
  const line = bars.map((b, i) => `${(i / (bars.length - 1)) * 100},${100 - b}`).join(' ');

  return (
    <div className="mockup" key={product.id} style={{ '--accent': product.accent }}>
      <div className="mockup__chrome">
        <span /><span /><span />
        <div className="mockup__url">app.orovelia.com/{product.id}</div>
      </div>
      <div className="mockup__body">
        <aside className="mockup__side">
          <div className="mockup__logo">{product.icon}</div>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`mockup__nav ${i === 0 ? 'is-active' : ''}`} />
          ))}
        </aside>
        <div className="mockup__main">
          <div className="mockup__head">
            <div>
              <small>Orovelia {product.name}</small>
              <strong>{product.tagline}</strong>
            </div>
            <span className="mockup__pill">Live</span>
          </div>
          <div className="mockup__kpis">
            <div><small>{product.metric.label}</small><strong>{product.metric.value}</strong></div>
            <div><small>Active users</small><strong>8,214</strong></div>
            <div><small>Uptime</small><strong>99.99%</strong></div>
          </div>
          <div className="mockup__chart">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline points={line} />
            </svg>
            {bars.map((h, i) => (
              <span key={i} style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Showcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % products.length), CYCLE_MS);
    return () => clearTimeout(id);
  }, [active, paused]);

  const product = products[active];

  return (
    <section className="section section--tight">
      <div className="container">
        <Reveal
          className="showcase"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="showcase__tabs" role="tablist">
            {products.map((p, i) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={i === active}
                className={`showcase__tab ${i === active ? 'is-active' : ''} ${paused ? 'is-paused' : ''}`}
                style={{ '--accent': p.accent, '--cycle': `${CYCLE_MS}ms` }}
                onClick={() => setActive(i)}
              >
                <span className="showcase__tab-icon">{p.icon}</span>
                <span className="showcase__tab-text">
                  <strong>{p.name}</strong>
                  <small>{p.tagline}</small>
                </span>
                <span className="showcase__progress" key={`${p.id}-${active}`} />
              </button>
            ))}
          </div>
          <div className="showcase__stage">
            <div className="showcase__halo" style={{ '--accent': product.accent }} />
            <Mockup product={product} index={active} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ProductDetail({ product, index }) {
  const flip = index % 2 === 1;
  return (
    <section className={`product-detail ${flip ? 'product-detail--flip' : ''}`} id={product.id} style={{ '--accent': product.accent }}>
      <div className="container product-detail__inner">
        <Reveal className="product-detail__copy">
          <span className="product-detail__index">0{index + 1}</span>
          <span className="eyebrow">Orovelia {product.name}</span>
          <h2>{product.tagline}</h2>
          <p>{product.description}</p>
          <ul className="checklist">
            {product.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div className="product-detail__actions">
            <Link to="/contact" className="btn btn--gold">
              Request a demo <span className="btn__shine" />
            </Link>
            <Link to="/help" className="link-arrow">
              Read the docs <span>→</span>
            </Link>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <TiltCard className="product-visual" max={10}>
            <div className="product-visual__orb" />
            <div className="product-visual__icon">{product.icon}</div>
            <div className="product-visual__metric">
              <strong>{product.metric.value}</strong>
              <span>{product.metric.label}</span>
            </div>
            {product.features.slice(0, 3).map((f, i) => (
              <span key={f} className={`float-chip float-chip--${i + 1}`}>{f}</span>
            ))}
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}

const integrations = ['Slack', 'Notion', 'GitHub', 'Figma', 'Salesforce', 'HubSpot', 'Jira', 'Teams', 'Stripe', 'Google', 'Zapier', 'Linear'];

function Integrations() {
  return (
    <section className="section" id="integrations">
      <div className="container integrations">
        <Reveal className="integrations__copy">
          <span className="eyebrow">Integrations</span>
          <h2>
            Plays <em>beautifully</em> with your stack.
          </h2>
          <p className="lead">
            Over 120 native integrations, an open API, and webhooks for everything else. Orovelia slots into the tools
            your team already loves.
          </p>
          <Link to="/help#faq" className="link-arrow">
            See all integrations <span>→</span>
          </Link>
        </Reveal>
        <Reveal className="orbit" delay={150}>
          <div className="orbit__center">
            <svg width="54" height="54" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#1a1206" strokeWidth="4" />
              <path d="M32 12c10 8 12 26 0 40-6-10-6-28 0-40z" fill="#1a1206" />
            </svg>
          </div>
          <div className="orbit__ring orbit__ring--inner">
            {integrations.slice(0, 5).map((name, i, arr) => (
              <span key={name} className="orbit__item" style={{ '--angle': `${(360 / arr.length) * i}deg` }}>
                <span>{name}</span>
              </span>
            ))}
          </div>
          <div className="orbit__ring orbit__ring--outer">
            {integrations.slice(5).map((name, i, arr) => (
              <span key={name} className="orbit__item" style={{ '--angle': `${(360 / arr.length) * i}deg` }}>
                <span>{name}</span>
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section className="section" id="pricing">
      <div className="container">
        <Reveal className="section__head section__head--center">
          <span className="eyebrow">Pricing</span>
          <h2>
            Simple plans. <em>Serious</em> value.
          </h2>
          <div className="billing-toggle" role="group" aria-label="Billing period">
            <button className={!yearly ? 'is-active' : ''} onClick={() => setYearly(false)}>Monthly</button>
            <button className={yearly ? 'is-active' : ''} onClick={() => setYearly(true)}>
              Yearly <span className="badge">−20%</span>
            </button>
            <span className="billing-toggle__thumb" style={{ transform: `translateX(${yearly ? '100%' : '0'})` }} />
          </div>
        </Reveal>

        <div className="pricing">
          {plans.map((plan, i) => {
            const price = yearly ? plan.price.yearly : plan.price.monthly;
            return (
              <Reveal key={plan.name} delay={i * 120} className={`plan ${plan.featured ? 'plan--featured' : ''}`}>
                {plan.featured && <span className="plan__badge">Most popular</span>}
                <h3>{plan.name}</h3>
                <p className="plan__blurb">{plan.blurb}</p>
                <div className="plan__price">
                  {price === null ? (
                    <span className="plan__amount">Custom</span>
                  ) : (
                    <>
                      <span className="plan__currency">$</span>
                      <span className="plan__amount" key={price}>{price}</span>
                      <span className="plan__per">/ seat / mo</span>
                    </>
                  )}
                </div>
                <ul className="checklist">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link to="/contact" className={`btn ${plan.featured ? 'btn--gold' : 'btn--ghost'} plan__cta`}>
                  {plan.cta}
                  {plan.featured && <span className="btn__shine" />}
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="compare">
          <table>
            <thead>
              <tr>
                <th>Compare plans</th>
                {plans.map((p) => (
                  <th key={p.name} className={p.featured ? 'is-featured' : ''}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className={plans[i].featured ? 'is-featured' : ''}>
                      {v === true ? <span className="tick">✓</span> : v === false ? <span className="cross">—</span> : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}

export default function Products() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title={<>One suite. <em>Infinite</em> momentum.</>}
        sub="Four beautifully connected products that bring Orovelia’s studio craft to every team — from AI and analytics to automation and design systems."
      >
        <div className="page-hero__actions">
          <Magnetic>
            <a href="#pricing" className="btn btn--gold">
              See pricing <span className="btn__shine" />
            </a>
          </Magnetic>
          <Magnetic>
            <Link to="/contact" className="btn btn--ghost">Book a demo</Link>
          </Magnetic>
        </div>
      </PageHero>
      <Showcase />
      {products.map((p, i) => (
        <ProductDetail key={p.id} product={p} index={i} />
      ))}
      <Integrations />
      <Pricing />
      <CTA />
    </>
  );
}
