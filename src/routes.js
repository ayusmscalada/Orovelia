// Route chunks. Each page downloads only when visited (or prefetched on hover),
// so the landing page ships just the code it needs.
export const pages = {
  jobs: () => import('./pages/Jobs.jsx'),
  job: () => import('./pages/JobDetail.jsx'),
  industries: () => import('./pages/Industries.jsx'),
  howItWorks: () => import('./pages/HowItWorks.jsx'),
  employers: () => import('./pages/Employers.jsx'),
  about: () => import('./pages/About.jsx'),
  help: () => import('./pages/Help.jsx'),
  contact: () => import('./pages/Contact.jsx'),
  signup: () => import('./pages/Signup.jsx'),
  login: () => import('./pages/Login.jsx'),
  resetPassword: () => import('./pages/ResetPassword.jsx'),
  dashboard: () => import('./pages/Dashboard.jsx'),
  notFound: () => import('./pages/NotFound.jsx'),
  // Admin area — never downloaded by regular visitors.
  adminLayout: () => import('./pages/admin/AdminLayout.jsx'),
  adminOverview: () => import('./pages/admin/AdminOverview.jsx'),
  adminJobs: () => import('./pages/admin/AdminJobs.jsx'),
  adminJobForm: () => import('./pages/admin/AdminJobForm.jsx'),
  adminJobApplicants: () => import('./pages/admin/AdminJobApplicants.jsx'),
  adminCandidates: () => import('./pages/admin/AdminCandidates.jsx'),
  adminMessages: () => import('./pages/admin/AdminMessages.jsx'),
};

const byPath = {
  '/jobs': pages.jobs,
  '/industries': pages.industries,
  '/how-it-works': pages.howItWorks,
  '/employers': pages.employers,
  '/about': pages.about,
  '/help': pages.help,
  '/contact': pages.contact,
  '/signup': pages.signup,
  '/login': pages.login,
  '/dashboard': pages.dashboard,
  '/admin': pages.adminLayout,
};

// Warm the chunk for a link the user is about to click. Safe to call repeatedly.
export function prefetch(to) {
  const path = typeof to === 'string' ? to.split(/[?#]/)[0] : '';
  const load = byPath[path] || (path.startsWith('/jobs/') ? pages.job : null);
  load?.().catch(() => {});
}
