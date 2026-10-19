import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useApp } from '../store/AppStore.jsx';

// Centered glass card used by log in, reset password and the email-confirmation screen.
export default function AuthShell({ children, onSubmit }) {
  const { authConfigured } = useApp();
  const Tag = onSubmit ? 'form' : 'div';

  return (
    <section className="auth">
      <div className="hero__aurora" aria-hidden="true">
        <span className="blob blob--gold" />
        <span className="blob blob--violet" />
      </div>
      <div className="container auth__inner auth__inner--narrow">
        <Tag className="auth__card" onSubmit={onSubmit}>
          <Link to="/" className="nav__brand auth__logo"><Logo /><span>Orovelia</span></Link>
          {!authConfigured && <ConfigNotice />}
          {children}
        </Tag>
      </div>
    </section>
  );
}

export function ConfigNotice() {
  return (
    <p className="form-notice">
      Sign-in isn’t connected yet. Add <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to <code>.env.local</code> and restart the dev server.
    </p>
  );
}

export function PasswordField({ label = 'Password', value, onChange, autoComplete = 'current-password', minLength }) {
  return (
    <label className="field field--password">
      <input
        required
        type="password"
        placeholder=" "
        value={value}
        minLength={minLength}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
      />
      <span>{label}</span>
    </label>
  );
}
