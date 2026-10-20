import { lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import { pages } from './routes.js';

const Jobs = lazy(pages.jobs);
const JobDetail = lazy(pages.job);
const Industries = lazy(pages.industries);
const HowItWorks = lazy(pages.howItWorks);
const Employers = lazy(pages.employers);
const About = lazy(pages.about);
const Help = lazy(pages.help);
const Contact = lazy(pages.contact);
const Signup = lazy(pages.signup);
const Login = lazy(pages.login);
const ResetPassword = lazy(pages.resetPassword);
const Dashboard = lazy(pages.dashboard);
const NotFound = lazy(pages.notFound);
const AdminLayout = lazy(pages.adminLayout);
const AdminOverview = lazy(pages.adminOverview);
const AdminJobs = lazy(pages.adminJobs);
const AdminJobForm = lazy(pages.adminJobForm);
const AdminJobApplicants = lazy(pages.adminJobApplicants);
const AdminCandidates = lazy(pages.adminCandidates);
const AdminMessages = lazy(pages.adminMessages);

export default function App() {
  // Once the browser is idle, fetch the pages people most often open next.
  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 2500));
    const id = idle(() => {
      pages.jobs();
      pages.job();
      pages.signup();
    });
    return () => (window.cancelIdleCallback || clearTimeout)(id);
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="industries" element={<Industries />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="employers" element={<Employers />} />
        <Route path="about" element={<About />} />
        <Route path="help" element={<Help />} />
        <Route path="contact" element={<Contact />} />
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="jobs/new" element={<AdminJobForm />} />
          <Route path="jobs/:id" element={<AdminJobApplicants />} />
          <Route path="jobs/:id/edit" element={<AdminJobForm key="edit" />} />
          <Route path="candidates" element={<AdminCandidates />} />
          <Route path="candidates/:id" element={<AdminCandidates />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>
        {/* Old routes from the studio site */}
        <Route path="products" element={<Navigate to="/jobs" replace />} />
        <Route path="careers" element={<Navigate to="/jobs" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
