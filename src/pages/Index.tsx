import Navbar from "@/components/layout/Navbar";
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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <section className="container mx-auto px-4 py-6">
          <AdsBanner position="homepage" />
        </section>
        <CategoriesSection />
        <FeaturedServicesSection />
        <HowItWorksSection />
        <AITipsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <AIChatBox />
    </div>
  );
};

export default Index;
