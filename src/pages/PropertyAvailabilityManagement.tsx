
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";
import AvailabilityManager from "@/components/property/AvailabilityManager";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Property } from "@/components/property/PropertyForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PropertyAvailabilityManagement = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("guesthouses")
          .select("*")
          .eq("owner_id", user.id);
        
        if (error) throw error;
        
        setProperties(data || []);
        if (data && data.length > 0) {
          setSelectedPropertyId(data[0].id);
        }
      } catch (error) {
        console.error("Error loading properties:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [user]);
  
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Gestion des disponibilités</h1>
            
            <Link to="/property-management">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour à la gestion
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-kabyle-blue" />
            </div>
          ) : properties.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Aucun logement trouvé</CardTitle>
                <CardDescription>
                  Vous n'avez pas encore ajouté de logement à gérer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/property-management">
                  <Button>Ajouter un logement</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sélectionnez un logement</CardTitle>
                  <CardDescription>
                    Choisissez le logement dont vous souhaitez gérer la disponibilité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedPropertyId || undefined}
                    onValueChange={(value) => setSelectedPropertyId(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un logement" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              {selectedProperty && (
                <AvailabilityManager 
                  property={selectedProperty} 
                  onAvailabilityUpdated={() => {
                    // Refresh properties after availability update
                    if (user) {
                      supabase
                        .from("guesthouses")
                        .select("*")
                        .eq("owner_id", user.id)
                        .then(({ data }) => {
                          if (data) {
                            setProperties(data);
                          }
                        });
                    }
                  }}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PropertyAvailabilityManagement;
