import Hero from '../components/Hero.jsx';
import Marquee from '../components/Marquee.jsx';
import Services from '../components/Services.jsx';
import Stats from '../components/Stats.jsx';
import Process from '../components/Process.jsx';
import ProductTeaser from '../components/ProductTeaser.jsx';
import Testimonials from '../components/Testimonials.jsx';
import CTA from '../components/CTA.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Services />
      <Stats />
      <ProductTeaser />
      <Process />
      <Testimonials />
      <CTA />
    </>
  );
}
