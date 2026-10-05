import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

const columns = [
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/careers', label: 'Careers' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Products',
    links: [
      { to: '/products#aurum', label: 'Aurum' },
      { to: '/products#halo', label: 'Halo' },
      { to: '/products#sail', label: 'Sail' },
      { to: '/products#forge', label: 'Forge' },
      { to: '/products#pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Support',
    links: [
      { to: '/help', label: 'Help Center' },
      { to: '/help#faq', label: 'FAQ' },
      { to: '/help#team', label: 'Our Team' },
      { to: '/help#channels', label: 'Contact support' },
    ],
  },
];

const socials = ['LinkedIn', 'Instagram', 'Dribbble', 'X'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__brand">
          <Link to="/" className="nav__brand">
            <Logo />
            <span>Orovelia</span>
          </Link>
          <p>Crafting the golden edge of what’s next.</p>
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
          <span className="status-dot" /> All systems operational
        </span>
        <span>Privacy · Terms</span>
      </div>
    </footer>
  );
}
