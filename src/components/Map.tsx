
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  latitude?: number;
  longitude?: number;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
  height?: string;
  className?: string;
}

const Map = ({ 
  latitude = 36.7169, 
  longitude = 4.0497, 
  onChange,
  readOnly = false,
  height = "h-60",
  className = ""
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Make sure we don't initialize the map twice
    if (map.current) return;
    
    try {
      // Initialize the map
      map.current = L.map(mapContainer.current).setView([latitude, longitude], 12);
      
      // Add the tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map.current);
      
      // Add initial marker if coordinates exist
      if (latitude && longitude) {
        marker.current = L.marker([latitude, longitude], { 
          draggable: !readOnly 
        }).addTo(map.current);
        
        // Handle marker drag end event for editable markers
        if (!readOnly && marker.current && onChange) {
          marker.current.on('dragend', () => {
            const position = marker.current?.getLatLng();
            if (position && onChange) {
              onChange(position.lat, position.lng);
            }
          });
        }
      }
      
      // Handle map click event for adding/moving marker (only if not readOnly)
      if (!readOnly) {
        map.current.on('click', (e) => {
          const { lat, lng } = e.latlng;
          
          if (marker.current) {
            // Move existing marker
            marker.current.setLatLng([lat, lng]);
          } else {
            // Create new marker
            marker.current = L.marker([lat, lng], { 
              draggable: true 
            }).addTo(map.current!);
            
            // Add drag event
            marker.current.on('dragend', () => {
              const position = marker.current?.getLatLng();
              if (position && onChange) {
                onChange(position.lat, position.lng);
              }
            });
          }
          
          // Trigger the onChange callback
          if (onChange) {
            onChange(lat, lng);
          }
        });
      }
    } catch (error) {
      console.error("Error initializing map:", error);
    }
    
    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
    };
  }, []);
  
  // Update marker position when coordinates change
  useEffect(() => {
    if (!map.current) return;
    
    if (latitude && longitude) {
      // Center the map on the new coordinates
      map.current.setView([latitude, longitude], map.current.getZoom());
      
      // Update or create marker
      if (marker.current) {
        marker.current.setLatLng([latitude, longitude]);
      } else {
        marker.current = L.marker([latitude, longitude], { 
          draggable: !readOnly 
        }).addTo(map.current);
        
        // Add drag event if not readOnly
        if (!readOnly && onChange) {
          marker.current.on('dragend', () => {
            const position = marker.current?.getLatLng();
            if (position) {
              onChange(position.lat, position.lng);
            }
          });
        }
      }
    }
  }, [latitude, longitude, readOnly, onChange]);

  return (
    <div 
      ref={mapContainer} 
      className={`${height} rounded-md border overflow-hidden ${className}`}
    />
  );
};

export default Map;
