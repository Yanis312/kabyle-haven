
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Property } from "@/data/properties";
import { AlertTriangle } from "lucide-react";

// Configure Mapbox with a valid token
// This token should be replaced with your own Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoiYWlyYm5iIiwiYSI6ImNqcmg2ZHFxczA4NWk0M3BucTRnOWg5ZjAifQ.j_LaWN2zX5jIUCD8Kx3JXw";

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onMarkerClick?: (propertyId: string) => void;
  onMarkerHover?: (propertyId: string) => void;
}

const PropertyMap = ({
  properties,
  selectedPropertyId,
  onMarkerClick,
  onMarkerHover
}: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{[key: string]: mapboxgl.Marker}>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [4.2, 36.7], // Center on Kabylie region
        zoom: 8,
      });

      map.current.on("load", () => {
        setMapLoaded(true);
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
        setMapError("Erreur de chargement de la carte. Veuillez vérifier votre connexion internet ou réessayez plus tard.");
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Impossible d'initialiser la carte Mapbox.");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add/update markers when properties change
  useEffect(() => {
    if (!map.current || !mapLoaded || properties.length === 0 || mapError) return;

    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Add markers for each property
    properties.forEach(property => {
      // Generate random coordinates near Kabylie for demo
      // In a real app, these would come from the database
      const lat = property.location?.latitude || (36.7 + (Math.random() - 0.5) * 0.5);
      const lng = property.location?.longitude || (4.2 + (Math.random() - 0.5) * 0.5);

      // Create marker element
      const el = document.createElement("div");
      el.className = `property-marker ${selectedPropertyId === property.id ? "selected" : ""}`;
      el.innerHTML = `<div class="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 ${
        selectedPropertyId === property.id ? "border-kabyle-blue" : "border-kabyle-terracotta"
      }">
        <span class="text-xs font-bold">${property.price}DA</span>
      </div>`;

      // Create and add the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2">
              <h3 class="font-bold text-sm">${property.title || property.name}</h3>
              <p class="text-xs">${property.price} DA / nuit</p>
            </div>`
          )
        )
        .addTo(map.current);

      // Add event listeners
      el.addEventListener("click", () => {
        if (onMarkerClick) onMarkerClick(property.id);
      });
      
      el.addEventListener("mouseenter", () => {
        if (onMarkerHover) onMarkerHover(property.id);
      });

      // Store the marker reference
      markers.current[property.id] = marker;
    });

    // Fit map to property bounds if there are properties
    if (properties.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      Object.values(markers.current).forEach(marker => {
        bounds.extend(marker.getLngLat());
      });
      
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [properties, mapLoaded, selectedPropertyId, onMarkerClick, onMarkerHover, mapError]);

  // Update marker styles when selected property changes
  useEffect(() => {
    if (!map.current || !mapLoaded || mapError) return;
    
    // Update marker styles
    Object.entries(markers.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      
      if (id === selectedPropertyId) {
        el.className = "property-marker selected";
        el.querySelector("div")?.classList.add("border-kabyle-blue");
        el.querySelector("div")?.classList.remove("border-kabyle-terracotta");
        if (!marker.getPopup().isOpen()) {
          marker.togglePopup();
        }
      } else {
        el.className = "property-marker";
        el.querySelector("div")?.classList.remove("border-kabyle-blue");
        el.querySelector("div")?.classList.add("border-kabyle-terracotta");
        if (marker.getPopup().isOpen()) {
          marker.togglePopup();
        }
      }
    });
  }, [selectedPropertyId, mapLoaded, mapError]);

  if (mapError) {
    return (
      <div className="map-container h-80 rounded-lg overflow-hidden border shadow-sm bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-gray-700">{mapError}</p>
          <p className="text-sm text-gray-500 mt-2">Vous pouvez toujours naviguer dans la liste des propriétés ci-dessous.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container h-80 rounded-lg overflow-hidden border shadow-sm" ref={mapContainer} />
  );
};

export default PropertyMap;
