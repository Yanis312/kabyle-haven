
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import properties from "@/data/properties";

const PropertyGrid = () => {
  const [searchParams] = useSearchParams();
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const regionFilter = searchParams.get('region');
  
  useEffect(() => {
    if (regionFilter) {
      const filtered = properties.filter(
        property => property.location.village === regionFilter || property.location.wilaya === regionFilter
      );
      setFilteredProperties(filtered.length > 0 ? filtered : properties);
    } else {
      setFilteredProperties(properties);
    }
  }, [regionFilter]);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Logements en Kabylie</h2>
        
        {regionFilter && (
          <div className="bg-kabyle-blue/10 px-4 py-2 rounded-full text-kabyle-blue">
            Filtré par: {regionFilter}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};

export default PropertyGrid;
