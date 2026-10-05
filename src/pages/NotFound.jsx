import { Link } from 'react-router-dom';
import Stardust from '../components/Stardust.jsx';
import Magnetic from '../components/Magnetic.jsx';

export default function NotFound() {
  return (
    <section className="not-found">
      <Stardust />
      <div className="not-found__orb" aria-hidden="true" />
      <div className="container not-found__inner">
        <span className="eyebrow">Lost at sea</span>
        <h1 className="not-found__code">404</h1>
        <p>The page you’re looking for has drifted off course.</p>
        <div className="page-hero__actions">
          <Magnetic>
            <Link to="/" className="btn btn--gold">
              Back to home <span className="btn__shine" />
            </Link>
          </Magnetic>
          <Magnetic>
            <Link to="/help" className="btn btn--ghost">Visit Help Center</Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
