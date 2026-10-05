import { Link } from 'react-router-dom';
import Reveal from './Reveal.jsx';
import TiltCard from './TiltCard.jsx';
import { products } from '../data/products.js';

export default function ProductTeaser() {
  return (
    <section className="section" id="products">
      <div className="container">
        <Reveal className="section__head section__head--split">
          <div>
            <span className="eyebrow">The Orovelia suite</span>
            <h2>
              Four products. <em>One</em> constellation.
            </h2>
          </div>
          <Link to="/products" className="link-arrow">
            Explore all products <span>→</span>
          </Link>
        </Reveal>
        <div className="teaser-grid">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={i * 100}>
              <TiltCard as={Link} to={`/products#${p.id}`} className="teaser" style={{ '--accent': p.accent }}>
                <span className="teaser__icon">{p.icon}</span>
                <span className="teaser__name">{p.name}</span>
                <span className="teaser__tag">{p.tagline}</span>
                <span className="teaser__metric">
                  <strong>{p.metric.value}</strong> {p.metric.label}
                </span>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
