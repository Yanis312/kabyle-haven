
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface LocationFilterProps {
  onWilayaChange: (wilayaId: string | null) => void;
  onCommuneChange: (communeId: string | null) => void;
  clearFilters?: boolean;
}

interface Wilaya {
  id: number;
  name: string;
}

interface Commune {
  id: number;
  name: string;
}

const LocationFilter = ({ 
  onWilayaChange, 
  onCommuneChange,
  clearFilters = false 
}: LocationFilterProps) => {
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
  const [loadingWilayas, setLoadingWilayas] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  
  // Fetch wilayas from the database
  useEffect(() => {
    const fetchWilayas = async () => {
      setLoadingWilayas(true);
      
      try {
        const { data, error } = await supabase
          .from('wilayas')
          .select('id, name')
          .order('name', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        setWilayas(data || []);
      } catch (error) {
        console.error('Error fetching wilayas:', error);
      } finally {
        setLoadingWilayas(false);
      }
    };
    
    fetchWilayas();
  }, []);
  
  // Fetch communes when wilaya changes
  useEffect(() => {
    if (!selectedWilaya) {
      setCommunes([]);
      return;
    }
    
    const fetchCommunes = async () => {
      setLoadingCommunes(true);
      
      try {
        const { data, error } = await supabase
          .from('communes')
          .select('id, name')
          .eq('wilaya_id', selectedWilaya)
          .order('name', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        setCommunes(data || []);
      } catch (error) {
        console.error('Error fetching communes:', error);
      } finally {
        setLoadingCommunes(false);
      }
    };
    
    fetchCommunes();
  }, [selectedWilaya]);
  
  // Clear filters when requested
  useEffect(() => {
    if (clearFilters) {
      setSelectedWilaya(null);
      setSelectedCommune(null);
    }
  }, [clearFilters]);
  
  // Handle wilaya selection
  const handleWilayaChange = (value: string) => {
    setSelectedWilaya(value);
    setSelectedCommune(null);
    onWilayaChange(value);
    onCommuneChange(null);
  };
  
  // Handle commune selection
  const handleCommuneChange = (value: string) => {
    setSelectedCommune(value);
    onCommuneChange(value);
  };
  
  return (
    <div className="space-y-4">
      {/* Wilaya Select */}
      <div className="space-y-2">
        <label htmlFor="wilaya" className="text-sm font-medium">
          Wilaya
        </label>
        <Select
          value={selectedWilaya || ""}
          onValueChange={handleWilayaChange}
        >
          <SelectTrigger id="wilaya" className="w-full">
            <SelectValue placeholder="Sélectionnez une wilaya" />
          </SelectTrigger>
          <SelectContent>
            {loadingWilayas ? (
              <div className="p-2 text-center text-sm">Chargement...</div>
            ) : (
              wilayas.map((wilaya) => (
                <SelectItem key={wilaya.id} value={String(wilaya.id)}>
                  {wilaya.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      {/* Commune Select */}
      {selectedWilaya && (
        <div className="space-y-2">
          <label htmlFor="commune" className="text-sm font-medium">
            Commune
          </label>
          <Select
            value={selectedCommune || ""}
            onValueChange={handleCommuneChange}
            disabled={!selectedWilaya || loadingCommunes}
          >
            <SelectTrigger id="commune" className="w-full">
              <SelectValue placeholder="Sélectionnez une commune" />
            </SelectTrigger>
            <SelectContent>
              {loadingCommunes ? (
                <div className="p-2 text-center text-sm">Chargement...</div>
              ) : communes.length === 0 ? (
                <div className="p-2 text-center text-sm">Aucune commune trouvée</div>
              ) : (
                communes.map((commune) => (
                  <SelectItem key={commune.id} value={String(commune.id)}>
                    {commune.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default LocationFilter;
