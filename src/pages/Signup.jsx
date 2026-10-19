import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import AuthShell, { ConfigNotice, PasswordField } from '../components/AuthShell.jsx';
import {
  AvailabilityFields,
  BasicsFields,
  SkillsFields,
  WorkFields,
  emptyProfile,
  completeness,
} from '../components/ProfileFields.jsx';
import { useApp } from '../store/AppStore.jsx';
import { authMessage } from '../lib/supabase.js';

const MIN_PASSWORD = 8;

const steps = [
  { title: 'Your account', sub: 'So recruiters can reach you — and you can log back in.', Fields: BasicsFields },
  { title: 'Your work', sub: 'What you do and what you’re looking for.', Fields: WorkFields },
  { title: 'Skills & resume', sub: 'Show what you’re great at.', Fields: SkillsFields },
  { title: 'Availability', sub: 'When can you work?', Fields: AvailabilityFields },
];

function CheckEmail({ email }) {
  const { resendConfirmation } = useApp();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const resend = async () => {
    setStatus('sending');
    setError('');
    try {
      await resendConfirmation(email);
      setStatus('sent');
    } catch (e) {
      setError(authMessage(e));
      setStatus('idle');
    }
  };

  return (
    <AuthShell>
      <div className="contact__sent">
        <span className="contact__sent-icon">✉</span>
        <h2>Check your <em>inbox</em>.</h2>
        <p>
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your profile — you’ll land
          straight on your dashboard.
        </p>
        {error && <p className="form-error">{error}</p>}
        <button type="button" className="btn btn--ghost" onClick={resend} disabled={status !== 'idle'}>
          {status === 'sent' ? '✓ Sent again' : status === 'sending' ? 'Sending…' : 'Resend the email'}
        </button>
        <p className="auth__switch" style={{ marginTop: 20 }}>
          Already confirmed? <Link to="/login">Log in</Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function Signup() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(emptyProfile);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const { user, signUp, authConfigured } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/dashboard';

  if (user) return <Navigate to={next} replace />;
  if (sentTo) return <CheckEmail email={sentTo} />;

  const { title, sub, Fields } = steps[step];
  const last = step === steps.length - 1;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (step === 0 && password !== confirm) {
      setError('Those passwords don’t match.');
      return;
    }
    if (!last) {
      setStep((s) => s + 1);
      return;
    }
    setBusy(true);
    try {
      const { needsConfirmation } = await signUp(profile, password);
      if (needsConfirmation) setSentTo(profile.email.trim());
      else navigate(next, { replace: true });
    } catch (err) {
      const msg = authMessage(err);
      setError(msg);
      // Account problems (email taken, weak password) are fixed on the first step.
      if (/email|password|account/i.test(msg)) setStep(0);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth">
      <div className="hero__aurora" aria-hidden="true">
        <span className="blob blob--gold" />
        <span className="blob blob--violet" />
      </div>
      <div className="container auth__inner">
        <aside className="auth__aside">
          <Link to="/" className="nav__brand"><Logo /><span>Orovelia</span></Link>
          <h1>
            One profile. <em>Every</em> opportunity.
          </h1>
          <ul className="checklist">
            <li>Free forever for job seekers</li>
            <li>Only recruiters see your profile</li>
            <li>Say yes to as many roles as you like</li>
            <li>Track every application live</li>
          </ul>
          <div className="auth__meter">
            <span>Profile strength</span>
            <strong>{completeness(profile)}%</strong>
            <div className="skill__bar"><span style={{ '--w': `${completeness(profile)}%` }} /></div>
          </div>
        </aside>

        <form className="auth__card" onSubmit={onSubmit}>
          {!authConfigured && <ConfigNotice />}
          <div className="wizard__progress">
            {steps.map((s, i) => (
              <button
                type="button"
                key={s.title}
                className={`wizard__step ${i === step ? 'is-current' : ''} ${i < step ? 'is-done' : ''}`}
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
              >
                <span>{i < step ? '✓' : i + 1}</span>
                <small>{s.title}</small>
              </button>
            ))}
          </div>

          <div className="wizard__body" key={step}>
            <h2>{title}</h2>
            <p className="auth__sub">{sub}</p>
            <Fields value={profile} onChange={setProfile} />
            {step === 0 && (
              <div className="field-row">
                <PasswordField label={`Password (${MIN_PASSWORD}+ characters)`} value={password} onChange={setPassword} autoComplete="new-password" minLength={MIN_PASSWORD} />
                <PasswordField label="Confirm password" value={confirm} onChange={setConfirm} autoComplete="new-password" minLength={MIN_PASSWORD} />
              </div>
            )}
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="wizard__nav">
            {step > 0 ? (
              <button type="button" className="btn btn--ghost" onClick={() => setStep((s) => s - 1)}>← Back</button>
            ) : (
              <span className="auth__switch">Have a profile? <Link to={`/login?next=${encodeURIComponent(next)}`}>Log in</Link></span>
            )}
            <button type="submit" className="btn btn--gold" disabled={busy}>
              {busy ? 'Creating your profile…' : last ? 'Create my profile' : 'Continue →'}
              <span className="btn__shine" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
