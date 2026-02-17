import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ShopSection from "@/components/sections/ShopSection";
import CateringSection from "@/components/sections/CateringSection";
import MenuSection from "@/components/sections/MenuSection";
import RecipesSection from "@/components/sections/RecipesSection";
import AboutSection from "@/components/sections/AboutSection";
import BlogSection from "@/components/sections/BlogSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactSection from "@/components/sections/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ShopSection />
        <CateringSection />
        <MenuSection />
        <RecipesSection />
        <AboutSection />
        <BlogSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
