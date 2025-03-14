
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
  
  // Join data
  guesthouses: {
    name: string;
    commune_id: number;
  };
  communes: {
    name: string;
    wilaya_id: number;
  };
  wilayas: {
    name: string;
  };
}

export default function BookingRequestsPage() {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
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
            guesthouses!inner(name, commune_id),
            communes:guesthouses.commune_id(name, wilaya_id),
            wilayas:communes.wilaya_id(name)
          `)
          .eq("requester_id", user.id)
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6">Mes demandes de réservation</h1>
          
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
                        <p className="text-gray-500 mb-4">Vous n'avez pas de demandes de réservation en attente pour le moment.</p>
                        <Link to="/">
                          <Button>Découvrir des logements</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Logement</TableHead>
                            <TableHead>Lieu</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">
                                {request.guesthouses.name}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1 text-kabyle-terracotta" />
                                  <span>
                                    {request.communes?.name}, {request.wilayas?.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="whitespace-nowrap">
                                  {formatDate(request.start_date)} - {formatDate(request.end_date)}
                                </span>
                              </TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell>
                                <Link to={`/property/${request.property_id}`}>
                                  <Button size="sm" variant="outline">
                                    Voir le logement
                                  </Button>
                                </Link>
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
                        <p className="text-gray-500">Vous n'avez pas encore reçu de confirmation de réservation.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Logement</TableHead>
                            <TableHead>Lieu</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {acceptedRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">
                                {request.guesthouses.name}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1 text-kabyle-terracotta" />
                                  <span>
                                    {request.communes?.name}, {request.wilayas?.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="whitespace-nowrap">
                                  {formatDate(request.start_date)} - {formatDate(request.end_date)}
                                </span>
                              </TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell>
                                <Link to={`/property/${request.property_id}`}>
                                  <Button size="sm" variant="outline">
                                    Voir le logement
                                  </Button>
                                </Link>
                              </TableCell>
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
                        <p className="text-gray-500">Vous n'avez pas de demandes de réservation refusées.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Logement</TableHead>
                            <TableHead>Lieu</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rejectedRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">
                                {request.guesthouses.name}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1 text-kabyle-terracotta" />
                                  <span>
                                    {request.communes?.name}, {request.wilayas?.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="whitespace-nowrap">
                                  {formatDate(request.start_date)} - {formatDate(request.end_date)}
                                </span>
                              </TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell>
                                <Link to={`/property/${request.property_id}`}>
                                  <Button size="sm" variant="outline">
                                    Voir le logement
                                  </Button>
                                </Link>
                              </TableCell>
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
