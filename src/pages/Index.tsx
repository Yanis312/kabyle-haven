
import CulturalSection from "@/components/CulturalSection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import PropertyGrid from "@/components/PropertyGrid";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <PropertyGrid />
        <CulturalSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
