import Navbar from "@/components/layout/Navbar";
import helprLogo from "@/assets/helpr-logo.png";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FeaturedServicesSection from "@/components/home/FeaturedServicesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";
import AITipsSection from "@/components/home/AITipsSection";
import AIChatBox from "@/components/home/AIChatBox";
import { AdsBanner } from "@/components/home/AdsBanner";
import { HyperLocalBanner } from "@/components/matching/NearbyHelpers";
import { QuickRebookSection } from "@/components/rebooking/QuickRebook";
import PersonalizedSuggestions from "@/components/home/PersonalizedSuggestions";
import CommunityImpactSection from "@/components/home/CommunityImpactSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background watermark logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src={helprLogo} alt="" className="w-[600px] h-auto opacity-[0.03] logo-orange" />
      </div>
      <Navbar />
      <main>
        <HeroSection />
        <section className="container mx-auto px-4 py-6">
          <AdsBanner position="homepage" />
        </section>
        <CategoriesSection />
        <section className="container mx-auto px-4 py-8">
          <HyperLocalBanner />
        </section>
        <QuickRebookSection />
        <PersonalizedSuggestions />
        <FeaturedServicesSection />
        <HowItWorksSection />
        <AITipsSection />
        <CommunityImpactSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <AIChatBox />
    </div>
  );
};

export default Index;
