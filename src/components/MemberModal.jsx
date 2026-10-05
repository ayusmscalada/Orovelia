import { useEffect, useRef } from 'react';
import Avatar from './Avatar.jsx';
import useNow, { timeIn } from '../hooks/useNow.js';

const socialLabels = { linkedin: 'LinkedIn', x: 'X', github: 'GitHub', dribbble: 'Dribbble' };

export default function MemberModal({ member, onClose, onPrev, onNext }) {
  const now = useNow();
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="member-name" onClick={onClose}>
      <div className="modal__panel" style={{ '--hue': member.hue }} onClick={(e) => e.stopPropagation()} key={member.id}>
        <div className="modal__banner" aria-hidden="true" />
        <button ref={closeRef} className="modal__close" onClick={onClose} aria-label="Close profile">×</button>

        <div className="modal__header">
          <Avatar name={member.name} hue={member.hue} photo={member.photo} size={112} />
          <div>
            <span className="modal__dept">{member.department}</span>
            <h2 id="member-name">{member.name}</h2>
            <p className="modal__role">{member.role}</p>
          </div>
        </div>

        <div className="modal__grid">
          <div className="modal__main">
            <h4>About</h4>
            <p>{member.bio}</p>

            <h4>Expertise</h4>
            <div className="skills">
              {member.expertise.map((s, i) => (
                <div key={s.label} className="skill">
                  <div className="skill__head">
                    <span>{s.label}</span>
                    <span>{s.level}%</span>
                  </div>
                  <div className="skill__bar">
                    <span style={{ '--w': `${s.level}%`, animationDelay: `${200 + i * 120}ms` }} />
                  </div>
                </div>
              ))}
            </div>

            <h4>Ask me about</h4>
            <div className="tags">
              {member.askMeAbout.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </div>

          <aside className="modal__side">
            <dl className="facts">
              <div><dt>Location</dt><dd>{member.location}</dd></div>
              <div><dt>Local time</dt><dd>{timeIn(now, member.tz)} · {member.timezone}</dd></div>
              <div><dt>With us since</dt><dd>{member.joined}</dd></div>
              <div><dt>Languages</dt><dd>{member.languages.join(', ')}</dd></div>
            </dl>
            <div className="fun-fact">
              <span>✦ Fun fact</span>
              <p>{member.funFact}</p>
            </div>
            <a href={`mailto:${member.email}`} className="btn btn--gold modal__email">
              Email {member.name.split(' ')[0]} <span className="btn__shine" />
            </a>
            <div className="modal__socials">
              {Object.entries(member.socials).map(([k, href]) => (
                <a key={k} href={href} className="chip">{socialLabels[k] || k}</a>
              ))}
            </div>
          </aside>
        </div>

        <div className="modal__nav">
          <button onClick={onPrev} aria-label="Previous member">← Previous</button>
          <button onClick={onNext} aria-label="Next member">Next →</button>
        </div>
      </div>
    </div>
  );
}
