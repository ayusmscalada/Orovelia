import Logo from './Logo.jsx';

const columns = [
  { title: 'Studio', links: ['About', 'Careers', 'Journal', 'Press'] },
  { title: 'Services', links: ['Brand', 'Product', 'Engineering', 'AI'] },
  { title: 'Connect', links: ['LinkedIn', 'Instagram', 'Dribbble', 'X'] },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__brand">
          <a href="#top" className="nav__brand">
            <Logo />
            <span>Orovelia</span>
          </a>
          <p>Crafting the golden edge of what’s next.</p>
        </div>
        {columns.map((c) => (
          <div key={c.title} className="footer__col">
            <h4>{c.title}</h4>
            {c.links.map((l) => (
              <a key={l} href="#top">{l}</a>
            ))}
          </div>
        ))}
      </div>
      <div className="footer__word" aria-hidden="true">Orovelia</div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Orovelia. All rights reserved.</span>
        <span>Privacy · Terms</span>
      </div>
    </footer>
  );
}
