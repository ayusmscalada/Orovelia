import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell, { PasswordField } from '../components/AuthShell.jsx';
import { useApp } from '../store/AppStore.jsx';
import { authMessage } from '../lib/supabase.js';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const { user, signIn, sendPasswordReset, resendConfirmation } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/dashboard';

  if (user) return <Navigate to={next} replace />;

  const run = async (fn) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await fn();
    } catch (e) {
      setError(authMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (mode === 'forgot') {
      run(async () => {
        await sendPasswordReset(email);
        setNotice(`If an account exists for ${email.trim()}, a reset link is on its way.`);
      });
    } else {
      run(async () => {
        await signIn(email, password);
        navigate(next, { replace: true });
      });
    }
  };

  const unconfirmed = /confirm your email/i.test(error);

  return (
    <AuthShell onSubmit={onSubmit}>
      <h2>
        {mode === 'forgot' ? <>Reset your <em>password</em>.</> : <>Welcome <em>back</em>.</>}
      </h2>
      <p className="auth__sub">
        {mode === 'forgot'
          ? 'Enter your email and we’ll send you a link to choose a new password.'
          : 'Log in to see your recommendations, applications and messages.'}
      </p>

      <label className="field">
        <input
          required
          type="email"
          placeholder=" "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <span>Email</span>
      </label>

      {mode === 'login' && (
        <>
          <PasswordField value={password} onChange={setPassword} />
          <button type="button" className="text-btn auth__forgot" onClick={() => { setMode('forgot'); setError(''); }}>
            Forgot password?
          </button>
        </>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}{' '}
          {unconfirmed && (
            <button
              type="button"
              className="text-btn"
              onClick={() => run(async () => {
                await resendConfirmation(email);
                setNotice('Confirmation email sent — check your inbox.');
              })}
            >
              Resend link
            </button>
          )}
        </p>
      )}
      {notice && <p className="form-success" role="status">{notice}</p>}

      <button type="submit" className="btn btn--gold auth__submit" disabled={busy}>
        {busy ? 'Please wait…' : mode === 'forgot' ? 'Send reset link' : 'Log in'}
        <span className="btn__shine" />
      </button>

      {mode === 'forgot' ? (
        <p className="auth__switch">
          Remembered it? <button type="button" className="text-btn" onClick={() => { setMode('login'); setNotice(''); }}>Back to log in</button>
        </p>
      ) : (
        <p className="auth__switch">
          New here? <Link to={`/signup?next=${encodeURIComponent(next)}`}>Create a free profile</Link>
        </p>
      )}
    </AuthShell>
  );
}
