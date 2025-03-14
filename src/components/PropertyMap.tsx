
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@/data/properties';

// Temporary mapbox token - in production, use environment variables
// and store this in Supabase secrets
const MAPBOX_TOKEN = "pk.eyJ1IjoiZGVtby1rYWJ5bGUiLCJhIjoiY2xzeTVtbG51MDd2bzJrcmt5czVwMmt6dyJ9.O0vktG8xzT-c_ATOEiF7ug";

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onMarkerClick?: (propertyId: string) => void;
  onMarkerHover?: (propertyId: string) => void;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  properties, 
  selectedPropertyId,
  onMarkerClick,
  onMarkerHover
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: mapboxgl.Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    const initializeMap = () => {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [4.0, 36.7], // Central position in Kabylie region
        zoom: 9
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        console.log("Map initialized and loaded");
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );
    };

    if (!map.current) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add markers for properties
  useEffect(() => {
    if (!map.current || !mapLoaded || properties.length === 0) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Get bounds to fit all markers
    const bounds = new mapboxgl.LngLatBounds();

    // Add markers for each property
    properties.forEach(property => {
      // For now, generate random coordinates around Kabylie region
      // In production, these would come from the database
      const lat = 36.5 + Math.random() * 0.5; // Random latitude in Kabylie
      const lng = 3.9 + Math.random() * 0.7;  // Random longitude in Kabylie
      
      const el = document.createElement('div');
      el.className = 'property-marker';
      el.innerHTML = '<div class="w-8 h-8 bg-kabyle-blue text-white rounded-full flex items-center justify-center shadow-md hover:bg-kabyle-red transition-colors">' + 
        '<span>🏠</span></div>';
      
      // Highlight selected property
      if (selectedPropertyId === property.id) {
        el.classList.add('selected');
        el.style.zIndex = '10';
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(
              `<div class="p-2">
                <h3 class="font-bold">${property.title}</h3>
                <p>${property.price} DA/nuit</p>
                <a href="/property/${property.id}" class="text-kabyle-blue hover:underline">Voir détails</a>
              </div>`
            )
        )
        .addTo(map.current);
      
      // Add click event
      el.addEventListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(property.id);
        }
      });
      
      // Add hover event
      el.addEventListener('mouseenter', () => {
        if (onMarkerHover) {
          onMarkerHover(property.id);
        }
        el.style.transform = 'scale(1.2)';
      });
      
      el.addEventListener('mouseleave', () => {
        if (selectedPropertyId !== property.id) {
          el.style.transform = 'scale(1)';
        }
      });
      
      // Store marker reference
      markersRef.current[property.id] = marker;
      
      // Extend bounds to include this marker
      bounds.extend([lng, lat]);
    });

    // Fit map to bounds with padding
    if (Object.keys(markersRef.current).length > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 13
      });
    }
  }, [properties, mapLoaded, selectedPropertyId, onMarkerClick, onMarkerHover]);

  // Update marker style when selected property changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      
      if (id === selectedPropertyId) {
        el.classList.add('selected');
        el.style.zIndex = '10';
        el.style.transform = 'scale(1.2)';
      } else {
        el.classList.remove('selected');
        el.style.zIndex = '1';
        el.style.transform = 'scale(1)';
      }
    });
  }, [selectedPropertyId, mapLoaded]);

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-md">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default PropertyMap;
