import { useState } from 'react';

export default function Accordion({ items, emptyText = 'Nothing here yet.' }) {
  const [open, setOpen] = useState(0);

  if (!items.length) return <p className="accordion__empty">{emptyText}</p>;

  return (
    <div className="accordion">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className={`accordion__item ${isOpen ? 'is-open' : ''}`}>
            <button
              className="accordion__q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              <span>{item.q}</span>
              <span className="accordion__icon" aria-hidden="true" />
            </button>
            <div className="accordion__a">
              <div>
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
