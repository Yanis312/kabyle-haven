
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import properties from "@/data/properties";
import { Button } from "./ui/button";
import { X } from "lucide-react";

const PropertyGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const regionFilter = searchParams.get('region');
  
  useEffect(() => {
    if (regionFilter) {
      const filtered = properties.filter(
        property => 
          property.location.village.toLowerCase().includes(regionFilter.toLowerCase()) || 
          property.location.wilaya.toLowerCase().includes(regionFilter.toLowerCase())
      );
      setFilteredProperties(filtered.length > 0 ? filtered : properties);
    } else {
      setFilteredProperties(properties);
    }
  }, [regionFilter]);
  
  const clearFilter = () => {
    setSearchParams({});
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Logements en Kabylie</h2>
        
        {regionFilter && (
          <div className="flex items-center">
            <div className="bg-kabyle-blue/10 px-4 py-2 rounded-full text-kabyle-blue flex items-center">
              <span>Filtré par: {regionFilter}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 h-6 w-6 p-0 rounded-full" 
                onClick={clearFilter}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Aucun logement trouvé pour cette recherche.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={clearFilter}
          >
            Voir tous les logements
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyGrid;
