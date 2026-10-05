import Reveal from './Reveal.jsx';
import useNow, { timeIn, hourIn } from '../hooks/useNow.js';
import { offices } from '../data/company.js';

export default function OfficeClocks() {
  const now = useNow();
  return (
    <div className="offices">
      {offices.map((o, i) => {
        const hour = hourIn(now, o.tz);
        const open = hour >= 9 && hour < 18;
        return (
          <Reveal key={o.city} delay={i * 100} className="office">
            <div className="office__time">{timeIn(now, o.tz)}</div>
            <h3>{o.city}</h3>
            <span className="office__role">{o.role}</span>
            <p>{o.address}</p>
            <span className={`office__status ${open ? 'is-open' : ''}`}>
              <span className="status-dot" /> {open ? 'Studio open' : 'Studio closed'}
            </span>
          </Reveal>
        );
      })}
    </div>
  );
}
