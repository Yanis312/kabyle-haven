import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Property as FullProperty } from "@/data/properties";

// Define a simpler property interface for this page
interface Property {
  id: string;
  name: string;
  description: string | null;
  price: number;
  capacity: number;
  images: string[] | null;
  rating: number | null;
  commune_id: number | null;
}

interface Commune {
  id: number;
  name: string;
}

// Create a function to convert from the backend property format to the format expected by PropertyCard
const mapToPropertyCardProps = (property: Property, communeName: string): FullProperty => {
  return {
    id: property.id,
    name: property.name,
    title: property.name,
    description: property.description || "",
    price: property.price,
    capacity: property.capacity,
    wilaya_id: 0, // Placeholder
    commune_id: property.commune_id || 0,
    location: {
      latitude: 0, // Will be randomized in the map
      longitude: 0, // Will be randomized in the map
      village: communeName || "",
      wilaya: ""
    },
    images: property.images || ["/placeholder.svg"],
    features: [`Capacité: ${property.capacity} personnes`],
    rating: property.rating || 0,
    reviewCount: 0,
    // Adding required values for all properties
    host: {
      name: "",
      avatar: "",
      languages: []
    },
    amenities: [],
    availability: {
      startDate: "",
      endDate: ""
    },
    cultural_offerings: []
  };
};

const PropertiesPage = () => {
  const { id } = useParams<{ id: string }>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [commune, setCommune] = useState<Commune | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [capacityRange, setCapacityRange] = useState<[number, number]>([1, 20]);
  const [ratingMin, setRatingMin] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Convert string id to number
        const numericId = parseInt(id, 10);
        
        // Fetch commune info
        const { data: communeData, error: communeError } = await supabase
          .from("communes")
          .select("id, name")
          .eq("id", numericId)
          .single();
          
        if (communeError) throw communeError;
        setCommune(communeData);
        
        // Fetch properties for the commune
        const { data: propertiesData, error: propertiesError } = await supabase
          .from("guesthouses")
          .select("*")
          .eq("commune_id", numericId);
          
        if (propertiesError) throw propertiesError;
        
        console.log("Properties loaded:", propertiesData);
        setProperties(propertiesData || []);
        setFilteredProperties(propertiesData || []);
        
        // Set initial price range based on data
        if (propertiesData && propertiesData.length > 0) {
          const prices = propertiesData.map(p => p.price);
          const capacities = propertiesData.map(p => p.capacity);
          
          setPriceRange([0, Math.max(...prices)]);
          setCapacityRange([1, Math.max(...capacities)]);
        }
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  
  // Apply filters
  const applyFilters = () => {
    const filtered = properties.filter(property => {
      return (
        property.price >= priceRange[0] &&
        property.price <= priceRange[1] &&
        property.capacity >= capacityRange[0] &&
        property.capacity <= capacityRange[1] &&
        (property.rating || 0) >= ratingMin
      );
    });
    
    setFilteredProperties(filtered);
  };
  
  // Reset filters
  const resetFilters = () => {
    if (properties.length > 0) {
      const prices = properties.map(p => p.price);
      const capacities = properties.map(p => p.capacity);
      
      setPriceRange([0, Math.max(...prices)]);
      setCapacityRange([1, Math.max(...capacities)]);
      setRatingMin(0);
      setFilteredProperties(properties);
    }
  };

  // Format price display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to={`/wilaya/${commune?.id ? commune.id.toString().split('-')[0] : ''}`}>
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Retour
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">
              {commune ? `Logements à ${commune.name}` : 'Chargement...'}
            </h1>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Filter className="h-4 w-4 mr-2" /> Filtrer
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <h3 className="font-medium mb-4">Filtres</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Prix par nuit</Label>
                    <span className="text-sm text-gray-500">
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])} DA
                    </span>
                  </div>
                  <Slider
                    defaultValue={priceRange}
                    max={100000}
                    step={1000}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Capacité</Label>
                    <span className="text-sm text-gray-500">
                      {capacityRange[0]} - {capacityRange[1]} personnes
                    </span>
                  </div>
                  <Slider
                    defaultValue={capacityRange}
                    min={1}
                    max={20}
                    step={1}
                    value={capacityRange}
                    onValueChange={(value) => setCapacityRange(value as [number, number])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Note minimum</Label>
                    <span className="text-sm text-gray-500">
                      {ratingMin} / 5
                    </span>
                  </div>
                  <Slider
                    defaultValue={[ratingMin]}
                    min={0}
                    max={5}
                    step={0.5}
                    value={[ratingMin]}
                    onValueChange={(value) => setRatingMin(value[0])}
                  />
                </div>
                
                <div className="flex justify-between gap-2 pt-2">
                  <Button variant="outline" onClick={resetFilters} className="flex-1">
                    Réinitialiser
                  </Button>
                  <Button onClick={applyFilters} className="flex-1">
                    Appliquer
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-kabyle-blue" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">
              Une erreur est survenue lors du chargement des logements: {error}
            </p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              Aucun logement trouvé pour cette commune avec les filtres actuels.
            </p>
            {properties.length > 0 && (
              <Button onClick={resetFilters} variant="outline" className="mt-4">
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={mapToPropertyCardProps(property, commune?.name || "")}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PropertiesPage;
