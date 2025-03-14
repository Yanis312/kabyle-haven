
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ErrorState from "@/components/property/ErrorState";

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "PPP", { locale: fr });
};

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
  properties: {
    name: string;
    availability: any;
    images?: string[];
  };
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function BookingRequestManagement() {
  const { user } = useAuth();
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookingRequests();
    }
  }, [user]);

  // Fetch booking requests for this owner
  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("booking_requests")
        .select(`
          *,
          properties:guesthouses(name, availability, images),
          profiles:requester_id(first_name, last_name, email)
        `)
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      console.log("Fetched booking requests:", data);
      setBookingRequests(data || []);
    } catch (err: any) {
      console.error("Error fetching booking requests:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle accept or reject booking request
  const handleAction = async (action: "accept" | "reject") => {
    if (!selectedRequest) return;
    
    try {
      setActionLoading(true);
      
      // Map action to database status value
      const dbStatus = action === "accept" ? "accepted" : "rejected";
      
      // Update booking request status
      const { error: updateError } = await supabase
        .from("booking_requests")
        .update({ status: dbStatus })
        .eq("id", selectedRequest.id);
      
      if (updateError) throw updateError;
      
      // If accepting, we need to update the property availability
      if (action === "accept") {
        // Get the current availability or initialize a new one
        const currentProperty = selectedRequest.properties;
        const currentAvailability = currentProperty.availability || {};
        
        // Add the booked dates to the availability
        const startDate = new Date(selectedRequest.start_date);
        const endDate = new Date(selectedRequest.end_date);
        
        // Create an array of dates between start and end
        const bookedDates = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const dateString = currentDate.toISOString().split('T')[0];
          bookedDates.push(dateString);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Update the availability object
        const updatedAvailability = { ...currentAvailability };
        
        // Mark these dates as booked
        for (const date of bookedDates) {
          if (!updatedAvailability[date]) {
            updatedAvailability[date] = { status: 'booked' };
          } else {
            updatedAvailability[date].status = 'booked';
          }
        }
        
        // Update the property availability
        const { error: availabilityError } = await supabase
          .from("guesthouses")
          .update({ availability: updatedAvailability })
          .eq("id", selectedRequest.property_id);
        
        if (availabilityError) {
          console.error("Error updating availability:", availabilityError);
          toast.error("Réservation acceptée, mais erreur lors de la mise à jour du calendrier");
        } else {
          toast.success(`Réservation acceptée pour ${selectedRequest.properties.name}`);
        }
      } else {
        toast.info(`Demande de réservation refusée pour ${selectedRequest.properties.name}`);
      }
      
      // Close the dialog
      setShowDialog(false);
      
      // Update the local state
      setBookingRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === selectedRequest.id
            ? { ...request, status: dbStatus as "pending" | "accepted" | "rejected" }
            : request
        )
      );
    } catch (err: any) {
      console.error(`Error ${action === "accept" ? "accepting" : "rejecting"} booking:`, err);
      toast.error(`Erreur lors de ${action === "accept" ? "l'acceptation" : "le refus"} de la réservation`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle opening the action dialog
  const openActionDialog = (request: BookingRequest) => {
    setSelectedRequest(request);
    setShowDialog(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kabyle-blue mb-4"></div>
          <p className="text-gray-500">Chargement des demandes de réservation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={fetchBookingRequests} />;
  }

  // Empty state
  if (bookingRequests.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucune demande de réservation</h3>
        <p className="text-gray-500 mb-4 max-w-md mx-auto">
          Vous n'avez pas encore reçu de demandes de réservation pour vos logements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Demandes de réservation</h2>
        <div>
          <Badge className="mb-2 ml-2">
            {bookingRequests.filter(req => req.status === "pending").length} en attente
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookingRequests.map((request) => (
          <Card key={request.id} className={`
            ${request.status === "pending" ? "border-amber-300" : 
              request.status === "accepted" ? "border-green-300" : "border-red-300"}
          `}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{request.properties.name}</CardTitle>
                  <CardDescription>
                    {request.profiles.first_name} {request.profiles.last_name}
                  </CardDescription>
                </div>
                {request.status === "pending" ? (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    En attente
                  </Badge>
                ) : request.status === "accepted" ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    Acceptée
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                    Refusée
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Du {formatDate(request.start_date)} au {formatDate(request.end_date)}</span>
                </div>
                
                {request.properties.images && request.properties.images.length > 0 && (
                  <div className="mt-2">
                    <img 
                      src={request.properties.images[0]} 
                      alt={request.properties.name}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
                
                {request.message && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                    <p className="font-medium mb-1">Message:</p>
                    <p>{request.message}</p>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-2">
                  Demande reçue le {format(new Date(request.created_at), "PPP", { locale: fr })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              {request.status === "pending" && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openActionDialog(request)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Refuser
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => openActionDialog(request)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accepter
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Confirmation Dialog */}
      {selectedRequest && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedRequest.status === "pending" 
                  ? "Répondre à la demande de réservation" 
                  : selectedRequest.status === "accepted" 
                    ? "Réservation acceptée" 
                    : "Réservation refusée"}
              </DialogTitle>
              <DialogDescription>
                Réservation pour <strong>{selectedRequest.properties.name}</strong> du{" "}
                {formatDate(selectedRequest.start_date)} au {formatDate(selectedRequest.end_date)}
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest.status === "pending" && (
              <>
                <div className="flex items-center p-4 bg-gray-50 rounded-md mb-4">
                  <Info className="h-8 w-8 text-blue-500 mr-4" />
                  <div>
                    <h4 className="font-medium">Informations sur le client</h4>
                    <p className="text-sm text-gray-600">
                      {selectedRequest.profiles.first_name} {selectedRequest.profiles.last_name}
                      <br />
                      {selectedRequest.profiles.email}
                    </p>
                  </div>
                </div>
                
                <DialogFooter className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    onClick={() => handleAction("reject")}
                    disabled={actionLoading}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Refuser
                  </Button>
                  <Button 
                    onClick={() => handleAction("accept")}
                    disabled={actionLoading}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accepter
                  </Button>
                </DialogFooter>
              </>
            )}
            
            {selectedRequest.status !== "pending" && (
              <div className="flex items-center justify-center p-6">
                <Button onClick={() => setShowDialog(false)}>Fermer</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
