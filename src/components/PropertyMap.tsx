
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Property } from "@/data/properties";

// Configure Mapbox
mapboxgl.accessToken = "pk.eyJ1IjoieWFuaXNnYXJvdWkiLCJhIjoiY2xzdnB2d2xwMDE4YzJrbzl0ZmpieHF1eiJ9.LRnIQB9tzWuWdLQ1qqkgbA";

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [4.2, 36.7], // Center on Kabylie region
      zoom: 8,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add/update markers when properties change
  useEffect(() => {
    if (!map.current || !mapLoaded || properties.length === 0) return;

    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Add markers for each property
    properties.forEach(property => {
      // Generate random coordinates near Kabylie for demo
      // In a real app, these would come from the database
      const lat = 36.7 + (Math.random() - 0.5) * 0.5;
      const lng = 4.2 + (Math.random() - 0.5) * 0.5;

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
              <h3 class="font-bold text-sm">${property.title}</h3>
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
  }, [properties, mapLoaded, selectedPropertyId, onMarkerClick, onMarkerHover]);

  // Update marker styles when selected property changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    // Update marker styles
    Object.entries(markers.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      
      if (id === selectedPropertyId) {
        el.className = "property-marker selected";
        el.querySelector("div")?.classList.add("border-kabyle-blue");
        el.querySelector("div")?.classList.remove("border-kabyle-terracotta");
        marker.setPopup(marker.getPopup()).togglePopup();
      } else {
        el.className = "property-marker";
        el.querySelector("div")?.classList.remove("border-kabyle-blue");
        el.querySelector("div")?.classList.add("border-kabyle-terracotta");
        marker.setPopup(marker.getPopup()).togglePopup(false);
      }
    });
  }, [selectedPropertyId, mapLoaded]);

  return (
    <div className="map-container h-80 rounded-lg overflow-hidden border shadow-sm" ref={mapContainer} />
  );
};

export default PropertyMap;
