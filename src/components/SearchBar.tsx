
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Location {
  wilaya_id: number;
  wilaya_name: string;
  commune_id?: number;
  commune_name?: string;
}

const SearchBar = () => {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const navigate = useNavigate();
  
  // Fetch wilayas and communes on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Fetch wilayas
        const { data: wilayasData, error: wilayasError } = await supabase
          .from('wilayas')
          .select('id, name');
          
        if (wilayasError) throw wilayasError;
        
        // Fetch communes
        const { data: communesData, error: communesError } = await supabase
          .from('communes')
          .select('id, name, wilaya_id');
          
        if (communesError) throw communesError;
        
        // Create a combined location list
        const locationsList: Location[] = [
          // Add wilayas
          ...(wilayasData?.map(wilaya => ({
            wilaya_id: wilaya.id,
            wilaya_name: wilaya.name
          })) || []),
          
          // Add communes with their wilaya
          ...(communesData?.map(commune => ({
            wilaya_id: commune.wilaya_id,
            wilaya_name: wilayasData?.find(w => w.id === commune.wilaya_id)?.name || "",
            commune_id: commune.id,
            commune_name: commune.name
          })) || [])
        ];
        
        setLocations(locationsList);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
    
    fetchLocations();
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      toast.error("Veuillez entrer une destination");
      return;
    }
    
    const locationLower = location.toLowerCase();
    
    // Check if the input matches any wilaya or commune
    const matchingWilaya = locations.find(
      loc => loc.wilaya_name.toLowerCase().includes(locationLower) && !loc.commune_name
    );
    
    const matchingCommune = locations.find(
      loc => loc.commune_name?.toLowerCase().includes(locationLower)
    );
    
    if (matchingWilaya) {
      navigate(`/wilaya/${matchingWilaya.wilaya_id}`);
      toast.success(`Recherche de logements à ${matchingWilaya.wilaya_name}`);
    } else if (matchingCommune) {
      navigate(`/commune/${matchingCommune.commune_id}`);
      toast.success(`Recherche de logements à ${matchingCommune.commune_name}`);
    } else {
      // If no exact match, try a broader search
      const anyMatch = locations.find(
        loc => 
          loc.wilaya_name.toLowerCase().includes(locationLower) || 
          loc.commune_name?.toLowerCase().includes(locationLower)
      );
      
      if (anyMatch) {
        if (anyMatch.commune_id) {
          navigate(`/commune/${anyMatch.commune_id}`);
        } else {
          navigate(`/wilaya/${anyMatch.wilaya_id}`);
        }
      } else {
        toast.warning("Aucun logement trouvé dans cette région");
      }
    }
  };
  
  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto bg-white rounded-full shadow-lg p-2 flex flex-col md:flex-row">
      {/* Location */}
      <div className="flex-1 min-w-0 px-4 py-2 flex items-center border-b md:border-b-0 md:border-r">
        <MapPin className="h-5 w-5 text-kabyle-terracotta mr-2 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <label htmlFor="location" className="block text-xs font-medium text-gray-500">
            Destination
          </label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border-none shadow-none focus-visible:ring-0 p-0 text-sm"
            placeholder="Où allez-vous?"
          />
        </div>
      </div>
      
      {/* Check-in */}
      <div className="flex-1 min-w-0 px-4 py-2 flex items-center border-b md:border-b-0 md:border-r">
        <Calendar className="h-5 w-5 text-kabyle-terracotta mr-2 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <label htmlFor="check-in" className="block text-xs font-medium text-gray-500">
            Arrivée
          </label>
          <Input
            id="check-in"
            type="text"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full border-none shadow-none focus-visible:ring-0 p-0 text-sm"
            placeholder="Ajouter des dates"
          />
        </div>
      </div>
      
      {/* Check-out */}
      <div className="flex-1 min-w-0 px-4 py-2 flex items-center border-b md:border-b-0 md:border-r">
        <Calendar className="h-5 w-5 text-kabyle-terracotta mr-2 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <label htmlFor="check-out" className="block text-xs font-medium text-gray-500">
            Départ
          </label>
          <Input
            id="check-out"
            type="text"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full border-none shadow-none focus-visible:ring-0 p-0 text-sm"
            placeholder="Ajouter des dates"
          />
        </div>
      </div>
      
      {/* Guests */}
      <div className="flex-1 min-w-0 px-4 py-2 flex items-center">
        <Users className="h-5 w-5 text-kabyle-terracotta mr-2 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <label htmlFor="guests" className="block text-xs font-medium text-gray-500">
            Voyageurs
          </label>
          <Input
            id="guests"
            type="text"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full border-none shadow-none focus-visible:ring-0 p-0 text-sm"
            placeholder="Ajouter des voyageurs"
          />
        </div>
        
        <Button type="submit" size="icon" className="rounded-full bg-kabyle-terracotta hover:bg-kabyle-terracotta/90 ml-2">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
