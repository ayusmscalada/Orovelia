import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell, { PasswordField } from '../components/AuthShell.jsx';
import { useApp } from '../store/AppStore.jsx';
import { authMessage } from '../lib/supabase.js';

// Landing page for the "reset password" email link. Supabase signs the user in from the link first.
export default function ResetPassword() {
  const { authStatus, updatePassword } = useApp();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (authStatus === 'loading') {
    return <AuthShell><p className="auth__sub">Checking your reset link…</p></AuthShell>;
  }

  if (authStatus !== 'signedIn') {
    return (
      <AuthShell>
        <h2>This link has <em>expired</em>.</h2>
        <p className="auth__sub">Reset links work once and expire after an hour. Request a fresh one to continue.</p>
        <Link to="/login" className="btn btn--gold auth__submit">Back to log in <span className="btn__shine" /></Link>
      </AuthShell>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Those passwords don’t match.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await updatePassword(password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell onSubmit={onSubmit}>
      <h2>Choose a new <em>password</em>.</h2>
      <p className="auth__sub">At least 8 characters. You’ll stay signed in on this device.</p>
      <PasswordField label="New password" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} />
      <PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" minLength={8} />
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="btn btn--gold auth__submit" disabled={busy}>
        {busy ? 'Saving…' : 'Save new password'} <span className="btn__shine" />
      </button>
    </AuthShell>
  );
}
