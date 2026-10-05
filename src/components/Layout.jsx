import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CursorGlow from './CursorGlow.jsx';
import ScrollProgress from './ScrollProgress.jsx';

const titles = {
  '/': 'Orovelia — Crafting the golden edge of what’s next',
  '/products': 'Products — Orovelia',
  '/about': 'About — Orovelia',
  '/careers': 'Careers — Orovelia',
  '/help': 'Help Center — Orovelia',
  '/contact': 'Contact — Orovelia',
};

export default function Layout() {
  const { pathname, hash } = useLocation();

  // New page: reset the title and jump to the top.
  useEffect(() => {
    document.title = titles[pathname] || 'Page not found — Orovelia';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // A #section in the URL scrolls to it once the page has rendered.
  useEffect(() => {
    if (!hash) return;
    const id = setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
    return () => clearTimeout(id);
  }, [pathname, hash]);

  return (
    <>
      <CursorGlow />
      <ScrollProgress />
      <div className="grain" aria-hidden="true" />
      <Navbar />
      <main key={pathname} className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
