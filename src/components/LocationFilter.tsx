
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationFilterProps {
  onWilayaChange: (wilayaId: string | null) => void;
  onCommuneChange: (communeId: string | null) => void;
  clearFilters?: boolean;
}

const LocationFilter = ({ onWilayaChange, onCommuneChange, clearFilters }: LocationFilterProps) => {
  const [wilayas, setWilayas] = useState<{ id: number; name: string }[]>([]);
  const [communes, setCommunes] = useState<{ id: number; name: string }[]>([]);
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Reset filters when clearFilters prop changes
  useEffect(() => {
    if (clearFilters) {
      setSelectedWilaya(null);
      setSelectedCommune(null);
    }
  }, [clearFilters]);

  // Fetch all wilayas on component mount
  useEffect(() => {
    const fetchWilayas = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("wilayas")
          .select("id, name")
          .order("name", { ascending: true });

        if (error) throw error;
        setWilayas(data || []);
      } catch (error) {
        console.error("Error fetching wilayas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWilayas();
  }, []);

  // Fetch communes when wilaya selection changes
  useEffect(() => {
    const fetchCommunes = async () => {
      if (!selectedWilaya) {
        setCommunes([]);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("communes")
          .select("id, name")
          .eq("wilaya_id", parseInt(selectedWilaya))
          .order("name", { ascending: true });

        if (error) throw error;
        setCommunes(data || []);
      } catch (error) {
        console.error("Error fetching communes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunes();
    
    // Reset commune selection when wilaya changes
    setSelectedCommune(null);
    onCommuneChange(null);
    
    // Notify parent about wilaya change
    onWilayaChange(selectedWilaya);
  }, [selectedWilaya, onWilayaChange, onCommuneChange]);

  // Notify parent about commune change
  useEffect(() => {
    onCommuneChange(selectedCommune);
  }, [selectedCommune, onCommuneChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="wilaya">Wilaya</Label>
        <Select
          value={selectedWilaya || ""}
          onValueChange={(value) => setSelectedWilaya(value || null)}
        >
          <SelectTrigger id="wilaya" disabled={loading}>
            <SelectValue placeholder="Sélectionnez une wilaya" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes les wilayas</SelectItem>
            {wilayas.map((wilaya) => (
              <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                {wilaya.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="commune">Commune</Label>
        <Select
          value={selectedCommune || ""}
          onValueChange={(value) => setSelectedCommune(value || null)}
          disabled={!selectedWilaya || loading || communes.length === 0}
        >
          <SelectTrigger id="commune">
            <SelectValue placeholder={!selectedWilaya ? "Sélectionnez d'abord une wilaya" : "Sélectionnez une commune"} />
          </SelectTrigger>
          <SelectContent>
            {selectedWilaya && <SelectItem value="">Toutes les communes</SelectItem>}
            {communes.map((commune) => (
              <SelectItem key={commune.id} value={commune.id.toString()}>
                {commune.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LocationFilter;
