import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import Magnetic from './Magnetic.jsx';
import Avatar from './Avatar.jsx';
import { useApp } from '../store/AppStore.jsx';
import { timeAgo } from '../utils/format.js';
import { prefetch } from '../routes.js';

const links = [
  { to: '/jobs', label: 'Find jobs' },
  { to: '/industries', label: 'Industries' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/employers', label: 'Employers' },
  { to: '/about', label: 'About' },
  { to: '/help', label: 'Help' },
];

function Bell() {
  const { state, unreadNotifications, readNotifications } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const toggle = () => {
    setOpen((o) => !o);
    if (!open && unreadNotifications) readNotifications();
  };

  return (
    <div className="bell" ref={ref}>
      <button className="bell__btn" onClick={toggle} aria-label={`Notifications (${unreadNotifications} unread)`} aria-expanded={open}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16zM10 20a2 2 0 0 0 4 0" />
        </svg>
        {unreadNotifications > 0 && <span className="bell__count">{unreadNotifications}</span>}
      </button>
      {open && (
        <div className="bell__menu">
          <div className="bell__head">Notifications</div>
          {state.notifications.length ? (
            <ul>
              {state.notifications.slice(0, 8).map((n) => (
                <li key={n.id}>
                  <Link to={n.to || '/dashboard'} onClick={() => setOpen(false)}>
                    <span>{n.text}</span>
                    <small>{timeAgo(n.at)}</small>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="bell__empty">You’re all caught up.</p>
          )}
          <Link to="/dashboard" className="bell__foot" onClick={() => setOpen(false)}>Open dashboard →</Link>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const navRef = useRef(null);
  const { pathname } = useLocation();
  const { user, isAdmin, authLoading } = useApp();
  const home = isAdmin ? '/admin' : '/dashboard';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Slide the glowing pill under whichever link is hovered, or the active one.
  const moveTo = useCallback((el) => {
    if (!el || !navRef.current) {
      setIndicator((i) => ({ ...i, opacity: 0 }));
      return;
    }
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
  }, []);

  const resetIndicator = useCallback(() => {
    moveTo(navRef.current?.querySelector('a.active'));
  }, [moveTo]);

  useLayoutEffect(() => {
    resetIndicator();
    window.addEventListener('resize', resetIndicator);
    document.fonts?.ready.then(resetIndicator);
    return () => window.removeEventListener('resize', resetIndicator);
  }, [pathname, resetIndicator]);

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''} ${open ? 'nav--open' : ''}`}>
      <div className="nav__inner container">
        <Link to="/" className="nav__brand">
          <Logo />
          <span>Orovelia</span>
        </Link>

        <nav className="nav__links" ref={navRef} onMouseLeave={resetIndicator}>
          <span
            className="nav__indicator"
            style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width, opacity: indicator.opacity }}
            aria-hidden="true"
          />
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onMouseEnter={(e) => {
                moveTo(e.currentTarget);
                prefetch(l.to);
              }}
              onFocus={() => prefetch(l.to)}
            >
              {l.label}
            </NavLink>
          ))}
          {!user && (
            <>
              <Link to="/login" className="nav__mobile-only">Log in</Link>
              <Link to="/signup" className="nav__mobile-only">Get started →</Link>
            </>
          )}
          {user && <Link to={home} className="nav__mobile-only">{isAdmin ? 'Admin' : 'Dashboard'}</Link>}
        </nav>

        <div className="nav__actions">
          {authLoading ? null : user ? (
            <>
              {isAdmin ? (
                <Link to="/admin" className="btn btn--ghost nav__admin" onMouseEnter={() => prefetch('/admin')}>Admin</Link>
              ) : (
                <Bell />
              )}
              <Link to={home} className="nav__me" aria-label={isAdmin ? 'Admin area' : 'Your dashboard'} onMouseEnter={() => prefetch(home)}>
                <Avatar name={user.name || 'You'} hue={40} size={36} />
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav__login" onMouseEnter={() => prefetch('/login')}>Log in</Link>
              <Magnetic className="nav__cta-wrap">
                <Link to="/signup" className="btn btn--gold nav__cta" onMouseEnter={() => prefetch('/signup')}>
                  Get started <span className="btn__shine" />
                </Link>
              </Magnetic>
            </>
          )}
        </div>

        <button
          className="nav__toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span />
        </button>
      </div>
    </header>
  );
}
