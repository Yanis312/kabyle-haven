
import { Heart } from "lucide-react";
import { Property } from "@/data/properties";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  return (
    <Link to={`/property/${property.id}`} className="group">
      <div className="kabyle-card group-hover:translate-y-[-8px] transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
          <img 
            src={property.images[0]} 
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Favorite button */}
          <button 
            className="absolute top-3 right-3 bg-white/70 backdrop-blur-sm p-2 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-colors", 
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
              )} 
            />
          </button>
          
          {/* Features tags */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            {property.features.slice(0, 2).map((feature, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full text-kabyle-terracotta font-medium"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-lg line-clamp-1">{property.title}</h3>
            <div className="flex items-center">
              <span className="text-sm font-medium">{property.rating}</span>
              <span className="text-yellow-500 ml-1">★</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-1">
            {property.location.village}, {property.location.wilaya}
          </p>
          
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {property.description.substring(0, 100)}...
          </p>
          
          <div className="mt-4 flex justify-between items-center">
            <div>
              <span className="font-semibold text-lg">{property.price} €</span>
              <span className="text-sm text-gray-500"> / nuit</span>
            </div>
            
            <div className="text-xs text-gray-500">
              {property.reviewCount} avis
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
