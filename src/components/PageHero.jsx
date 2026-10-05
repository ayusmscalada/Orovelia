// Shorter hero used at the top of every inner page.
export default function PageHero({ eyebrow, title, sub, children }) {
  return (
    <section className="page-hero">
      <div className="hero__aurora" aria-hidden="true">
        <span className="blob blob--gold" />
        <span className="blob blob--violet" />
      </div>
      <div className="hero__grid" aria-hidden="true" />
      <div className="container page-hero__inner">
        {eyebrow && <span className="eyebrow page-hero__eyebrow">{eyebrow}</span>}
        <h1 className="page-hero__title">{title}</h1>
        {sub && <p className="page-hero__sub">{sub}</p>}
        {children}
      </div>
    </section>
  );
}
