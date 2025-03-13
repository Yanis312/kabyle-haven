
import regions from "@/data/regions";
import { cn } from "@/lib/utils";

const CulturalSection = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Découvrez la Richesse Culturelle Kabyle</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Explorez les villages emblématiques de Kabylie, chacun avec ses traditions uniques, son artisanat séculaire et son patrimoine culturel exceptionnel.
        </p>
      </div>
      
      <div className="space-y-16">
        {regions.slice(0, 3).map((region, index) => (
          <div 
            key={region.name}
            className={cn(
              "flex flex-col md:flex-row gap-8 items-center",
              index % 2 === 1 && "md:flex-row-reverse"
            )}
          >
            {/* Image */}
            <div className="w-full md:w-1/2 relative">
              <div className="aspect-video overflow-hidden rounded-xl">
                <img 
                  src={region.image} 
                  alt={region.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-kabyle-terracotta font-medium">
                {region.name}, {region.wilaya}
              </div>
            </div>
            
            {/* Content */}
            <div className="w-full md:w-1/2">
              <h3 className="text-2xl font-bold mb-4">{region.name}</h3>
              <p className="text-gray-600 mb-6">
                {region.description}
              </p>
              
              <div className="space-y-3">
                <h4 className="text-lg font-semibold">Points d'intérêt culturel:</h4>
                <ul className="space-y-2">
                  {region.cultural_highlights.map((highlight, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-2 h-2 bg-kabyle-terracotta rounded-full mr-2"></span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button className="mt-6 px-6 py-3 bg-kabyle-blue text-white rounded-full hover:bg-kabyle-blue/90 transition-colors">
                Explorer {region.name}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* View all regions button */}
      <div className="text-center mt-12">
        <button className="px-8 py-3 border-2 border-kabyle-terracotta text-kabyle-terracotta rounded-full hover:bg-kabyle-terracotta/10 transition-colors font-medium">
          Voir toutes les régions
        </button>
      </div>
    </div>
  );
};

export default CulturalSection;
