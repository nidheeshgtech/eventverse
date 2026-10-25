import { useEffect, useRef } from 'react';
import { BookDemo, FinalCta } from '@/components/landing/BookDemo';
import { Hero } from '@/components/landing/Hero';
import { DemoShowcase } from '@/components/landing/DemoShowcase';
import { Benefits, HowItWorks } from '@/components/landing/Sections';
import { Footer } from '@/components/layout/Footer';
import { SiteNav } from '@/components/layout/SiteNav';
import { useReveal } from '@/hooks/useReveal';

export function LandingPage() {
  const main = useRef<HTMLElement>(null);
  useReveal(main);

  useEffect(() => {
    document.title = 'EventVerse — Interactive games for events';
  }, []);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-midnight-950">
        Skip to content
      </a>
      <SiteNav />
      <main id="main" ref={main}>
        <Hero />
        <div className="hairline section" />
        <DemoShowcase />
        <HowItWorks />
        <Benefits />
        <BookDemo />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
