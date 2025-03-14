
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileInput } from "@/components/ui/file-input";
import { Separator } from "@/components/ui/separator";
import { X, ImagePlus, Loader2, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AvailabilityManager from "./AvailabilityManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the interfaces at the top of the file
export interface Wilaya {
  id: number;
  name: string;
  code: string;
  name_ar?: string | null;
  name_en?: string | null;
  created_at?: string;
}

export interface Commune {
  id: string; 
  name: string;
  wilaya_id: number;
  name_ar?: string | null;
  name_en?: string | null;
  created_at?: string;
}

export interface Property {
  id?: string;
  name: string;
  description?: string;
  price: number;
  capacity: number;
  wilaya_id?: number;
  commune_id?: number;
  owner_id?: string;
  images?: string[] | null;
  rating?: number;
  created_at?: string;
  updated_at?: string;
  availability?: any;
}

export interface PropertyFormProps {
  property?: Property;
  wilayas: Wilaya[];
  communes: Commune[];
  isSubmitting: boolean;
  isUploading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onRemoveImage: (url: string) => void;
}

const PropertyForm = ({
  property,
  wilayas,
  communes,
  isSubmitting,
  isUploading,
  onSubmit,
  onRemoveImage
}: PropertyFormProps) => {
  const [name, setName] = useState(property?.name || "");
  const [description, setDescription] = useState(property?.description || "");
  const [price, setPrice] = useState<string>(property?.price?.toString() || "");
  const [capacity, setCapacity] = useState<string>(property?.capacity?.toString() || "");
  const [selectedWilaya, setSelectedWilaya] = useState<string>(property?.wilaya_id?.toString() || "");
  const [selectedCommune, setSelectedCommune] = useState<string>(property?.commune_id?.toString() || "");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [filteredCommunes, setFilteredCommunes] = useState<Commune[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const [formIsValid, setFormIsValid] = useState(false);
  
  // Check form validity whenever form fields change
  useEffect(() => {
    const isValid = 
      name.trim() !== "" && 
      price.trim() !== "" && 
      parseFloat(price) > 0 && 
      capacity.trim() !== "" && 
      parseInt(capacity) > 0 && 
      selectedWilaya !== "" && 
      selectedCommune !== "";
    
    setFormIsValid(isValid);
  }, [name, price, capacity, selectedWilaya, selectedCommune]);
  
  useEffect(() => {
    if (property) {
      setName(property.name || "");
      setDescription(property.description || "");
      setPrice(property.price?.toString() || "");
      setCapacity(property.capacity?.toString() || "");
      
      if (property.images && Array.isArray(property.images)) {
        console.log("Setting existing images from property:", property.images);
        setExistingImages(property.images);
      } else {
        console.log("No images in property or not an array:", property.images);
        setExistingImages([]);
      }
      
      if (property.wilaya_id) {
        setSelectedWilaya(property.wilaya_id.toString());
      }
      
      if (property.commune_id) {
        setSelectedCommune(property.commune_id.toString());
      }
    } else {
      resetForm();
    }
  }, [property]);
  
  useEffect(() => {
    if (selectedWilaya) {
      const filtered = communes.filter(commune => 
        commune.wilaya_id === parseInt(selectedWilaya));
      setFilteredCommunes(filtered);
      
      if (filteredCommunes.length > 0 && !filteredCommunes.some(c => c.id.toString() === selectedCommune)) {
        setSelectedCommune("");
      }
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
    console.log("Removing image:", url);
    setExistingImages(existingImages.filter(img => img !== url));
    await onRemoveImage(url);
  };

  const handleAvailabilityUpdated = () => {
    // This will be called when availability is updated
    toast.success("Disponibilité mise à jour");
  };
  
  const handleNextClick = () => {
    if (formIsValid) {
      setActiveTab("availability");
    } else {
      toast.error("Veuillez remplir tous les champs obligatoires avant de continuer");
    }
  };
  
  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (formIsValid) {
      onSubmit(e);
    } else {
      toast.error("Veuillez remplir tous les champs obligatoires");
    }
  };

  return (
    <form onSubmit={handleSubmitClick} className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Détails du logement</TabsTrigger>
          <TabsTrigger value="availability">Disponibilité</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property-name">Nom du logement *</Label>
              <Input
                id="property-name"
                name="property-name"
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
                name="property-description"
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
                  name="property-price"
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
                  name="property-capacity"
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
                  name="property-wilaya"
                  value={selectedWilaya}
                  onValueChange={setSelectedWilaya}
                  required
                >
                  <SelectTrigger id="property-wilaya">
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
                  name="property-commune"
                  value={selectedCommune}
                  onValueChange={setSelectedCommune}
                  disabled={!selectedWilaya || filteredCommunes.length === 0}
                  required
                >
                  <SelectTrigger id="property-commune">
                    <SelectValue placeholder={
                      !selectedWilaya 
                        ? "Sélectionnez d'abord une wilaya" 
                        : filteredCommunes.length === 0 
                          ? "Aucune commune disponible" 
                          : "Sélectionner une commune"
                    } />
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
          
          <div className="flex justify-end mt-4">
            {!property ? (
              <Button 
                type="button" 
                onClick={handleNextClick}
                disabled={!formIsValid}
                className="gap-2"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting || isUploading || !formIsValid}
              >
                {isSubmitting || isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isUploading ? "Téléchargement des images..." : "Mise à jour..."}
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="availability" className="pt-4">
          {property && property.id ? (
            <AvailabilityManager 
              property={property} 
              onAvailabilityUpdated={handleAvailabilityUpdated}
            />
          ) : (
            <div className="text-center p-6 bg-gray-50 border border-dashed border-gray-200 rounded-lg mb-6">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Définir la disponibilité</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous pourrez définir la disponibilité après avoir créé le logement.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Separator className="my-6" />
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" className="dialog-close">Annuler</Button>
        {activeTab === "availability" && !property && (
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading || !formIsValid}
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isUploading ? "Téléchargement des images..." : "Création..."}
              </>
            ) : (
              "Créer"
            )}
          </Button>
        )}
      </div>
    </form>
  );
};

export default PropertyForm;
