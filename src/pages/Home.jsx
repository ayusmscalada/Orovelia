import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Marquee from '../components/Marquee.jsx';
import Stats from '../components/Stats.jsx';
import Process from '../components/Process.jsx';
import LatestJobs from '../components/LatestJobs.jsx';
import IndustryCard from '../components/IndustryCard.jsx';
import Services from '../components/Services.jsx';
import Testimonials from '../components/Testimonials.jsx';
import Accordion from '../components/Accordion.jsx';
import Reveal from '../components/Reveal.jsx';
import CTA from '../components/CTA.jsx';
import { industries } from '../data/jobs.js';
import { useJobs } from '../store/JobsStore.jsx';
import { faqs } from '../data/help.js';

const homeFaqs = [faqs[0], faqs[6], faqs[3], faqs[4]];

export default function Home() {
  const { jobsInIndustry } = useJobs();
  const popular = [...industries].sort((a, b) => jobsInIndustry(b.id).length - jobsInIndustry(a.id).length).slice(0, 4);

  return (
    <div className="home">
      <Hero />
      <Marquee />
      <Stats />
      <Process />
      <LatestJobs />

      <section className="section" id="industries">
        <div className="container">
          <Reveal className="section__head section__head--split">
            <div>
              <span className="eyebrow">Popular industries</span>
              <h2>
                Find your <em>field</em>.
              </h2>
            </div>
            <Link to="/industries" className="link-arrow">
              All {industries.length} industries <span>→</span>
            </Link>
          </Reveal>
          <div className="industry-grid">
            {popular.map((ind, i) => (
              <Reveal key={ind.id} delay={i * 90}>
                <IndustryCard industry={ind} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Services />
      <Testimonials />

      <section className="section section--tight" id="faq">
        <div className="container faq-layout">
          <Reveal className="faq-layout__aside">
            <span className="eyebrow">FAQ</span>
            <h2>
              Questions, <em>answered</em>.
            </h2>
            <p className="lead">Everything you need to know before you create your profile.</p>
            <Link to="/help#faq" className="link-arrow" style={{ marginTop: 24 }}>
              Visit the Help Center <span>→</span>
            </Link>
          </Reveal>
          <Reveal className="faq-layout__list" delay={120}>
            <Accordion items={homeFaqs} />
          </Reveal>
        </div>
      </section>

      <CTA />
    </div>
  );
}
