import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CursorGlow from './CursorGlow.jsx';
import ScrollProgress from './ScrollProgress.jsx';
import { useJobs } from '../store/JobsStore.jsx';

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

function titleFor(pathname, getJob) {
  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith('/admin')) return 'Admin — Orovelia';
  const job = pathname.startsWith('/jobs/') && getJob(pathname.slice(6));
  return job ? `${job.title} at ${job.employer} — Orovelia` : 'Page not found — Orovelia';
}

export default function Layout() {
  const { pathname, hash } = useLocation();
  const { getJob } = useJobs();
  const isAdminArea = pathname.startsWith('/admin');

  // New page: jump to the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Title (re-runs when jobs finish loading, so a job page opened directly gets its title).
  useEffect(() => {
    document.title = titleFor(pathname, getJob);
  }, [pathname, getJob]);

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
      {!isAdminArea && <CursorGlow />}
      <ScrollProgress />
      <Navbar />
      {/* Re-key per page for the enter animation — but keep the admin area mounted across its screens. */}
      <main key={isAdminArea ? '/admin' : pathname} className="page">
        <Suspense fallback={<div className="page-loading"><span className="loader" aria-label="Loading" /></div>}>
          <Outlet />
        </Suspense>
      </main>
      {!isAdminArea && <Footer />}
    </>
  );
}
