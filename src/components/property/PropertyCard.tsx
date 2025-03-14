
import { ImageIcon, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Property, Wilaya, Commune } from "./PropertyForm";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
  wilayas: Wilaya[];
  communes: Commune[];
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const PropertyCard = ({
  property,
  wilayas,
  communes,
  onEdit,
  onDelete,
  isDeleting,
}: PropertyCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  const getCommune = (id: number | null | undefined) => {
    if (!id) return "Non spécifié";
    const commune = communes.find(c => Number(c.id) === id);
    return commune ? commune.name : "Non spécifié";
  };
  
  const getWilaya = (id: number | null | undefined) => {
    if (!id) return "Non spécifié";
    const wilaya = wilayas.find(w => w.id === id);
    return wilaya ? wilaya.name : "Non spécifié";
  };

  // Ensure property.images is an array or set to empty array if null
  const images = property.images && Array.isArray(property.images) ? property.images : [];
  
  console.log(`PropertyCard: Property ${property.id} has ${images.length} images:`, images);

  const mainImage = images.length > 0 ? images[0] : null;

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gray-100 relative">
        {mainImage && !imageError ? (
          <img 
            src={mainImage} 
            alt={property.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Image failed to load:", mainImage);
              setImageError(true);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <ImageIcon className="h-12 w-12" />
            {imageError && <p className="text-xs mt-2">L'image n'a pas pu être chargée</p>}
          </div>
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="line-clamp-1">{property.name}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-500 line-clamp-2">
            {property.description || "Aucune description"}
          </p>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Prix:</span>{" "}
              {new Intl.NumberFormat('fr-FR').format(property.price)} DA
            </div>
            <div>
              <span className="font-medium">Capacité:</span>{" "}
              {property.capacity} personnes
            </div>
            <div>
              <span className="font-medium">Wilaya:</span>{" "}
              {getWilaya(property.wilaya_id)}
            </div>
            <div>
              <span className="font-medium">Commune:</span>{" "}
              {getCommune(property.commune_id)}
            </div>
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
              {images.slice(1, 4).map((img, idx) => (
                <div key={idx} className="relative h-12 w-12 rounded overflow-hidden">
                  <img 
                    src={img} 
                    alt={`${property.name} image ${idx + 2}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error("Thumbnail failed to load:", img);
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Error";
                    }}
                  />
                </div>
              ))}
              {images.length > 4 && (
                <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                  +{images.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => onEdit(property)}
        >
          <Edit className="h-4 w-4 mr-2" /> Modifier
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={() => onDelete(property.id)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
