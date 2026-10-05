import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import Magnetic from './Magnetic.jsx';

const links = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/careers', label: 'Careers' },
  { to: '/help', label: 'Help' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const navRef = useRef(null);
  const { pathname } = useLocation();

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
            <NavLink key={l.to} to={l.to} end={l.to === '/'} onMouseEnter={(e) => moveTo(e.currentTarget)}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Magnetic className="nav__cta-wrap">
          <Link to="/contact" className="btn btn--ghost nav__cta">
            Let's talk
          </Link>
        </Magnetic>

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
