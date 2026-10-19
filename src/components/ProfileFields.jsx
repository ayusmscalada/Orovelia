import { useState } from 'react';
import { industries } from '../data/jobs.js';

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const SHIFTS = ['Mornings', 'Days', 'Evenings', 'Nights', 'Weekends'];
const SKILL_SUGGESTIONS = ['Customer service', 'Cash handling', 'Food safety', 'Forklift', 'CPR', 'Spanish', 'Bilingual', 'Microsoft Office', 'Driving', 'Cleaning', 'Childcare', 'Power tools'];

export const emptyProfile = {
  name: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  headline: '',
  industries: [],
  experience: [],
  skills: [],
  certificates: [],
  availability: { days: [], shifts: [] },
  resumeName: '',
};

export function completeness(p) {
  if (!p) return 0;
  const checks = [
    p.name, p.email, p.phone, p.city, p.headline,
    p.industries?.length, p.experience?.length, p.skills?.length,
    p.certificates?.length, p.availability?.days?.length, p.resumeName,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

const toggle = (list, item) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

function Field({ label, children }) {
  return (
    <label className="field">
      {children}
      <span>{label}</span>
    </label>
  );
}

export function BasicsFields({ value, onChange, lockEmail = false }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="pf">
      <Field label="Full name"><input required placeholder=" " value={value.name} onChange={set('name')} autoComplete="name" /></Field>
      <div className="field-row">
        <Field label={lockEmail ? 'Email (used to log in)' : 'Email'}><input required type="email" placeholder=" " value={value.email} onChange={set('email')} autoComplete="email" readOnly={lockEmail} /></Field>
        <Field label="Phone"><input type="tel" placeholder=" " value={value.phone} onChange={set('phone')} autoComplete="tel" /></Field>
      </div>
      <div className="field-row">
        <Field label="City"><input required placeholder=" " value={value.city} onChange={set('city')} autoComplete="address-level2" /></Field>
        <Field label="State"><input required placeholder=" " maxLength={2} value={value.state} onChange={(e) => onChange({ ...value, state: e.target.value.toUpperCase() })} /></Field>
      </div>
    </div>
  );
}

export function WorkFields({ value, onChange }) {
  const exp = value.experience;
  const setExp = (i, k, v) => onChange({ ...value, experience: exp.map((e, j) => (j === i ? { ...e, [k]: v } : e)) });

  return (
    <div className="pf">
      <Field label="Headline — e.g. “Line cook with 4 years’ experience”">
        <input placeholder=" " value={value.headline} onChange={(e) => onChange({ ...value, headline: e.target.value })} />
      </Field>

      <fieldset>
        <legend>Industries you’re interested in</legend>
        <div className="chips">
          {industries.map((i) => (
            <button
              type="button"
              key={i.id}
              className={`chip ${value.industries.includes(i.id) ? 'is-active' : ''}`}
              onClick={() => onChange({ ...value, industries: toggle(value.industries, i.id) })}
            >
              {i.icon} {i.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Experience</legend>
        <div className="exp-list">
          {exp.map((e, i) => (
            <div key={i} className="exp-row">
              <Field label="Job title"><input placeholder=" " value={e.title} onChange={(ev) => setExp(i, 'title', ev.target.value)} /></Field>
              <Field label="Employer"><input placeholder=" " value={e.company} onChange={(ev) => setExp(i, 'company', ev.target.value)} /></Field>
              <Field label="When"><input placeholder=" " value={e.years} onChange={(ev) => setExp(i, 'years', ev.target.value)} /></Field>
              <button type="button" className="icon-btn" aria-label="Remove" onClick={() => onChange({ ...value, experience: exp.filter((_, j) => j !== i) })}>×</button>
            </div>
          ))}
          <button
            type="button"
            className="add-btn"
            onClick={() => onChange({ ...value, experience: [...exp, { title: '', company: '', years: '' }] })}
          >
            + Add experience
          </button>
        </div>
      </fieldset>
    </div>
  );
}

function TagInput({ label, tags, onChange, suggestions = [] }) {
  const [text, setText] = useState('');
  const add = (t) => {
    const v = t.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setText('');
  };
  const left = suggestions.filter((s) => !tags.includes(s)).slice(0, 8);

  return (
    <fieldset>
      <legend>{label}</legend>
      <div className="tag-input">
        {tags.map((t) => (
          <span key={t} className="tag">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(tags.filter((x) => x !== t))}>×</button>
          </span>
        ))}
        <input
          value={text}
          placeholder="Type and press Enter"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(text);
            }
          }}
          onBlur={() => text && add(text)}
        />
      </div>
      {left.length > 0 && (
        <div className="chips tag-suggest">
          {left.map((s) => (
            <button type="button" key={s} className="chip chip--sm" onClick={() => add(s)}>+ {s}</button>
          ))}
        </div>
      )}
    </fieldset>
  );
}

export function SkillsFields({ value, onChange }) {
  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onChange({ ...value, resumeName: file.name });
  };

  return (
    <div className="pf">
      <TagInput label="Skills" tags={value.skills} onChange={(skills) => onChange({ ...value, skills })} suggestions={SKILL_SUGGESTIONS} />
      <TagInput
        label="Certificates & licenses"
        tags={value.certificates}
        onChange={(certificates) => onChange({ ...value, certificates })}
        suggestions={['ServSafe', 'CPR / BLS', 'CNA', 'Class A CDL', 'Forklift certified', 'Journeyman license']}
      />
      <fieldset>
        <legend>Resume (optional)</legend>
        <label className={`dropzone ${value.resumeName ? 'has-file' : ''}`}>
          <input type="file" accept=".pdf,.doc,.docx" onChange={onFile} />
          <span className="dropzone__icon">{value.resumeName ? '✓' : '⇪'}</span>
          <span>
            <strong>{value.resumeName || 'Upload your resume'}</strong>
            <small>{value.resumeName ? 'Click to replace' : 'PDF or Word, up to 5 MB — or skip, your profile is enough'}</small>
          </span>
        </label>
      </fieldset>
    </div>
  );
}

export function AvailabilityFields({ value, onChange }) {
  const av = value.availability;
  return (
    <div className="pf">
      <fieldset>
        <legend>Days you can work</legend>
        <div className="day-picker">
          {DAYS.map((d) => (
            <button
              type="button"
              key={d}
              className={av.days.includes(d) ? 'is-active' : ''}
              onClick={() => onChange({ ...value, availability: { ...av, days: toggle(av.days, d) } })}
            >
              {d}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Preferred shifts</legend>
        <div className="chips">
          {SHIFTS.map((s) => (
            <button
              type="button"
              key={s}
              className={`chip ${av.shifts.includes(s) ? 'is-active' : ''}`}
              onClick={() => onChange({ ...value, availability: { ...av, shifts: toggle(av.shifts, s) } })}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
