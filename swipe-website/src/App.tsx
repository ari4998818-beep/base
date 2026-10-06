import { useEffect, useState } from 'react';
import { initSmoothScroll, ScrollTrigger } from './lib/motion';
import Loader from './components/Loader';
import Nav from './components/Nav';
import Hero from './components/Hero';
import ProductIntro from './components/ProductIntro';
import HowItWorks from './components/HowItWorks';
import SwipeClean from './components/SwipeClean';
import ColorMoment from './components/ColorMoment';
import EverydayUses from './components/EverydayUses';
import Benefits from './components/Benefits';
import BrandStatement from './components/BrandStatement';
import FinalCta from './components/FinalCta';
import Footer from './components/Footer';

export default function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const cleanup = initSmoothScroll();
    return cleanup;
  }, []);

  useEffect(() => {
    if (loaded) ScrollTrigger.refresh();
  }, [loaded]);

  return (
    <>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      <Nav />
      <main>
        <Hero />
        <ProductIntro />
        <HowItWorks />
        <SwipeClean />
        <ColorMoment />
        <EverydayUses />
        <Benefits />
        <BrandStatement />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
