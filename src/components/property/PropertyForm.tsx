
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileInput } from "@/components/ui/file-input";
import { Separator } from "@/components/ui/separator";
import { X, ImagePlus, Loader2, Save, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format, isAfter, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Check } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  latitude?: number;
  longitude?: number;
  address?: string;
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

// Configure Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoiYWlyYm5iIiwiYSI6ImNqcmg2ZHFxczA4NWk0M3BucTRnOWg5ZjAifQ.j_LaWN2zX5jIUCD8Kx3JXw";

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
  const [formIsValid, setFormIsValid] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined
  });
  
  // New state for address and coordinates
  const [address, setAddress] = useState(property?.address || "");
  const [latitude, setLatitude] = useState<number | undefined>(property?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(property?.longitude);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainer = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (property?.availability) {
      try {
        const availabilityData = typeof property.availability === 'string' 
          ? JSON.parse(property.availability as string) 
          : property.availability;
          
        if (availabilityData?.start_date && availabilityData?.end_date) {
          setDateRange({
            from: new Date(availabilityData.start_date),
            to: new Date(availabilityData.end_date)
          });
        }
      } catch (error) {
        console.error("Error parsing availability data:", error);
      }
    }
  }, [property]);
  
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
      setAddress(property.address || "");
      setLatitude(property.latitude);
      setLongitude(property.longitude);
      
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
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapLoaded) return;
    
    try {
      // Default to center of Kabylie region if no coordinates
      const defaultLat = 36.7168;
      const defaultLng = 4.0498;
      
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [longitude || defaultLng, latitude || defaultLat],
        zoom: 12,
      });
      
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      mapInstance.on("load", () => {
        setMapLoaded(true);
        setMap(mapInstance);
        
        // Add marker if coordinates exist
        if (latitude && longitude) {
          const newMarker = new mapboxgl.Marker({ draggable: true })
            .setLngLat([longitude, latitude])
            .addTo(mapInstance);
            
          newMarker.on('dragend', () => {
            const lngLat = newMarker.getLngLat();
            setLongitude(lngLat.lng);
            setLatitude(lngLat.lat);
          });
          
          setMarker(newMarker);
        }
      });
      
      // Click on map to place/move marker
      mapInstance.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        setLongitude(lng);
        setLatitude(lat);
        
        if (marker) {
          marker.setLngLat([lng, lat]);
        } else {
          const newMarker = new mapboxgl.Marker({ draggable: true })
            .setLngLat([lng, lat])
            .addTo(mapInstance);
            
          newMarker.on('dragend', () => {
            const lngLat = newMarker.getLngLat();
            setLongitude(lngLat.lng);
            setLatitude(lngLat.lat);
          });
          
          setMarker(newMarker);
        }
      });
      
      return () => {
        mapInstance.remove();
      };
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, [mapContainer, mapLoaded]);
  
  // Update marker position when coordinates change
  useEffect(() => {
    if (!map || !mapLoaded) return;
    
    if (latitude && longitude) {
      if (marker) {
        marker.setLngLat([longitude, latitude]);
      } else {
        const newMarker = new mapboxgl.Marker({ draggable: true })
          .setLngLat([longitude, latitude])
          .addTo(map);
          
        newMarker.on('dragend', () => {
          const lngLat = newMarker.getLngLat();
          setLongitude(lngLat.lng);
          setLatitude(lngLat.lat);
        });
        
        setMarker(newMarker);
      }
      
      map.flyTo({
        center: [longitude, latitude],
        zoom: 12
      });
    }
  }, [latitude, longitude, map, mapLoaded]);
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCapacity("");
    setSelectedWilaya("");
    setSelectedCommune("");
    setUploadedFiles([]);
    setExistingImages([]);
    setDateRange({ from: undefined, to: undefined });
    setAddress("");
    setLatitude(undefined);
    setLongitude(undefined);
    
    // Clear marker
    if (marker) {
      marker.remove();
      setMarker(null);
    }
  };
  
  const handleRemoveImage = async (url: string) => {
    console.log("Removing image:", url);
    setExistingImages(existingImages.filter(img => img !== url));
    await onRemoveImage(url);
  };

  const searchAddress = async () => {
    if (!address.trim()) {
      toast.error("Veuillez entrer une adresse");
      return;
    }
    
    try {
      // Add "Algérie" to improve result accuracy if not already present
      const searchQuery = address.toLowerCase().includes('algérie') || 
                         address.toLowerCase().includes('algerie') ? 
                         address : `${address}, Algérie`;
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error("Erreur de géocodage");
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        setLongitude(lng);
        setLatitude(lat);
        
        toast.success("Adresse localisée avec succès");
      } else {
        toast.error("Adresse non trouvée");
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      toast.error("Erreur lors de la recherche de l'adresse");
    }
  };

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    
    const availabilityData = dateRange?.from && dateRange?.to 
      ? {
          start_date: format(dateRange.from, "yyyy-MM-dd"),
          end_date: format(dateRange.to, "yyyy-MM-dd")
        }
      : null;
    
    const availabilityInput = document.getElementById('availability-data') as HTMLInputElement;
    if (availabilityInput) {
      availabilityInput.value = availabilityData ? JSON.stringify(availabilityData) : '';
    }
    
    // Add hidden inputs for address and coordinates
    const addressInput = document.getElementById('property-address') as HTMLInputElement;
    const latitudeInput = document.getElementById('property-latitude') as HTMLInputElement;
    const longitudeInput = document.getElementById('property-longitude') as HTMLInputElement;
    
    if (addressInput) addressInput.value = address;
    if (latitudeInput) latitudeInput.value = latitude?.toString() || '';
    if (longitudeInput) longitudeInput.value = longitude?.toString() || '';
    
    if (formIsValid) {
      onSubmit(e);
    } else {
      toast.error("Veuillez remplir tous les champs obligatoires");
    }
  };

  return (
    <form onSubmit={handleSubmitClick} className="space-y-4">
      <input 
        type="hidden" 
        id="availability-data" 
        name="availability-data" 
        value={dateRange?.from && dateRange?.to ? JSON.stringify({
          start_date: format(dateRange.from, "yyyy-MM-dd"),
          end_date: format(dateRange.to, "yyyy-MM-dd")
        }) : ''}
      />
      
      <input type="hidden" id="property-latitude" name="property-latitude" value={latitude?.toString() || ''} />
      <input type="hidden" id="property-longitude" name="property-longitude" value={longitude?.toString() || ''} />
      
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
        
        <Separator className="my-2" />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Localisation</h3>
          
          <div className="space-y-2">
            <Label htmlFor="property-address">Adresse</Label>
            <div className="flex space-x-2">
              <Input
                id="property-address"
                name="property-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rue principale, Tizi Ouzou, Algérie"
              />
              <Button 
                type="button" 
                onClick={searchAddress}
                variant="outline"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Localiser
              </Button>
            </div>
          </div>
          
          <div className="h-60 rounded-md border overflow-hidden" ref={mapContainer}>
            {/* Map will be rendered here */}
          </div>
          
          <div className="text-sm text-gray-500 flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
            <span>
              {latitude && longitude ? (
                <>Position: {latitude.toFixed(6)}, {longitude.toFixed(6)}</>
              ) : (
                <>Cliquez sur la carte pour définir la position ou entrez une adresse</>
              )}
            </span>
          </div>
        </div>
        
        <Separator className="my-2" />
        
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

        <Separator className="my-4" />
        
        <div className="space-y-2">
          <Label>Disponibilité</Label>
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-green-500 mr-1"></div>
                  <span>Disponible</span>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-gray-300 mr-1"></div>
                  <span>Non disponible</span>
                </div>
              </div>

              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                defaultMonth={dateRange?.from || new Date()}
                numberOfMonths={2}
                locale={fr}
                className="border rounded-md p-3"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                {dateRange?.from && dateRange?.to && (
                  <div className="text-sm">
                    <span className="font-medium">Période sélectionnée:</span>{" "}
                    <span className="text-green-600">
                      {format(dateRange.from, "d MMMM yyyy", { locale: fr })} - {format(dateRange.to, "d MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" className="dialog-close">Annuler</Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || isUploading || !formIsValid}
          className="gap-2"
        >
          {isSubmitting || isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isUploading 
                ? "Téléchargement des images..." 
                : property 
                  ? "Mise à jour..." 
                  : "Création..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {property ? "Mettre à jour" : "Créer"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
