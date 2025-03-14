
import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { Property } from "@/data/properties";

interface PropertyCardProps {
  property: Property;
  onHover?: () => void;
}

const PropertyCard = ({ property, onHover }: PropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      onMouseEnter={onHover}
    >
      <Link to={`/property/${property.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={property.images[currentImageIndex]} 
            alt={property.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
          
          {property.images.length > 1 && (
            <>
              <button 
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevImage();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextImage();
                }}
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
              <span className="text-sm">{property.location.village}, {property.location.wilaya}</span>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/property/${property.id}`}>
          <h3 className="font-bold text-lg mb-2 hover:text-kabyle-blue truncate">{property.title}</h3>
        </Link>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-amber-500 mr-1" />
            <span className="text-sm font-medium">{property.rating} ({property.reviewCount} avis)</span>
          </div>
          <span className="font-bold text-lg">{property.price} DA<span className="text-sm font-normal text-gray-600">/nuit</span></span>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {property.features.slice(0, 3).map((feature, index) => (
            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-800">
              {feature}
            </span>
          ))}
          {property.features.length > 3 && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-800">
              +{property.features.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
