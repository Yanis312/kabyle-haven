
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { User, PenLine, Home, Calendar, MapPin, Star } from "lucide-react";

// Mock data for the user profile
const mockUser = {
  id: "user-1",
  name: "Amar Meziane",
  email: "amar.meziane@example.com",
  avatar: "",
  bio: "Passionné de culture kabyle et de voyages. J'aime découvrir de nouveaux endroits en Kabylie et partager mes expériences.",
  phone: "+213 555 123 456",
  location: "Tizi Ouzou, Kabylie"
};

// Mock data for reservations
const mockReservations = [
  {
    id: "res-1",
    propertyId: "prop-1",
    propertyName: "Maison traditionnelle à Azazga",
    location: "Azazga, Tizi Ouzou",
    checkIn: "2023-10-15",
    checkOut: "2023-10-20",
    price: 25000,
    status: "Complété",
    rating: 5
  },
  {
    id: "res-2",
    propertyId: "prop-2",
    propertyName: "Villa avec vue sur Djurdjura",
    location: "Tikjda, Bouira",
    checkIn: "2023-12-24",
    checkOut: "2023-12-30",
    price: 35000,
    status: "Complété",
    rating: 4
  },
  {
    id: "res-3",
    propertyId: "prop-3",
    propertyName: "Appartement au centre de Béjaïa",
    location: "Béjaïa",
    checkIn: "2024-05-10",
    checkOut: "2024-05-15",
    price: 20000,
    status: "À venir",
    rating: null
  }
];

const UserProfile = () => {
  const [user, setUser] = useState(mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  const handleSaveProfile = () => {
    setUser(editedUser);
    setIsEditing(false);
    toast.success("Profil mis à jour avec succès");
  };
  
  const handleCancelEdit = () => {
    setEditedUser(user);
    setIsEditing(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-kabyle-blue text-white text-2xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription className="flex justify-center items-center gap-2">
                <MapPin className="h-4 w-4 text-kabyle-terracotta" /> {user.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Bio</p>
                <p className="text-sm">{user.bio}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="text-sm">{user.phone}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setIsEditing(true)}
              >
                <PenLine className="mr-2 h-4 w-4" /> Modifier le profil
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-6">
            <Link to="/host">
              <Button className="w-full bg-kabyle-terracotta hover:bg-kabyle-terracotta/90">
                <Home className="mr-2 h-4 w-4" /> Devenir hôte
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Modifier votre profil</CardTitle>
                <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input 
                      id="name" 
                      value={editedUser.name}
                      onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input 
                      id="phone" 
                      value={editedUser.phone}
                      onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <Input 
                      id="location" 
                      value={editedUser.location}
                      onChange={(e) => setEditedUser({...editedUser, location: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea 
                    id="bio" 
                    rows={4} 
                    value={editedUser.bio}
                    onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatar">Photo de profil</Label>
                  <Input id="avatar" type="file" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelEdit}>Annuler</Button>
                <Button onClick={handleSaveProfile}>Enregistrer</Button>
              </CardFooter>
            </Card>
          ) : (
            <Tabs defaultValue="reservations">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="reservations" className="flex-1">
                  <Calendar className="mr-2 h-4 w-4" /> Réservations
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">
                  <Star className="mr-2 h-4 w-4" /> Avis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="reservations" className="space-y-6">
                <h2 className="text-2xl font-bold">Historique des réservations</h2>
                
                {mockReservations.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Logement</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockReservations.map((reservation) => (
                          <TableRow key={reservation.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{reservation.propertyName}</div>
                                <div className="text-sm text-gray-500">{reservation.location}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{formatDate(reservation.checkIn)}</div>
                                <div>au</div>
                                <div>{formatDate(reservation.checkOut)}</div>
                              </div>
                            </TableCell>
                            <TableCell>{reservation.price.toLocaleString('fr-FR')} DA</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                ${reservation.status === 'À venir' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`
                              }>
                                {reservation.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Link to={`/property/${reservation.propertyId}`}>
                                <Button variant="outline" size="sm">Voir détails</Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-md">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune réservation</h3>
                    <p className="text-gray-500 mb-4">Vous n'avez pas encore effectué de réservation.</p>
                    <Link to="/">
                      <Button>Découvrir des logements</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-6">
                <h2 className="text-2xl font-bold">Vos avis</h2>
                
                <div className="text-center py-12 border rounded-md">
                  <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun avis</h3>
                  <p className="text-gray-500 mb-4">Vous n'avez pas encore laissé d'avis sur vos séjours.</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
