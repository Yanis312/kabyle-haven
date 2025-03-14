
import { useState } from "react";
import { Property } from "@/data/properties";
import { MapPin, Star } from "lucide-react";

interface PropertyCardProps {
  property: Property;
  onHover?: () => void;
}

const PropertyCard = ({ property, onHover }: PropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!property.images || property.images.length <= 1) return;
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!property.images || property.images.length <= 1) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };
  
  // Use title or name (title is for backward compatibility)
  const displayTitle = property.title || property.name;
  
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      onMouseEnter={onHover}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img 
            src={property.images[currentImageIndex]} 
            alt={displayTitle} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Aucune image</span>
          </div>
        )}
        
        {property.images && property.images.length > 1 && (
          <>
            <button 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-70 hover:opacity-100"
              onClick={prevImage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-70 hover:opacity-100"
              onClick={nextImage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent text-white p-2">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {property.location?.village || "Non spécifié"}, {property.location?.wilaya || "Non spécifié"}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div>
          <h3 className="font-bold text-lg mb-2 truncate">{displayTitle}</h3>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          {property.rating > 0 && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-amber-500 mr-1" />
              <span className="text-sm font-medium">{property.rating}</span>
            </div>
          )}
          <span className="font-bold text-lg">{property.price} DA<span className="text-sm font-normal text-gray-600">/nuit</span></span>
        </div>
        
        {property.features && property.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {property.features.map((feature, index) => (
              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-800">
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
