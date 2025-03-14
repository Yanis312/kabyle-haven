import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash,
  Users,
  Banknote,
  Star,
  Calendar,
  Loader2
} from "lucide-react";
import { Property, Wilaya, Commune } from "./PropertyForm";

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
  isDeleting
}: PropertyCardProps) => {
  
  const wilayaName = useMemo(() => {
    if (!property.wilaya_id) return "Non spécifiée";
    const wilaya = wilayas.find(w => w.id === property.wilaya_id);
    return wilaya ? wilaya.name : "Non spécifiée";
  }, [property.wilaya_id, wilayas]);
  
  const communeName = useMemo(() => {
    if (!property.commune_id) return "Non spécifiée";
    const commune = communes.find(c => Number(c.id) === property.commune_id);
    return commune ? commune.name : "Non spécifiée";
  }, [property.commune_id, communes]);
  
  const previewImage = useMemo(() => {
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      return property.images[0];
    }
    return "https://via.placeholder.com/300x200?text=Pas+d'image";
  }, [property.images]);
  
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <img src={previewImage} alt={property.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-xl font-bold">{property.name}</h3>
          <p className="text-sm opacity-90">{wilayaName}, {communeName}</p>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-gray-500" />
            <span>{property.capacity} personnes</span>
          </div>
          <div className="flex items-center">
            <Banknote className="h-4 w-4 mr-2 text-gray-500" />
            <span>{property.price} DA / nuit</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-500" />
            {property.rating ? property.rating : "Nouveau"}
          </Badge>
          
          {property.availability && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Disponible
            </Badge>
          )}
        </div>
        
        <div className="flex justify-between mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(property)}
            className="flex items-center gap-1"
          >
            <Pencil className="h-3 w-3" />
            Modifier
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(property.id || '')}
            disabled={isDeleting}
            className="flex items-center gap-1"
          >
            {isDeleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash className="h-3 w-3" />
            )}
            Supprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
