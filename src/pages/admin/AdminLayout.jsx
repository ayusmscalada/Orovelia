import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import Avatar from '../../components/Avatar.jsx';
import { AdminProvider, useAdmin } from '../../admin/AdminStore.jsx';
import { useApp } from '../../store/AppStore.jsx';
import '../../admin/admin.css';

const nav = [
  { to: '/admin', label: 'Overview', icon: '◎', end: true },
  { to: '/admin/jobs', label: 'Jobs', icon: '✦' },
  { to: '/admin/candidates', label: 'Candidates', icon: '◇' },
  { to: '/admin/messages', label: 'Messages', icon: '✉', badge: 'unread' },
];

function Shell() {
  const { user, logout } = useApp();
  const { unreadTotal, error, loading } = useAdmin();

  return (
    <section className="dashboard admin">
      <div className="container dashboard__inner">
        <aside className="dash-nav">
          <div className="dash-nav__me">
            <Avatar name={user.name || 'Admin'} hue={40} size={56} />
            <span>
              <strong>{user.name || user.email}</strong>
              <small>Administrator</small>
            </span>
          </div>
          <nav>
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'is-active' : '')}>
                <span className="dash-nav__icon">{n.icon}</span>
                {n.label}
                {n.badge === 'unread' && unreadTotal > 0 && <span className="chip__count">{unreadTotal}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="admin-nav__foot">
            <Link to="/admin/jobs/new" className="btn btn--gold admin-nav__cta">
              + Post a job <span className="btn__shine" />
            </Link>
            <button className="text-btn" onClick={logout}>Log out</button>
          </div>
        </aside>

        <div className="dash-main">
          {error && (
            <div className="form-notice admin-error" role="alert">
              Couldn’t load admin data: {error}. Make sure <code>supabase/migrations/0002_marketplace.sql</code> has been run.
            </div>
          )}
          {loading ? (
            <div className="page-loading page-loading--inline">
              <span className="loader" aria-label="Loading" />
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </section>
  );
}

export default function AdminLayout() {
  const { user, authLoading, authConfigured } = useApp();
  const { pathname } = useLocation();

  if (authLoading) {
    return (
      <section className="dashboard dashboard--loading">
        <span className="loader" aria-label="Loading" />
      </section>
    );
  }
  if (!authConfigured || !user) return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />;
  if (user.role !== 'admin') {
    return (
      <section className="dashboard">
        <div className="container">
          <div className="empty">
            <span className="empty__icon">⛔</span>
            <h3>Admins only</h3>
            <p>This area is for the Orovelia team. You’re signed in as {user.email}.</p>
            <Link to="/dashboard" className="btn btn--gold">Go to your dashboard <span className="btn__shine" /></Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <AdminProvider>
      <Shell />
    </AdminProvider>
  );
}

// Shared page header for admin screens.
export function AdminHeader({ eyebrow, title, actions }) {
  return (
    <header className="dash-main__head admin-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      {actions && <div className="admin-head__actions">{actions}</div>}
    </header>
  );
}
