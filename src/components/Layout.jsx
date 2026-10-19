import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CursorGlow from './CursorGlow.jsx';
import ScrollProgress from './ScrollProgress.jsx';
import { getJob } from '../data/jobs.js';

const titles = {
  '/': 'Orovelia — Find work that fits your life',
  '/jobs': 'Find jobs — Orovelia',
  '/industries': 'Industries — Orovelia',
  '/how-it-works': 'How it works — Orovelia',
  '/employers': 'For employers — Orovelia',
  '/about': 'About — Orovelia',
  '/help': 'Help Center — Orovelia',
  '/contact': 'Contact — Orovelia',
  '/signup': 'Create your profile — Orovelia',
  '/login': 'Log in — Orovelia',
  '/dashboard': 'Dashboard — Orovelia',
  '/reset-password': 'Reset password — Orovelia',
};

function titleFor(pathname) {
  if (titles[pathname]) return titles[pathname];
  const job = pathname.startsWith('/jobs/') && getJob(pathname.slice(6));
  return job ? `${job.title} at ${job.employer} — Orovelia` : 'Page not found — Orovelia';
}

export default function Layout() {
  const { pathname, hash } = useLocation();

  // New page: reset the title and jump to the top.
  useEffect(() => {
    document.title = titleFor(pathname);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // A #section in the URL scrolls to it once the page has rendered.
  useEffect(() => {
    // Only plain #section anchors — auth redirects put tokens in the hash too.
    if (!/^#[A-Za-z][\w-]*$/.test(hash)) return;
    const id = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
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
