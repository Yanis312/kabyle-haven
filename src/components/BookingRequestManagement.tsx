
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, X, Loader2, Calendar, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BookingRequest {
  id: string;
  property_id: string;
  requester_id: string;
  start_date: string;
  end_date: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  created_at: string;
  updated_at: string;
  
  // Join data
  properties: {
    name: string;
    availability: any;
  };
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function BookingRequestManagement() {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) return;
    
    const fetchBookingRequests = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("booking_requests")
          .select(`
            *,
            properties:guesthouses(name, availability),
            profiles:profiles(first_name, last_name, email)
          `)
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        setBookingRequests(data || []);
      } catch (err: any) {
        console.error("Error fetching booking requests:", err);
        toast.error("Erreur lors du chargement des demandes de réservation");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookingRequests();
  }, [user]);
  
  const handleAction = async (action: "accept" | "reject") => {
    if (!selectedRequest) return;
    
    try {
      setActionLoading(true);
      
      // Update booking request status
      const { error: updateError } = await supabase
        .from("booking_requests")
        .update({ status: action })
        .eq("id", selectedRequest.id);
      
      if (updateError) throw updateError;
      
      // If accepting, update property availability
      if (action === "accept") {
        // Parse dates
        const startDate = parseISO(selectedRequest.start_date);
        const endDate = parseISO(selectedRequest.end_date);
        
        // Update property availability
        const { error: availabilityError } = await supabase
          .from("guesthouses")
          .update({
            availability: {
              start_date: format(startDate, "yyyy-MM-dd"),
              end_date: format(endDate, "yyyy-MM-dd")
            }
          })
          .eq("id", selectedRequest.property_id);
        
        if (availabilityError) throw availabilityError;
      }
      
      // Update local state
      setBookingRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === selectedRequest.id
            ? { ...request, status: action }
            : request
        )
      );
      
      toast.success(
        action === "accept"
          ? "Demande acceptée avec succès"
          : "Demande refusée avec succès"
      );
      
      setOpenDialog(false);
    } catch (err: any) {
      console.error(`Error ${action}ing booking request:`, err);
      toast.error(`Erreur lors de l'${action === "accept" ? "acceptation" : "refus"} de la demande`);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleAccept = (request: BookingRequest) => {
    setSelectedRequest(request);
    setActionType("accept");
    setOpenDialog(true);
  };
  
  const handleReject = (request: BookingRequest) => {
    setSelectedRequest(request);
    setActionType("reject");
    setOpenDialog(true);
  };
  
  // Filter requests by status
  const pendingRequests = bookingRequests.filter(req => req.status === "pending");
  const acceptedRequests = bookingRequests.filter(req => req.status === "accepted");
  const rejectedRequests = bookingRequests.filter(req => req.status === "rejected");
  
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "d MMMM yyyy", { locale: fr });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Acceptée</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Refusée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Demandes de réservation</h2>
        <Link to="/property-management">
          <Button variant="outline" className="gap-2">
            Gérer mes logements
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            En attente
            {pendingRequests.length > 0 && (
              <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-kabyle-terracotta text-[10px] text-white">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted">Acceptées</TabsTrigger>
          <TabsTrigger value="rejected">Refusées</TabsTrigger>
        </TabsList>
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-kabyle-blue" />
          </div>
        ) : (
          <>
            <TabsContent value="pending" className="mt-6">
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium mb-2">Aucune demande en attente</p>
                    <p className="text-gray-500">Vous n'avez pas de demandes de réservation en attente pour le moment.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Logement</TableHead>
                        <TableHead>Demandeur</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Reçue le</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.properties.name}
                          </TableCell>
                          <TableCell>
                            {request.profiles.first_name} {request.profiles.last_name}
                            <div className="text-xs text-gray-500">{request.profiles.email}</div>
                          </TableCell>
                          <TableCell>
                            <span className="whitespace-nowrap">
                              {formatDate(request.start_date)} - {formatDate(request.end_date)}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(request.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-100 border-green-200 hover:bg-green-200 gap-1"
                                onClick={() => handleAccept(request)}
                              >
                                <Check className="h-4 w-4" />
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-100 border-red-200 hover:bg-red-200 gap-1"
                                onClick={() => handleReject(request)}
                              >
                                <X className="h-4 w-4" />
                                Refuser
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="accepted" className="mt-6">
              {acceptedRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium mb-2">Aucune demande acceptée</p>
                    <p className="text-gray-500">Vous n'avez pas encore accepté de demandes de réservation.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Logement</TableHead>
                        <TableHead>Demandeur</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date de réponse</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {acceptedRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.properties.name}
                          </TableCell>
                          <TableCell>
                            {request.profiles.first_name} {request.profiles.last_name}
                            <div className="text-xs text-gray-500">{request.profiles.email}</div>
                          </TableCell>
                          <TableCell>
                            <span className="whitespace-nowrap">
                              {formatDate(request.start_date)} - {formatDate(request.end_date)}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>{formatDate(request.updated_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-6">
              {rejectedRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium mb-2">Aucune demande refusée</p>
                    <p className="text-gray-500">Vous n'avez pas encore refusé de demandes de réservation.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Logement</TableHead>
                        <TableHead>Demandeur</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date de réponse</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectedRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.properties.name}
                          </TableCell>
                          <TableCell>
                            {request.profiles.first_name} {request.profiles.last_name}
                            <div className="text-xs text-gray-500">{request.profiles.email}</div>
                          </TableCell>
                          <TableCell>
                            <span className="whitespace-nowrap">
                              {formatDate(request.start_date)} - {formatDate(request.end_date)}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>{formatDate(request.updated_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
      
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "accept" 
                ? "Accepter cette demande de réservation ?" 
                : "Refuser cette demande de réservation ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "accept" 
                ? "En acceptant cette demande, les dates sélectionnées seront marquées comme réservées et ne seront plus disponibles pour d'autres clients."
                : "Le client sera informé que sa demande a été refusée."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction(actionType!)}
              disabled={actionLoading}
              className={actionType === "accept" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : actionType === "accept" ? (
                "Confirmer l'acceptation"
              ) : (
                "Confirmer le refus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
