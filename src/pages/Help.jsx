import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import TiltCard from '../components/TiltCard.jsx';
import Accordion from '../components/Accordion.jsx';
import Avatar from '../components/Avatar.jsx';
import TeamDirectory from '../components/TeamDirectory.jsx';
import { helpCategories, faqs, channels, safetyTips } from '../data/help.js';
import { team } from '../data/team.js';

const suggestions = ['resume', 'apply', 'privacy', 'interview', 'employer'];

function Safety() {
  return (
    <section className="section section--tight" id="safety">
      <div className="container">
        <Reveal className="section__head section__head--center" id="privacy">
          <span className="eyebrow">Trust & safety</span>
          <h2>
            Your safety, <em>first</em>.
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
  );
}

export default function Help() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [, setParams] = useSearchParams();

  const q = query.trim().toLowerCase();

  const results = useMemo(
    () =>
      faqs.filter(
        (f) =>
          (category === 'all' || f.category === category) &&
          (!q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
      ),
    [q, category]
  );

  // People whose “ask me about” topics match the search.
  const experts = useMemo(
    () => (q.length < 2 ? [] : team.filter((m) => m.askMeAbout.some((t) => t.toLowerCase().includes(q) || q.includes(t.toLowerCase())))),
    [q]
  );

  const pickCategory = (id) => {
    setCategory(id);
    document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <PageHero
        eyebrow="Help Center"
        title={<>How can we <em>help</em> you today?</>}
        sub="Answers for job seekers and employers — or reach the exact recruiter or support specialist who knows."
      >
        <div className="help-search">
          <span className="help-search__icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search for answers — try “resume” or “interview”"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
            aria-label="Search help articles"
          />
          <kbd>↵</kbd>
        </div>
        <div className="help-suggest">
          Popular:
          {suggestions.map((s) => (
            <button key={s} className="chip chip--sm" onClick={() => setQuery(s)}>{s}</button>
          ))}
        </div>
      </PageHero>

      <section className="section section--tight">
        <div className="container">
          <div className="help-cats">
            {helpCategories.map((c, i) => (
              <Reveal key={c.id} delay={i * 90}>
                <TiltCard
                  as="button"
                  className={`help-cat ${category === c.id ? 'is-active' : ''}`}
                  onClick={() => pickCategory(c.id)}
                >
                  <span className="help-cat__icon">{c.icon}</span>
                  <span className="help-cat__title">{c.title}</span>
                  <span className="help-cat__text">{c.text}</span>
                  <span className="help-cat__count">{faqs.filter((f) => f.category === c.id).length} articles →</span>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight" id="faq">
        <div className="container faq-layout">
          <Reveal className="faq-layout__aside">
            <span className="eyebrow">FAQ</span>
            <h2>
              Questions, <em>answered</em>.
            </h2>
            <div className="chips chips--stack">
              <button className={`chip ${category === 'all' ? 'is-active' : ''}`} onClick={() => setCategory('all')}>
                All topics
              </button>
              {helpCategories.map((c) => (
                <button
                  key={c.id}
                  className={`chip ${category === c.id ? 'is-active' : ''}`}
                  onClick={() => setCategory(c.id)}
                >
                  {c.title}
                </button>
              ))}
            </div>

            {experts.length > 0 && (
              <div className="experts">
                <span className="experts__label">✦ People who can help with “{query}”</span>
                {experts.map((m) => (
                  <button key={m.id} className="expert" onClick={() => setParams({ member: m.id }, { replace: true })}>
                    <Avatar name={m.name} hue={m.hue} photo={m.photo} size={40} />
                    <span>
                      <strong>{m.name}</strong>
                      <small>{m.role}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Reveal>

          <Reveal className="faq-layout__list" delay={120}>
            {q && (
              <p className="faq-count">
                {results.length} result{results.length === 1 ? '' : 's'} for “{query}”
              </p>
            )}
            <Accordion
              key={`${category}-${q}`}
              items={results}
              emptyText="No articles match your search — our team below is happy to help directly."
            />
          </Reveal>
        </div>
      </section>

      <Safety />

      <TeamDirectory />

      <section className="section" id="channels">
        <div className="container">
          <Reveal className="section__head section__head--center">
            <span className="eyebrow">Still stuck?</span>
            <h2>
              Talk to a <em>human</em>.
            </h2>
          </Reveal>
          <div className="channels">
            {channels.map((c, i) => (
              <Reveal key={c.title} delay={i * 100}>
                <TiltCard {...(c.href.startsWith('/') ? { as: Link, to: c.href } : { as: 'a', href: c.href })} className="channel">
                  <span className="channel__icon">{c.icon}</span>
                  <h3>{c.title}</h3>
                  <span className="channel__text">{c.text}</span>
                  <span className="channel__note">{c.note}</span>
                </TiltCard>
              </Reveal>
            ))}
          </div>
          <Reveal className="note-line">
            Prefer a form? <Link to="/contact" className="link-arrow">Send us a message <span>→</span></Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
