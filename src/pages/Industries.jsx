import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import IndustryCard from '../components/IndustryCard.jsx';
import CTA from '../components/CTA.jsx';
import { industries } from '../data/jobs.js';

const occupations = [...new Set(industries.flatMap((i) => i.occupations))].sort();

export default function Industries() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title={<>Work that <em>matters</em>, in every field.</>}
        sub={`${industries.length} industries and ${occupations.length} occupations — each with a recruiter who knows the work inside out.`}
      />

      <section className="section section--tight">
        <div className="container">
          <div className="industry-grid industry-grid--full">
            {industries.map((ind, i) => (
              <Reveal key={ind.id} delay={(i % 4) * 90}>
                <IndustryCard industry={ind} showOccupations />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section__head section__head--center">
            <span className="eyebrow">Browse by occupation</span>
            <h2>
              Know what you <em>do</em>? Jump straight in.
            </h2>
          </Reveal>
          <Reveal className="occupation-cloud">
            {occupations.map((o) => (
              <Link key={o} to={`/jobs?q=${encodeURIComponent(o)}`} className="chip">
                {o}
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <CTA />
    </>
  );
}
