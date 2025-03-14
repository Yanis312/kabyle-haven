
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Home, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorState from '@/components/property/ErrorState';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

// Types
interface BookingRequest {
  id: string;
  property_id: string;
  requester_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  created_at: string;
  updated_at: string;
  guesthouses: {
    name: string;
    commune_id: number;
  };
  // These properties might be nullable
  commune_name?: string;
  wilaya_name?: string;
}

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "PPP", { locale: fr });
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'pending') {
    return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">En attente</Badge>;
  } else if (status === 'accepted') {
    return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Acceptée</Badge>;
  } else {
    return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Refusée</Badge>;
  }
};

export default function BookingRequestsPage() {
  const { user } = useAuth();
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchBookingRequests();
    }
  }, [user]);
  
  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      
      // Perform query with proper table joins
      const { data, error } = await supabase
        .from("booking_requests")
        .select(`
          *,
          guesthouses(name, commune_id)
        `)
        .eq("requester_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Fetch commune and wilaya information separately
      const enhancedData = await Promise.all((data || []).map(async (request) => {
        // Get commune information
        if (request.guesthouses && request.guesthouses.commune_id) {
          const { data: communeData } = await supabase
            .from("communes")
            .select("name, wilaya_id")
            .eq("id", request.guesthouses.commune_id)
            .single();
          
          let wilayaName = null;
          
          // Get wilaya information if commune was found
          if (communeData && communeData.wilaya_id) {
            const { data: wilayaData } = await supabase
              .from("wilayas")
              .select("name")
              .eq("id", communeData.wilaya_id)
              .single();
              
            wilayaName = wilayaData?.name;
          }
          
          return {
            ...request,
            commune_name: communeData?.name,
            wilaya_name: wilayaName
          };
        }
        
        return request;
      }));
      
      setBookingRequests(enhancedData);
    } catch (err: any) {
      console.error("Error fetching booking requests:", err);
      toast.error("Erreur lors du chargement des demandes de réservation");
      setError(err.message);
      setBookingRequests([]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Mes demandes de réservation</h1>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kabyle-blue mb-4"></div>
                <p className="text-gray-500">Chargement de vos demandes de réservation...</p>
              </div>
            </div>
          ) : error ? (
            <ErrorState error={error} onRetry={fetchBookingRequests} />
          ) : bookingRequests.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune demande de réservation</h3>
              <p className="text-gray-500 mb-4">
                Vous n'avez pas encore fait de demandes de réservation.
              </p>
              <Button asChild>
                <a href="/">Découvrir des logements</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookingRequests.map((request) => (
                <Card key={request.id} className={`
                  ${request.status === "pending" ? "border-amber-300" : 
                    request.status === "accepted" ? "border-green-300" : "border-red-300"}
                `}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{request.guesthouses.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {request.commune_name && request.wilaya_name
                            ? `${request.commune_name}, ${request.wilaya_name}`
                            : "Localisation non spécifiée"}
                        </CardDescription>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        <span>Du {formatDate(request.start_date)} au {formatDate(request.end_date)}</span>
                      </div>
                      
                      {request.message && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
                          <p className="font-medium mb-1">Votre message:</p>
                          <p>{request.message}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between text-xs text-gray-500">
                    <span>Demande envoyée le {format(new Date(request.created_at), "PP", { locale: fr })}</span>
                    {request.status !== "pending" && (
                      <span className="italic">
                        {request.status === "accepted" ? "Acceptée" : "Refusée"} le {
                          format(new Date(request.updated_at), "PP", { locale: fr })
                        }
                      </span>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
