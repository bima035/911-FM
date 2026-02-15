import Hero from '@/components/Hero';
import Packages from '@/components/Packages';
import HowTo from '@/components/HowTo';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Packages />
      <HowTo />
      <Contact />
    </main>
  );
}
