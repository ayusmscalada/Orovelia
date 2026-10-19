import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetail from './pages/JobDetail.jsx';
import Industries from './pages/Industries.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Employers from './pages/Employers.jsx';
import About from './pages/About.jsx';
import Help from './pages/Help.jsx';
import Contact from './pages/Contact.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
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
        {/* Old routes from the studio site */}
        <Route path="products" element={<Navigate to="/jobs" replace />} />
        <Route path="careers" element={<Navigate to="/jobs" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
