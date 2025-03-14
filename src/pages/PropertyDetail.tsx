import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Property, properties } from "@/data/properties";
import { Calendar, Heart, MapPin, MessageSquare, Star, User, Users } from "lucide-react";
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
import Map from "@/components/Map";
import PropertyMessageForm from "@/components/messaging/PropertyMessageForm";

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
  owner_id: string;
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
  
  useEffect(() => {
    if (propertyData) {
      const transformedProperty: Property = {
        id: propertyData.id,
        name: propertyData.name,
        title: propertyData.name,
        description: propertyData.description || "",
        price: propertyData.price,
        capacity: propertyData.capacity,
        wilaya_id: 0,
        commune_id: propertyData.commune_id,
        owner_id: propertyData.owner_id,
        location: {
          latitude: 0,
          longitude: 0,
          village: propertyData.commune.name,
          wilaya: propertyData.commune.wilaya.name
        },
        images: propertyData.images || ["/placeholder.svg"],
        features: [`Capacité: ${propertyData.capacity} personnes`],
        rating: propertyData.rating || 0,
        reviewCount: 0,
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
  
  const displayTitle = property.title || property.name;
  
  return (
    <>
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 pb-12">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{displayTitle}</h1>
              <div className="flex items-center mt-2 text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location?.village || "Non spécifié"}, {property.location?.wilaya || "Non spécifié"}</span>
                
                {property.rating > 0 && (
                  <div className="flex items-center ml-4">
                    <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{property.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {property && property.owner_id && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex items-center bg-kabyle-terracotta hover:bg-kabyle-terracotta/90"
                  onClick={() => {
                    const contactForm = document.getElementById('contact-owner-form');
                    if (contactForm) {
                      contactForm.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter le propriétaire
                </Button>
              )}
              
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
          
          <div className="md:hidden mb-6">
            {property && property.owner_id && (
              <div className="border rounded-lg p-4 bg-kabyle-terracotta/5 border-kabyle-terracotta/20">
                <h3 className="font-medium text-lg mb-2 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-kabyle-terracotta" />
                  Contacter le propriétaire
                </h3>
                <PropertyMessageForm 
                  ownerId={property.owner_id}
                  propertyId={property.id}
                  propertyName={property.name || property.title || "Logement"}
                />
              </div>
            )}
          </div>
          
          <div className="mb-8">
            <Carousel className="w-full">
              <CarouselContent>
                {property.images.map((image, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`${displayTitle} - image ${index + 1}`}
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    Logement proposé par {property.host?.name || "Hôte"}
                  </h2>
                  <p className="text-gray-600">
                    <span className="flex items-center mt-1">
                      <Users className="h-4 w-4 mr-2" />
                      Capacité: {property.capacity || 'Non spécifiée'} personnes
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img 
                    src={property.host?.avatar || "/placeholder.svg"} 
                    alt={property.host?.name || "Hôte"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="hidden md:block mb-6">
                {property && property.owner_id && (
                  <div id="contact-owner-form" className="border rounded-lg p-4 bg-kabyle-terracotta/5 border-kabyle-terracotta/20 mb-6">
                    <h3 className="font-medium text-lg mb-2 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-kabyle-terracotta" />
                      Contacter le propriétaire
                    </h3>
                    <PropertyMessageForm 
                      ownerId={property.owner_id}
                      propertyId={property.id}
                      propertyName={property.name || property.title || "Logement"}
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {property.features && property.features.map((feature, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-kabyle-terracotta/10 flex items-center justify-center mr-3">
                      <span className="w-2 h-2 bg-kabyle-terracotta rounded-full"></span>
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">À propos de ce logement</h3>
                <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
              </div>
              
              <Separator className="my-6" />
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Ce que propose ce logement</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property.amenities && property.amenities.map((amenity, index) => (
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
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Expériences culturelles</h3>
                <div className="grid grid-cols-1 gap-4">
                  {property.cultural_offerings && property.cultural_offerings.map((offering, index) => (
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
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Disponibilité</h3>
                <PropertyAvailability property={property} />
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Emplacement</h3>
                <div className="h-80 rounded-lg overflow-hidden border shadow-sm">
                  {property.latitude && property.longitude ? (
                    <Map 
                      latitude={property.latitude} 
                      longitude={property.longitude} 
                      readOnly={true}
                      height="h-full"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">Localisation non disponible</p>
                    </div>
                  )}
                </div>
                {property.address && (
                  <p className="mt-2 text-sm text-gray-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.address}
                  </p>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <BookingRequestForm property={property} />
                
                <div className="hidden md:block">
                  {property && property.owner_id && (
                    <div className="p-4 text-center">
                      <Button 
                        className="w-full bg-kabyle-terracotta hover:bg-kabyle-terracotta/90"
                        onClick={() => {
                          const contactForm = document.getElementById('contact-owner-form');
                          if (contactForm) {
                            contactForm.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contacter le propriétaire
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default PropertyDetail;
