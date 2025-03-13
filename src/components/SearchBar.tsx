
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const SearchBar = () => {
  const [location, setLocation] = useState("");
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-full shadow-lg p-2 flex flex-col md:flex-row">
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
            className="w-full border-none shadow-none focus-visible:ring-0 p-0 text-sm"
            placeholder="Ajouter des voyageurs"
          />
        </div>
        
        <Button size="icon" className="rounded-full bg-kabyle-terracotta hover:bg-kabyle-terracotta/90 ml-2">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
