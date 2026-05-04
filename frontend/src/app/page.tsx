import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { AssociationSection } from '@/components/landing/AssociationSection';
import { CalendarioSection } from '@/components/landing/CalendarioSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <>
      <LandingHeader />
      <HeroSection />
      <AssociationSection />
      <CalendarioSection />
      <FeaturesSection />
      <Footer />
    </>
  );
}
