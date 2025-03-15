
import { useEffect, useRef, useState } from "react";
import { Property } from "@/data/properties";
import { AlertTriangle } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onMarkerClick?: (propertyId: string) => void;
  onMarkerHover?: (propertyId: string) => void;
  readOnly?: boolean;
  height?: string;
}

const PropertyMap = ({
  properties,
  selectedPropertyId,
  onMarkerClick,
  onMarkerHover,
  readOnly = false,
  height = "h-80"
}: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<{[key: string]: L.Marker}>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Fix Leaflet default icon issue
  useEffect(() => {
    // Fix Leaflet default icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    try {
      if (!map.current) {
        // Center on Kabylie region by default
        const kabylieCenter: L.LatLngExpression = [36.7169, 4.0497];
        
        map.current = L.map(mapContainer.current, {
          // Désactiver le zoom sur la molette pour éviter les mouvements indésirables
          scrollWheelZoom: false,
          // Ajouter des limites de mouvement
          maxBounds: [
            [35.0, 2.0], // Sud-ouest
            [38.0, 6.0]  // Nord-est
          ],
          maxBoundsViscosity: 1.0
        }).setView(kabylieCenter, 8);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map.current);
        
        setMapLoaded(true);
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Impossible d'initialiser la carte.");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Helper function to get valid coordinates from a property
  const getValidCoordinates = (property: Property): L.LatLngExpression => {
    // Ordered priority for coordinate sources
    // 1. Direct latitude/longitude on the property
    if (typeof property.latitude === 'number' && typeof property.longitude === 'number') {
      return [property.latitude, property.longitude];
    }
    
    // 2. Location object with latitude/longitude
    if (property.location?.latitude && property.location?.longitude) {
      return [property.location.latitude, property.location.longitude];
    }
    
    // 3. Generate random coordinates near Kabylie region as fallback
    const randomLat = 36.7169 + (Math.random() - 0.5) * 0.5;
    const randomLng = 4.0497 + (Math.random() - 0.5) * 0.5;
    return [randomLat, randomLng];
  };

  // Add/update markers when properties change
  useEffect(() => {
    if (!map.current || !mapLoaded || properties.length === 0 || mapError) return;

    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Track valid coordinates for map bounds
    const validCoordinates: L.LatLngTuple[] = [];

    // Add markers for each property
    properties.forEach(property => {
      const coordinates = getValidCoordinates(property);
      validCoordinates.push(coordinates as L.LatLngTuple);

      // Create custom icon for markers
      const customIcon = L.divIcon({
        className: `property-marker ${selectedPropertyId === property.id ? "selected" : ""}`,
        html: `<div class="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 ${
          selectedPropertyId === property.id ? "border-kabyle-blue" : "border-kabyle-terracotta"
        }">
          <span class="text-xs font-bold">${property.price}DA</span>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Create and add the marker
      const marker = L.marker(coordinates, { icon: customIcon });
      
      // Create popup with property info
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-sm">${property.title || property.name}</h3>
          <p class="text-xs">${property.price} DA / nuit</p>
          ${property.address ? `<p class="text-xs mt-1">${property.address}</p>` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      // Add event listeners if not in readOnly mode
      if (!readOnly) {
        marker.on('click', () => {
          if (onMarkerClick) onMarkerClick(property.id);
        });
        
        marker.on('mouseover', () => {
          if (onMarkerHover) onMarkerHover(property.id);
        });
      }
      
      marker.addTo(map.current);

      // Store the marker reference
      markers.current[property.id] = marker;
    });

    // Fit map to property bounds if there are properties with valid coordinates
    if (validCoordinates.length > 0) {
      const bounds = L.latLngBounds(validCoordinates);
      map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [properties, mapLoaded, selectedPropertyId, onMarkerClick, onMarkerHover, mapError, readOnly]);

  // Update marker styles when selected property changes
  useEffect(() => {
    if (!map.current || !mapLoaded || mapError) return;
    
    // Update marker styles and open popup for selected property
    Object.entries(markers.current).forEach(([id, marker]) => {
      if (id === selectedPropertyId) {
        marker.openPopup();
        
        // Replace the icon with selected style
        const customIcon = L.divIcon({
          className: "property-marker selected",
          html: `<div class="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-kabyle-blue">
            <span class="text-xs font-bold">${properties.find(p => p.id === id)?.price}DA</span>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        
        marker.setIcon(customIcon);
      } else {
        marker.closePopup();
        
        // Reset to default icon
        const customIcon = L.divIcon({
          className: "property-marker",
          html: `<div class="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-kabyle-terracotta">
            <span class="text-xs font-bold">${properties.find(p => p.id === id)?.price}DA</span>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        
        marker.setIcon(customIcon);
      }
    });
  }, [selectedPropertyId, mapLoaded, mapError, properties]);

  if (mapError) {
    return (
      <div className={`map-container ${height} rounded-lg overflow-hidden border shadow-sm bg-gray-100 flex items-center justify-center`}>
        <div className="text-center p-4">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-gray-700">{mapError}</p>
          <p className="text-sm text-gray-500 mt-2">Vous pouvez toujours naviguer dans la liste des propriétés ci-dessous.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`map-container ${height} rounded-lg overflow-hidden border shadow-sm`} ref={mapContainer} />
  );
};

export default PropertyMap;
