import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Reveal from './Reveal.jsx';
import TiltCard from './TiltCard.jsx';
import Avatar from './Avatar.jsx';
import MemberModal from './MemberModal.jsx';
import useNow, { timeIn, hourIn } from '../hooks/useNow.js';
import { team, departments } from '../data/team.js';

export default function TeamDirectory() {
  const [dept, setDept] = useState('All');
  const [params, setParams] = useSearchParams();
  const now = useNow();

  const shown = useMemo(() => (dept === 'All' ? team : team.filter((m) => m.department === dept)), [dept]);

  // The open profile lives in the URL (?member=id) so it can be linked to directly.
  const openId = params.get('member');
  const openIndex = team.findIndex((m) => m.id === openId);
  const member = openIndex >= 0 ? team[openIndex] : null;

  const open = useCallback((id) => setParams({ member: id }, { replace: true }), [setParams]);
  const close = useCallback(() => setParams({}, { replace: true }), [setParams]);
  const step = useCallback(
    (dir) => open(team[(openIndex + dir + team.length) % team.length].id),
    [open, openIndex]
  );
  const prev = useCallback(() => step(-1), [step]);
  const next = useCallback(() => step(1), [step]);

  return (
    <section className="section" id="team">
      <div className="container">
        <Reveal className="section__head section__head--split">
          <div>
            <span className="eyebrow">Meet the team</span>
            <h2>
              Real people, <em>ready</em> to help.
            </h2>
            <p className="lead">
              Every question reaches someone on this page. Open a profile to see what they know best, when they’re
              online, and how to reach them directly.
            </p>
          </div>
          <div className="chips" role="group" aria-label="Filter by department">
            {departments.map((d) => {
              const count = d === 'All' ? team.length : team.filter((m) => m.department === d).length;
              return (
                <button key={d} className={`chip ${dept === d ? 'is-active' : ''}`} onClick={() => setDept(d)}>
                  {d} <span className="chip__count">{count}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="team-grid">
          {shown.map((m, i) => {
            const hour = hourIn(now, m.tz);
            const online = hour >= 9 && hour < 18;
            return (
              <Reveal key={m.id} delay={(i % 4) * 90}>
                <TiltCard
                  as="button"
                  className="member"
                  style={{ '--hue': m.hue }}
                  onClick={() => open(m.id)}
                  aria-label={`View ${m.name}'s profile`}
                >
                  <span className={`member__presence ${online ? 'is-online' : ''}`}>
                    <span className="status-dot" /> {online ? 'Online' : 'Away'} · {timeIn(now, m.tz)}
                  </span>
                  <Avatar name={m.name} hue={m.hue} photo={m.photo} size={88} />
                  <span className="member__name">{m.name}</span>
                  <span className="member__role">{m.role}</span>
                  <span className="member__loc">⌖ {m.location}</span>
                  <span className="member__tags">
                    {m.askMeAbout.slice(0, 2).map((t) => (
                      <span key={t} className="tag tag--sm">{t}</span>
                    ))}
                  </span>
                  <span className="member__cta">View profile →</span>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>

      {member && <MemberModal member={member} onClose={close} onPrev={prev} onNext={next} />}
    </section>
  );
}
