
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import regions from "@/data/regions";
import { Button } from "@/components/ui/button";
import { MapPin, Info, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Regions = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  const handleScroll = (regionName: string) => {
    setSelectedRegion(regionName);
    const element = document.getElementById(`region-${regionName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="bg-kabyle-terracotta/10 py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
              Découvrez les Régions Kabyles
            </h1>
            <p className="text-lg text-center max-w-3xl mx-auto text-gray-700">
              Explorez la richesse culturelle et historique des différentes régions de Kabylie, chacune avec ses traditions uniques, son patrimoine artisanal, et ses paysages à couper le souffle.
            </p>
          </div>
        </div>
        
        {/* Region navigation */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm py-3">
          <div className="container mx-auto px-4 overflow-x-auto">
            <div className="flex space-x-4 whitespace-nowrap px-2">
              {regions.map((region) => (
                <button
                  key={region.name}
                  onClick={() => handleScroll(region.name)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedRegion === region.name
                      ? "bg-kabyle-blue text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Regions content */}
        <div className="container mx-auto px-4 py-12">
          <div className="space-y-24">
            {regions.map((region) => (
              <div 
                key={region.name}
                id={`region-${region.name}`}
                className="scroll-mt-24"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Image */}
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                    <img 
                      src={region.image} 
                      alt={region.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-kabyle-terracotta font-medium">
                      {region.name}, {region.wilaya}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div>
                    <h2 className="text-3xl font-bold mb-4">{region.name}</h2>
                    
                    <div className="flex items-center text-gray-500 mb-4">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>Wilaya de {region.wilaya}</span>
                    </div>
                    
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {region.description}
                    </p>
                    
                    <div className="bg-kabyle-blue/5 p-6 rounded-xl mb-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <Info className="h-5 w-5 mr-2 text-kabyle-blue" />
                        Points d'intérêt culturel
                      </h3>
                      <ul className="space-y-3">
                        {region.cultural_highlights.map((highlight, i) => (
                          <li key={i} className="flex items-start">
                            <span className="w-2 h-2 mt-2 bg-kabyle-terracotta rounded-full mr-3 flex-shrink-0"></span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <Button className="bg-kabyle-terracotta hover:bg-kabyle-terracotta/90">
                        <Link to={`/?region=${region.name}`} className="flex items-center">
                          Voir les logements
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button variant="outline">
                        En savoir plus
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Regions;
