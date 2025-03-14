
import { useState } from "react";
import { Property, Wilaya, Commune } from "./PropertyForm";
import { Link } from "react-router-dom";
import { MapPin, Star, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyCardProps {
  property: Property;
  wilayas: Wilaya[];
  communes: Commune[];
  onEdit?: (property: Property) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  onHover?: () => void;
}

const PropertyCard = ({ 
  property, 
  wilayas, 
  communes, 
  onEdit, 
  onDelete, 
  isDeleting,
  onHover 
}: PropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const nextImage = () => {
    if (!property.images || property.images.length <= 1) return;
    setCurrentImageIndex((prev) => 
      prev === property.images!.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevImage = () => {
    if (!property.images || property.images.length <= 1) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images!.length - 1 : prev - 1
    );
  };

  const wilaya = wilayas.find(w => w.id === property.wilaya_id);
  const commune = communes.find(c => c.id === property.commune_id?.toString());
  
  const locationText = [
    commune?.name,
    wilaya?.name
  ].filter(Boolean).join(", ");

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      onMouseEnter={onHover}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img 
            src={property.images[currentImageIndex]} 
            alt={property.name} 
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
        
        {locationText && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent text-white p-2">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{locationText}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div>
          <h3 className="font-bold text-lg mb-2 truncate">{property.name}</h3>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          {property.rating ? (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-amber-500 mr-1" />
              <span className="text-sm font-medium">{property.rating}</span>
            </div>
          ) : (
            <div></div>
          )}
          <span className="font-bold text-lg">{property.price} DA<span className="text-sm font-normal text-gray-600">/nuit</span></span>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-800">
            {property.capacity} personne{property.capacity > 1 ? 's' : ''}
          </span>
        </div>
        
        {(onEdit || onDelete) && (
          <div className="flex justify-end gap-2 mt-4">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(property)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </Button>
            )}
            
            {onDelete && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => property.id && onDelete(property.id)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                Supprimer
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
