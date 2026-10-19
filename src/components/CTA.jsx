import { Link } from 'react-router-dom';
import Reveal from './Reveal.jsx';
import Magnetic from './Magnetic.jsx';
import { useApp } from '../store/AppStore.jsx';

export default function CTA({
  eyebrow = 'Free for job seekers',
  title = <>Your next job starts with <em>one</em> profile.</>,
  text = 'Five minutes to set up. Recruiters who know your trade. No fees, ever.',
}) {
  const { user } = useApp();

  return (
    <section className="section" id="get-started">
      <div className="container">
        <Reveal className="cta">
          <div className="cta__glow" aria-hidden="true" />
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{text}</p>
          <div className="page-hero__actions">
            <Magnetic>
              <Link to={user ? '/dashboard' : '/signup'} className="btn btn--gold">
                {user ? 'Go to your dashboard' : 'Create your profile'}
                <span className="btn__shine" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link to="/jobs" className="btn btn--ghost">Browse jobs</Link>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
