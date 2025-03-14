
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import PropertyMap from "./PropertyMap";
import LocationFilter from "./LocationFilter";
import properties from "@/data/properties";
import { Button } from "./ui/button";
import { Filter, X, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PropertyGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [clearFilters, setClearFilters] = useState(false);
  
  const regionFilter = searchParams.get('region');
  const wilayaFilter = searchParams.get('wilaya');
  const communeFilter = searchParams.get('commune');
  
  // Handle wilaya selection
  const handleWilayaChange = useCallback((wilayaId: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (wilayaId) {
      newParams.set('wilaya', wilayaId);
    } else {
      newParams.delete('wilaya');
    }
    
    // Clear commune when wilaya changes
    newParams.delete('commune');
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);
  
  // Handle commune selection
  const handleCommuneChange = useCallback((communeId: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (communeId) {
      newParams.set('commune', communeId);
    } else {
      newParams.delete('commune');
    }
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);
  
  // Apply regional filters
  useEffect(() => {
    let filtered = [...properties];
    
    if (regionFilter) {
      filtered = filtered.filter(
        property => 
          property.location.village.toLowerCase().includes(regionFilter.toLowerCase()) || 
          property.location.wilaya.toLowerCase().includes(regionFilter.toLowerCase())
      );
    }
    
    // Apply wilaya filter
    if (wilayaFilter) {
      // In a real implementation, we would query wilaya names from database
      // For now, we'll just filter by exact match with the wilaya in location
      filtered = filtered.filter(
        property => property.location.wilaya.toLowerCase() === 'tizi ouzou'
      );
    }
    
    // Apply commune filter
    if (communeFilter) {
      // In a real implementation, we would query commune names from database
      // For now, we'll just filter by exact match with the village in location
      filtered = filtered.filter(
        property => property.location.village.toLowerCase() === 'ath yenni'
      );
    }
    
    setFilteredProperties(filtered.length > 0 ? filtered : []);
    setClearFilters(false);
  }, [regionFilter, wilayaFilter, communeFilter]);
  
  // Handle marker click
  const handleMarkerClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    
    // Scroll to the corresponding property card
    const element = document.getElementById(`property-${propertyId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  // Handle marker hover
  const handleMarkerHover = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
  };
  
  // Handle property card hover
  const handlePropertyHover = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
  };
  
  const clearFilter = () => {
    setSearchParams({});
    setClearFilters(true);
  };
  
  const toggleMap = () => {
    setShowMap(prev => !prev);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <h2 className="text-3xl font-bold">Logements en Kabylie</h2>
          
          {(regionFilter || wilayaFilter || communeFilter) && (
            <div className="flex items-center mt-2">
              <div className="bg-kabyle-blue/10 px-4 py-2 rounded-full text-kabyle-blue flex items-center">
                <span>
                  {regionFilter && `Région: ${regionFilter}`}
                  {wilayaFilter && !regionFilter && `Wilaya: ${wilayaFilter}`}
                  {communeFilter && !regionFilter && `Commune: ${communeFilter}`}
                </span>
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
        
        <div className="flex justify-end space-x-4 items-start">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={toggleMap}
          >
            <MapPin className="h-4 w-4" />
            {showMap ? "Masquer la carte" : "Afficher la carte"}
          </Button>
        </div>
      </div>
      
      {showMap && (
        <div className="mb-8">
          <PropertyMap 
            properties={filteredProperties}
            selectedPropertyId={selectedPropertyId || undefined}
            onMarkerClick={handleMarkerClick}
            onMarkerHover={handleMarkerHover}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="sticky top-20 bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer par localisation
            </h3>
            
            <LocationFilter 
              onWilayaChange={handleWilayaChange}
              onCommuneChange={handleCommuneChange}
              clearFilters={clearFilters}
            />
            
            {(wilayaFilter || communeFilter) && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 w-full"
                onClick={clearFilter}
              >
                Effacer les filtres
              </Button>
            )}
          </div>
        </div>
        
        <div className="md:col-span-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProperties.map((property) => (
                <div 
                  key={property.id} 
                  id={`property-${property.id}`}
                  className={`transition-all duration-300 ${selectedPropertyId === property.id ? 'ring-2 ring-kabyle-blue ring-offset-2' : ''}`}
                  onMouseEnter={() => handlePropertyHover(property.id)}
                >
                  <PropertyCard 
                    property={property} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyGrid;
