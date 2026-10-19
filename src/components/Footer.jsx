import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

const columns = [
  {
    title: 'Job seekers',
    links: [
      { to: '/jobs', label: 'Browse jobs' },
      { to: '/industries', label: 'Industries' },
      { to: '/how-it-works', label: 'How it works' },
      { to: '/signup', label: 'Create a profile' },
    ],
  },
  {
    title: 'Employers',
    links: [
      { to: '/employers', label: 'Become a hiring partner' },
      { to: '/employers#partners', label: 'Our partners' },
      { to: '/employers#process', label: 'How we recruit' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About Orovelia' },
      { to: '/help#team', label: 'Our team' },
      { to: '/contact', label: 'Contact us' },
    ],
  },
  {
    title: 'Trust & safety',
    links: [
      { to: '/how-it-works#safety', label: 'Safety guidelines' },
      { to: '/help#faq', label: 'Help Center' },
      { to: '/help#privacy', label: 'Privacy' },
    ],
  },
];

const socials = ['LinkedIn', 'Instagram', 'Facebook', 'TikTok'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__brand">
          <Link to="/" className="nav__brand">
            <Logo />
            <span>Orovelia</span>
          </Link>
          <p>Local, hourly and skilled jobs — hand-picked by real recruiters. Always free for job seekers.</p>
          <div className="footer__socials">
            {socials.map((s) => (
              <a key={s} href="#" aria-label={s}>{s}</a>
            ))}
          </div>
        </div>
        {columns.map((c) => (
          <div key={c.title} className="footer__col">
            <h4>{c.title}</h4>
            {c.links.map((l) => (
              <Link key={l.label} to={l.to}>{l.label}</Link>
            ))}
          </div>
        ))}
      </div>
      <div className="footer__word" aria-hidden="true">Orovelia</div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Orovelia. All rights reserved.</span>
        <span className="footer__status">
          <span className="status-dot" /> Free for job seekers — always
        </span>
        <span>Privacy · Terms</span>
      </div>
    </footer>
  );
}
