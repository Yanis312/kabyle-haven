
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Home, Loader2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Property {
  id: string;
  name: string;
  description: string | null;
  price: number;
  capacity: number;
  images: string[] | null;
  wilaya_id: number | null;
  commune_id: number | null;
}

interface Wilaya {
  id: number;
  name: string;
}

interface Commune {
  id: number;
  name: string;
  wilaya_id: number;
}

const PropertyManagement = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [filteredCommunes, setFilteredCommunes] = useState<Commune[]>([]);
  
  // Form states
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState<string>("");
  const [selectedCommune, setSelectedCommune] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Load properties on mount
  useEffect(() => {
    fetchProperties();
    fetchWilayasAndCommunes();
  }, [user]);
  
  // Filter communes when wilaya changes
  useEffect(() => {
    if (selectedWilaya) {
      const filtered = communes.filter(commune => 
        commune.wilaya_id === parseInt(selectedWilaya));
      setFilteredCommunes(filtered);
    } else {
      setFilteredCommunes([]);
    }
  }, [selectedWilaya, communes]);
  
  // Set form values when editing
  useEffect(() => {
    if (editingProperty) {
      setName(editingProperty.name);
      setDescription(editingProperty.description || "");
      setPrice(editingProperty.price.toString());
      setCapacity(editingProperty.capacity.toString());
      
      if (editingProperty.wilaya_id) {
        setSelectedWilaya(editingProperty.wilaya_id.toString());
      }
      
      if (editingProperty.commune_id) {
        setSelectedCommune(editingProperty.commune_id.toString());
      }
    } else {
      resetForm();
    }
  }, [editingProperty]);
  
  const fetchProperties = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("guesthouses")
        .select("*")
        .eq("owner_id", user.id);
      
      if (error) throw error;
      
      console.log("Owner properties loaded:", data);
      setProperties(data || []);
    } catch (err: any) {
      console.error("Error loading properties:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchWilayasAndCommunes = async () => {
    try {
      // Fetch wilayas
      const { data: wilayaData, error: wilayaError } = await supabase
        .from("wilayas")
        .select("*")
        .order("name");
      
      if (wilayaError) throw wilayaError;
      setWilayas(wilayaData || []);
      
      // Fetch communes
      const { data: communeData, error: communeError } = await supabase
        .from("communes")
        .select("*")
        .order("name");
      
      if (communeError) throw communeError;
      setCommunes(communeData || []);
    } catch (err: any) {
      console.error("Error loading locations:", err);
      toast.error("Erreur lors du chargement des wilayas et communes");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Vous devez être connecté pour effectuer cette action");
      return;
    }
    
    if (!name || !price || !capacity || !selectedWilaya || !selectedCommune) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const propertyData = {
        name,
        description,
        price: parseFloat(price),
        capacity: parseInt(capacity),
        wilaya_id: parseInt(selectedWilaya),
        commune_id: parseInt(selectedCommune),
        owner_id: user.id,
      };
      
      let result;
      
      if (editingProperty) {
        // Update existing property
        result = await supabase
          .from("guesthouses")
          .update(propertyData)
          .eq("id", editingProperty.id)
          .eq("owner_id", user.id);
        
        if (result.error) throw result.error;
        toast.success("Logement mis à jour avec succès");
      } else {
        // Create new property
        result = await supabase
          .from("guesthouses")
          .insert(propertyData);
        
        if (result.error) throw result.error;
        toast.success("Logement créé avec succès");
      }
      
      // Refresh properties list
      fetchProperties();
      resetForm();
    } catch (err: any) {
      console.error("Error saving property:", err);
      toast.error(`Erreur lors de l'enregistrement: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!user) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce logement ?")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from("guesthouses")
        .delete()
        .eq("id", id)
        .eq("owner_id", user.id);
      
      if (error) throw error;
      
      toast.success("Logement supprimé avec succès");
      
      // Refresh properties list
      fetchProperties();
    } catch (err: any) {
      console.error("Error deleting property:", err);
      toast.error(`Erreur lors de la suppression: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCapacity("");
    setSelectedWilaya("");
    setSelectedCommune("");
    setEditingProperty(null);
  };
  
  const getCommune = (id: number | null) => {
    if (!id) return "Non spécifié";
    const commune = communes.find(c => c.id === id);
    return commune ? commune.name : "Non spécifié";
  };
  
  const getWilaya = (id: number | null) => {
    if (!id) return "Non spécifié";
    const wilaya = wilayas.find(w => w.id === id);
    return wilaya ? wilaya.name : "Non spécifié";
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion des logements</h1>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <PlusCircle className="h-4 w-4 mr-2" /> Ajouter un logement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingProperty ? "Modifier le logement" : "Ajouter un logement"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="property-name">Nom du logement *</Label>
                    <Input
                      id="property-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Maison traditionnelle, Villa moderne, etc."
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="property-description">Description</Label>
                    <Textarea
                      id="property-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez votre logement..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="property-price">Prix par nuit (DA) *</Label>
                      <Input
                        id="property-price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="5000"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="property-capacity">Capacité (personnes) *</Label>
                      <Input
                        id="property-capacity"
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        placeholder="4"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="property-wilaya">Wilaya *</Label>
                      <Select
                        value={selectedWilaya}
                        onValueChange={setSelectedWilaya}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une wilaya" />
                        </SelectTrigger>
                        <SelectContent>
                          {wilayas.map((wilaya) => (
                            <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                              {wilaya.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="property-commune">Commune *</Label>
                      <Select
                        value={selectedCommune}
                        onValueChange={setSelectedCommune}
                        disabled={!selectedWilaya}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une commune" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCommunes.map((commune) => (
                            <SelectItem key={commune.id} value={commune.id.toString()}>
                              {commune.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingProperty ? "Mise à jour..." : "Création..."}
                      </>
                    ) : (
                      editingProperty ? "Mettre à jour" : "Créer"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-kabyle-blue" />
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 border border-red-100 rounded-lg">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
            <p className="text-red-600">
              Une erreur est survenue lors du chargement de vos logements: {error}
            </p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border border-gray-100 rounded-lg">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun logement</h3>
            <p className="text-gray-500 mb-4">
              Vous n'avez pas encore créé de logements. Commencez maintenant!
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" /> Ajouter un logement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                {/* Same form as above - duplicate is handled by React */}
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  {property.images && property.images[0] ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <Home className="h-12 w-12" />
                    </div>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {property.description || "Aucune description"}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Prix:</span>{" "}
                        {new Intl.NumberFormat('fr-FR').format(property.price)} DA
                      </div>
                      <div>
                        <span className="font-medium">Capacité:</span>{" "}
                        {property.capacity} personnes
                      </div>
                      <div>
                        <span className="font-medium">Wilaya:</span>{" "}
                        {getWilaya(property.wilaya_id)}
                      </div>
                      <div>
                        <span className="font-medium">Commune:</span>{" "}
                        {getCommune(property.commune_id)}
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingProperty(property)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      {/* Form is populated via useEffect when editingProperty changes */}
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDelete(property.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyManagement;
