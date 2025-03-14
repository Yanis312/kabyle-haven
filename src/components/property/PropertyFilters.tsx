
import { useState, useEffect } from "react";
import { Filter, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Wilaya, Commune } from "./PropertyForm";

export type SortOption = {
  field: 'name' | 'price' | 'capacity' | 'rating' | 'created_at';
  direction: 'asc' | 'desc';
};

export type FilterOptions = {
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  wilayaId?: number;
  communeId?: number;
};

interface PropertyFiltersProps {
  wilayas: Wilaya[];
  communes: Commune[];
  onFilterChange: (filters: FilterOptions) => void;
  onSortChange: (sort: SortOption) => void;
}

const PropertyFilters = ({ 
  wilayas, 
  communes, 
  onFilterChange, 
  onSortChange 
}: PropertyFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minCapacity, setMinCapacity] = useState<string>('');
  const [maxCapacity, setMaxCapacity] = useState<string>('');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [selectedCommune, setSelectedCommune] = useState<string>('');
  const [filteredCommunes, setFilteredCommunes] = useState<Commune[]>([]);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter communes based on selected wilaya
  useEffect(() => {
    if (selectedWilaya) {
      const filtered = communes.filter(
        commune => commune.wilaya_id === parseInt(selectedWilaya)
      );
      setFilteredCommunes(filtered);
      
      // Reset commune if wilaya changes
      if (!filtered.some(c => c.id.toString() === selectedCommune)) {
        setSelectedCommune('');
      }
    } else {
      setFilteredCommunes([]);
      setSelectedCommune('');
    }
  }, [selectedWilaya, communes, selectedCommune]);

  // Apply filters when any filter value changes
  useEffect(() => {
    const filters: FilterOptions = {};
    
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (minCapacity) filters.minCapacity = parseInt(minCapacity);
    if (maxCapacity) filters.maxCapacity = parseInt(maxCapacity);
    if (selectedWilaya) filters.wilayaId = parseInt(selectedWilaya);
    if (selectedCommune) filters.communeId = parseInt(selectedCommune);
    
    onFilterChange(filters);
  }, [minPrice, maxPrice, minCapacity, maxCapacity, selectedWilaya, selectedCommune, onFilterChange]);

  // Apply sort when sort options change
  useEffect(() => {
    if (sortField) {
      onSortChange({
        field: sortField as SortOption['field'],
        direction: sortDirection
      });
    }
  }, [sortField, sortDirection, onSortChange]);

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Reset all filters
  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinCapacity('');
    setMaxCapacity('');
    setSelectedWilaya('');
    setSelectedCommune('');
    setIsOpen(false);
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtrer
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Filtres</h4>
              <Separator />
            </div>
            
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="min-price">Prix min (DA)</Label>
                  <Input
                    id="min-price"
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="max-price">Prix max (DA)</Label>
                  <Input
                    id="max-price"
                    type="number"
                    placeholder="100000"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="min-capacity">Capacité min</Label>
                  <Input
                    id="min-capacity"
                    type="number"
                    placeholder="1"
                    value={minCapacity}
                    onChange={e => setMinCapacity(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="max-capacity">Capacité max</Label>
                  <Input
                    id="max-capacity"
                    type="number"
                    placeholder="20"
                    value={maxCapacity}
                    onChange={e => setMaxCapacity(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="wilaya">Wilaya</Label>
                <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
                  <SelectTrigger id="wilaya">
                    <SelectValue placeholder="Toutes les wilayas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les wilayas</SelectItem>
                    {wilayas.map(wilaya => (
                      <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                        {wilaya.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedWilaya && (
                <div className="space-y-1">
                  <Label htmlFor="commune">Commune</Label>
                  <Select 
                    value={selectedCommune} 
                    onValueChange={setSelectedCommune}
                    disabled={filteredCommunes.length === 0}
                  >
                    <SelectTrigger id="commune">
                      <SelectValue placeholder="Toutes les communes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les communes</SelectItem>
                      {filteredCommunes.map(commune => (
                        <SelectItem key={commune.id} value={commune.id.toString()}>
                          {commune.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Réinitialiser
              </Button>
              <Button size="sm" onClick={() => setIsOpen(false)}>Appliquer</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Select value={sortField} onValueChange={setSortField}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">Date d'ajout</SelectItem>
          <SelectItem value="name">Nom</SelectItem>
          <SelectItem value="price">Prix</SelectItem>
          <SelectItem value="capacity">Capacité</SelectItem>
          <SelectItem value="rating">Évaluation</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" size="icon" onClick={toggleSortDirection}>
        {sortDirection === 'asc' ? (
          <SortAsc className="h-4 w-4" />
        ) : (
          <SortDesc className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default PropertyFilters;
