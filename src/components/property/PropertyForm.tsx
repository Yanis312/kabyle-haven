
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileInput } from "@/components/ui/file-input";

interface Wilaya {
  id: number;
  name: string;
}

interface Commune {
  id: number;
  name: string;
  wilaya_id: number;
}

interface Property {
  id: string;
  name: string;
  description: string | null;
  price: number;
  capacity: number;
  images: string[] | null;
  wilaya_id: number | null;
  commune_id: number | null;
}

interface PropertyFormProps {
  editingProperty: Property | null;
  wilayas: Wilaya[];
  communes: Commune[];
  isSubmitting: boolean;
  isUploading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onRemoveImage: (url: string) => Promise<void>;
}

const PropertyForm = ({
  editingProperty,
  wilayas,
  communes,
  isSubmitting,
  isUploading,
  onSubmit,
  onRemoveImage
}: PropertyFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState<string>("");
  const [selectedCommune, setSelectedCommune] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [filteredCommunes, setFilteredCommunes] = useState<Commune[]>([]);
  
  useEffect(() => {
    if (editingProperty) {
      setName(editingProperty.name);
      setDescription(editingProperty.description || "");
      setPrice(editingProperty.price.toString());
      setCapacity(editingProperty.capacity.toString());
      setExistingImages(editingProperty.images || []);
      
      if (editingProperty.wilaya_id) {
        setSelectedWilaya(editingProperty.wilaya_id.toString());
      }
      
      if (editingProperty.commune_id) {
        setSelectedCommune(editingProperty.commune_id.toString());
      }
    } else {
      resetForm();
    }
  }, [editingProperty]);
  
  useEffect(() => {
    if (selectedWilaya) {
      const filtered = communes.filter(commune => 
        commune.wilaya_id === parseInt(selectedWilaya));
      setFilteredCommunes(filtered);
    } else {
      setFilteredCommunes([]);
    }
  }, [selectedWilaya, communes]);
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCapacity("");
    setSelectedWilaya("");
    setSelectedCommune("");
    setUploadedFiles([]);
    setExistingImages([]);
  };
  
  const handleRemoveImage = async (url: string) => {
    setExistingImages(existingImages.filter(img => img !== url));
    await onRemoveImage(url);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="property-name">Nom du logement *</Label>
          <Input
            id="property-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maison traditionnelle, Villa moderne, etc."
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="property-description">Description</Label>
          <Textarea
            id="property-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre logement..."
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="property-price">Prix par nuit (DA) *</Label>
            <Input
              id="property-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="5000"
              min="0"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="property-capacity">Capacité (personnes) *</Label>
            <Input
              id="property-capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="4"
              min="1"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="property-wilaya">Wilaya *</Label>
            <Select
              value={selectedWilaya}
              onValueChange={setSelectedWilaya}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une wilaya" />
              </SelectTrigger>
              <SelectContent>
                {wilayas.map((wilaya) => (
                  <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                    {wilaya.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="property-commune">Commune *</Label>
            <Select
              value={selectedCommune}
              onValueChange={setSelectedCommune}
              disabled={!selectedWilaya}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une commune" />
              </SelectTrigger>
              <SelectContent>
                {filteredCommunes.map((commune) => (
                  <SelectItem key={commune.id} value={commune.id.toString()}>
                    {commune.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Images</Label>
          <FileInput 
            onFilesChange={setUploadedFiles}
            selectedFiles={uploadedFiles}
            urls={existingImages}
            onRemoveUrl={handleRemoveImage}
            maxFiles={5}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" className="dialog-close">Annuler</Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting || isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isUploading ? "Téléchargement des images..." : (editingProperty ? "Mise à jour..." : "Création...")}
            </>
          ) : (
            editingProperty ? "Mettre à jour" : "Créer"
          )}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
export type { PropertyFormProps, Property, Wilaya, Commune };
