
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import { Button } from "./ui/button";
import { Filter, X, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/data/properties";
import LocationFilter from "./LocationFilter";
import PropertyMap from "./PropertyMap";

const PropertyGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [clearFilters, setClearFilters] = useState(false);
  
  const regionFilter = searchParams.get('region');
  const wilayaFilter = searchParams.get('wilaya');
  const communeFilter = searchParams.get('commune');
  
  const handleWilayaChange = useCallback((wilayaId: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (wilayaId) {
      newParams.set('wilaya', wilayaId);
    } else {
      newParams.delete('wilaya');
    }
    
    newParams.delete('commune');
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);
  
  const handleCommuneChange = useCallback((communeId: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (communeId) {
      newParams.set('commune', communeId);
    } else {
      newParams.delete('commune');
    }
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);
  
  // Load properties from Supabase
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        // Build the query based on filters
        let query = supabase
          .from('guesthouses')
          .select(`
            *,
            commune:communes!inner(
              name,
              wilaya:wilayas!inner(name)
            )
          `);
        
        // Apply filters if present
        if (wilayaFilter) {
          query = query.eq('wilaya_id', wilayaFilter);
        }
        
        if (communeFilter) {
          query = query.eq('commune_id', communeFilter);
        }
        
        // Execute the query
        const { data, error } = await query;
        
        if (error) throw error;
        
        console.log("Fetched properties:", data);
        
        // Map data to property format
        const formattedProperties: Property[] = data.map(item => ({
          id: item.id,
          name: item.name,
          title: item.name, // For backward compatibility
          description: item.description || "",
          price: item.price,
          capacity: item.capacity,
          wilaya_id: item.wilaya_id || 0,
          commune_id: item.commune_id || 0,
          location: {
            latitude: item.latitude || 0,
            longitude: item.longitude || 0,
            village: item.commune.name,
            wilaya: item.commune.wilaya.name
          },
          images: item.images || ["/placeholder.svg"],
          features: [`Capacité: ${item.capacity} personnes`],
          rating: item.rating || 0,
          reviewCount: 0,
          host: {
            name: "Hôte",
            avatar: "/placeholder.svg",
            languages: ["Français", "Kabyle"]
          },
          amenities: ["Wi-Fi", "Cuisine équipée", "Parking"],
          availability: item.availability || {
            startDate: "",
            endDate: ""
          },
          cultural_offerings: ["Traditions locales", "Cuisine traditionnelle"],
          latitude: item.latitude,
          longitude: item.longitude,
          address: item.address
        }));
        
        setProperties(formattedProperties);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError("Erreur lors du chargement des propriétés");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
    setClearFilters(false);
  }, [regionFilter, wilayaFilter, communeFilter]);
  
  const handleMarkerClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    
    const element = document.getElementById(`property-${propertyId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  const handleMarkerHover = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
  };
  
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
      
      {showMap && properties.length > 0 && (
        <div className="mb-8 h-80 rounded-lg overflow-hidden border shadow-sm">
          <PropertyMap 
            properties={properties}
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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-kabyle-blue" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg text-red-600">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={clearFilter}
              >
                Réessayer
              </Button>
            </div>
          ) : properties.length === 0 ? (
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
              {properties.map((property) => (
                <div 
                  key={property.id} 
                  id={`property-${property.id}`}
                  className={`transition-all duration-300 ${selectedPropertyId === property.id ? 'ring-2 ring-kabyle-blue ring-offset-2' : ''}`}
                  onMouseEnter={() => handlePropertyHover(property.id)}
                >
                  <Link to={`/property/${property.id}`}>
                    <PropertyCard 
                      property={property}
                      onHover={() => handlePropertyHover(property.id)} 
                    />
                  </Link>
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
