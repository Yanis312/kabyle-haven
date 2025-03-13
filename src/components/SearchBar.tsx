
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import properties from "@/data/properties";

const SearchBar = () => {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      toast.error("Veuillez entrer une destination");
      return;
    }
    
    // Check if the location matches any known village or wilaya
    const locationMatches = properties.some(
      property => 
        property.location.village.toLowerCase().includes(location.toLowerCase()) || 
        property.location.wilaya.toLowerCase().includes(location.toLowerCase())
    );
    
    if (locationMatches) {
      navigate(`/?region=${location}`);
      toast.success(`Recherche de logements à ${location}`);
    } else {
      toast.warning("Aucun logement trouvé dans cette région");
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
