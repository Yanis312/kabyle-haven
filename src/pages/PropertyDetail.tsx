
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import properties, { Property } from "@/data/properties";
import { Calendar, Heart, MapPin, Star, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import PropertyMap from "@/components/PropertyMap";
import PropertyAvailability from "@/components/PropertyAvailability";
import BookingRequestForm from "@/components/BookingRequestForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyDetailData {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  rating: number;
  images: string[];
  availability: any;
  commune_id: number;
  commune: {
    name: string;
    wilaya: {
      name: string;
    }
  }
}

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Fetch property data from Supabase
  const { data: propertyData, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) throw new Error("Property ID is required");
      
      const { data, error } = await supabase
        .from('guesthouses')
        .select(`
          *,
          commune:communes!inner(
            name,
            wilaya:wilayas!inner(name)
          )
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data as PropertyDetailData;
    },
    enabled: !!id,
  });
  
  // Transform Supabase data to match Property interface
  useEffect(() => {
    if (propertyData) {
      const transformedProperty: Property = {
        id: propertyData.id,
        title: propertyData.name,
        description: propertyData.description || "",
        price: propertyData.price,
        location: {
          village: propertyData.commune.name,
          wilaya: propertyData.commune.wilaya.name
        },
        images: propertyData.images || ["/placeholder.svg"],
        features: [`Capacité: ${propertyData.capacity} personnes`],
        rating: propertyData.rating || 0,
        reviewCount: 0,
        // Default values for required properties
        host: {
          name: "Hôte",
          avatar: "/placeholder.svg",
          languages: ["Français", "Kabyle"]
        },
        amenities: ["Wi-Fi", "Cuisine équipée", "Parking"],
        availability: propertyData.availability || null,
        cultural_offerings: ["Traditions locales", "Cuisine traditionnelle"]
      };
      
      setProperty(transformedProperty);
    }
  }, [propertyData]);
  
  // Fallback to static data if needed (during development/transition)
  useEffect(() => {
    if (id && !propertyData && !isLoading) {
      const foundProperty = properties.find(p => p.id === id);
      if (foundProperty) {
        setProperty(foundProperty);
      }
    }
  }, [id, propertyData, isLoading]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <Skeleton className="h-12 w-2/3 mb-2" />
            <Skeleton className="h-6 w-1/3 mb-6" />
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Skeleton className="aspect-[4/3] rounded-lg" />
              <Skeleton className="aspect-[4/3] rounded-lg" />
              <Skeleton className="aspect-[4/3] rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="h-80 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Logement non trouvé</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Property title and location */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{property.title}</h1>
              <div className="flex items-center mt-2 text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location.village}, {property.location.wilaya}</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={cn(
                  "h-4 w-4 mr-2",
                  isFavorite ? "fill-red-500 text-red-500" : ""
                )} />
                {isFavorite ? "Sauvegardé" : "Sauvegarder"}
              </Button>
            </div>
          </div>
          
          {/* Image carousel gallery */}
          <div className="mb-8">
            <Carousel className="w-full">
              <CarouselContent>
                {property.images.map((image, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`${property.title} - image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>
          
          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left column - Property details */}
            <div className="lg:col-span-2">
              {/* Host info */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    Logement proposé par {property.host.name}
                  </h2>
                  <p className="text-gray-600">
                    Langues: {property.host.languages.join(", ")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img 
                    src={property.host.avatar} 
                    alt={property.host.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-kabyle-terracotta/10 flex items-center justify-center mr-3">
                      <span className="w-2 h-2 bg-kabyle-terracotta rounded-full"></span>
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">À propos de ce logement</h3>
                <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
              </div>
              
              <Separator className="my-6" />
              
              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Ce que propose ce logement</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-kabyle-blue/10 flex items-center justify-center mr-3">
                        <span className="w-2 h-2 bg-kabyle-blue rounded-full"></span>
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {/* Cultural offerings */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Expériences culturelles</h3>
                <div className="grid grid-cols-1 gap-4">
                  {property.cultural_offerings.map((offering, index) => (
                    <div key={index} className="p-4 border border-kabyle-terracotta/20 rounded-lg bg-kabyle-terracotta/5">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 rounded-full bg-kabyle-terracotta/20 flex items-center justify-center mr-3">
                          <span className="w-2 h-2 bg-kabyle-terracotta rounded-full"></span>
                        </div>
                        <span className="font-medium">{offering}</span>
                      </div>
                      <p className="text-sm text-gray-600 pl-9">Découvrez l'authenticité de la culture kabyle à travers cette expérience unique.</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Location Map */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Emplacement</h3>
                <PropertyMap 
                  properties={[property]} 
                  selectedPropertyId={property.id}
                />
              </div>
              
              {/* Availability Calendar */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Disponibilité</h3>
                <PropertyAvailability property={property} />
              </div>
            </div>
            
            {/* Right column - Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingRequestForm property={property} />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PropertyDetail;
