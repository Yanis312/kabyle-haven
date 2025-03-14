
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

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    if (id) {
      const foundProperty = properties.find(p => p.id === id);
      if (foundProperty) {
        setProperty(foundProperty);
      }
    }
  }, [id]);
  
  if (!property) {
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
          
          {/* Location Map */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Emplacement</h2>
            <PropertyMap 
              properties={[property]} 
              selectedPropertyId={property.id}
            />
          </div>
          
          {/* Availability Calendar */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Disponibilité</h2>
            <PropertyAvailability property={property} />
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
            </div>
            
            {/* Right column - Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 kabyle-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-2xl font-bold">{property.price} €</span>
                    <span className="text-gray-600"> / nuit</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-medium">{property.rating}</span>
                    <span className="text-gray-600 mx-1">·</span>
                    <span className="text-gray-600">{property.reviewCount} avis</span>
                  </div>
                </div>
                
                {/* Date selection */}
                <div className="mb-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border rounded-lg p-3">
                      <label className="text-xs text-gray-500 block">CHECK-IN</label>
                      <div className="flex items-center pt-1">
                        <Calendar className="h-4 w-4 text-kabyle-terracotta mr-2" />
                        <span>Ajouter une date</span>
                      </div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <label className="text-xs text-gray-500 block">CHECK-OUT</label>
                      <div className="flex items-center pt-1">
                        <Calendar className="h-4 w-4 text-kabyle-terracotta mr-2" />
                        <span>Ajouter une date</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <label className="text-xs text-gray-500 block">VOYAGEURS</label>
                    <div className="flex items-center pt-1">
                      <Users className="h-4 w-4 text-kabyle-terracotta mr-2" />
                      <span>1 voyageur</span>
                    </div>
                  </div>
                </div>
                
                {/* Booking button */}
                <Button className="w-full bg-kabyle-terracotta hover:bg-kabyle-terracotta/90 mb-4">
                  Réserver
                </Button>
                
                {/* Booking info */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="underline">{property.price} € x 5 nuits</span>
                    <span>{property.price * 5} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Frais de service</span>
                    <span>{Math.round(property.price * 5 * 0.12)} €</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{property.price * 5 + Math.round(property.price * 5 * 0.12)} €</span>
                  </div>
                </div>
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
