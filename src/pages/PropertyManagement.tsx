import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { uploadFiles, removeFiles } from "@/lib/upload";
import { createStoragePolicies } from "@/lib/supabase";
import PropertyCard from "@/components/property/PropertyCard";
import PropertyDialog from "@/components/property/PropertyDialog";
import LoadingState from "@/components/property/LoadingState";
import ErrorState from "@/components/property/ErrorState";
import EmptyPropertyList from "@/components/property/EmptyPropertyList";
import { Property, Wilaya, Commune } from "@/components/property/PropertyForm";

const STORAGE_BUCKET = "guesthouse-images";

const PropertyManagement = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchProperties();
    fetchWilayasAndCommunes();
    checkStorageBucket();
  }, [user]);
  
  const checkStorageBucket = async () => {
    try {
      console.log("Checking if storage bucket exists:", STORAGE_BUCKET);
      await createStoragePolicies(STORAGE_BUCKET);
    } catch (err: any) {
      console.error("Error checking/creating storage bucket:", err);
      toast.error(`Error with storage: ${err.message}`);
    }
  };
  
  const fetchProperties = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
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
      const { data: wilayaData, error: wilayaError } = await supabase
        .from("wilayas")
        .select("*")
        .order("name");
      
      if (wilayaError) throw wilayaError;
      setWilayas(wilayaData || []);
      
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
    
    const form = e.target as HTMLFormElement;
    
    const name = form.querySelector<HTMLInputElement>('#property-name')?.value;
    const description = form.querySelector<HTMLTextAreaElement>('#property-description')?.value || '';
    const price = form.querySelector<HTMLInputElement>('#property-price')?.value;
    const capacity = form.querySelector<HTMLInputElement>('#property-capacity')?.value;
    
    const selectElements = form.querySelectorAll('select');
    let selectedWilaya = '';
    let selectedCommune = '';
    
    selectElements.forEach(select => {
      const label = select.closest('.space-y-2')?.querySelector('label');
      if (label?.textContent?.includes('Wilaya')) {
        selectedWilaya = select.value;
      } else if (label?.textContent?.includes('Commune')) {
        selectedCommune = select.value;
      }
    });
    
    console.log("Form values:", { name, price, capacity, selectedWilaya, selectedCommune });
    
    if (!name || !price || !capacity || !selectedWilaya || !selectedCommune) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setIsUploading(true);
      
      const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
      const uploadedFiles: File[] = [];
      
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
          uploadedFiles.push(fileInput.files[i]);
        }
      }
      
      const existingImages = editingProperty?.images || [];
      
      let allImages = [...existingImages];
      
      if (uploadedFiles.length > 0) {
        console.log("Uploading files to bucket:", STORAGE_BUCKET);
        console.log("Files to upload:", uploadedFiles);
        
        await checkStorageBucket();
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("Session expired, please log in again");
        }
        
        const uploadedImageUrls = await uploadFiles(uploadedFiles, STORAGE_BUCKET, user.id);
        console.log("Uploaded image URLs:", uploadedImageUrls);
        
        const validUrls = uploadedImageUrls.filter(url => url && url.startsWith('http'));
        if (validUrls.length !== uploadedImageUrls.length) {
          console.error("Some URLs are invalid:", uploadedImageUrls);
          toast.error("Certaines images n'ont pas pu être téléchargées correctement");
        }
        
        allImages = [...allImages, ...validUrls];
      }
      
      setIsUploading(false);
      
      const propertyData = {
        name,
        description,
        price: parseFloat(price),
        capacity: parseInt(capacity),
        wilaya_id: parseInt(selectedWilaya),
        commune_id: parseInt(selectedCommune),
        owner_id: user.id,
        images: allImages.length > 0 ? allImages : null
      };
      
      console.log("Saving property data:", propertyData);
      
      let result;
      
      if (editingProperty) {
        result = await supabase
          .from("guesthouses")
          .update(propertyData)
          .eq("id", editingProperty.id)
          .eq("owner_id", user.id);
        
        if (result.error) throw result.error;
        toast.success("Logement mis à jour avec succès");
      } else {
        result = await supabase
          .from("guesthouses")
          .insert(propertyData);
        
        if (result.error) throw result.error;
        toast.success("Logement créé avec succès");
      }
      
      fetchProperties();
      setEditingProperty(null);
      setDialogOpen(false);
    } catch (err: any) {
      console.error("Error saving property:", err);
      toast.error(`Erreur lors de l'enregistrement: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!user) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce logement ?")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      handleDeleteAsync(id);
    } catch (err: any) {
      console.error("Error deleting property:", err);
      toast.error(`Erreur lors de la suppression: ${err.message}`);
      setIsDeleting(false);
    }
  };
  
  async function handleDeleteAsync(id: string) {
    try {
      const { data: property, error: getError } = await supabase
        .from("guesthouses")
        .select("images")
        .eq("id", id)
        .eq("owner_id", user?.id || '')
        .single();
      
      if (getError) throw getError;
      
      const { error } = await supabase
        .from("guesthouses")
        .delete()
        .eq("id", id)
        .eq("owner_id", user?.id || '');
      
      if (error) throw error;
      
      if (property && property.images && property.images.length > 0) {
        await removeFiles(property.images, STORAGE_BUCKET);
      }
      
      toast.success("Logement supprimé avec succès");
      
      fetchProperties();
    } catch (err: any) {
      console.error("Error in handleDeleteAsync:", err);
      toast.error(`Erreur lors de la suppression: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  }
  
  const handleRemoveImage = async (url: string) => {
    try {
      if (editingProperty) {
        const updatedImages = (editingProperty.images || []).filter(img => img !== url);
        
        const { error } = await supabase
          .from("guesthouses")
          .update({ images: updatedImages.length > 0 ? updatedImages : null })
          .eq("id", editingProperty.id)
          .eq("owner_id", user?.id || '');
        
        if (error) throw error;
        
        setEditingProperty({
          ...editingProperty,
          images: updatedImages.length > 0 ? updatedImages : null
        });
      }
      
      await removeFiles([url], STORAGE_BUCKET);
    } catch (err: any) {
      console.error("Error removing image:", err);
      toast.error(`Erreur lors de la suppression de l'image: ${err.message}`);
    }
  };
  
  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setDialogOpen(true);
  };
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion des logements</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProperty(null)}>
                <PlusCircle className="h-4 w-4 mr-2" /> Ajouter un logement
              </Button>
            </DialogTrigger>
            <PropertyDialog
              editingProperty={editingProperty}
              wilayas={wilayas}
              communes={communes}
              isSubmitting={isSubmitting}
              isUploading={isUploading}
              onSubmit={handleSubmit}
              onRemoveImage={handleRemoveImage}
            />
          </Dialog>
        </div>
        
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchProperties} />
        ) : properties.length === 0 ? (
          <EmptyPropertyList
            wilayas={wilayas}
            communes={communes}
            isSubmitting={isSubmitting}
            isUploading={isUploading}
            onSubmit={handleSubmit}
            onRemoveImage={handleRemoveImage}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                wilayas={wilayas}
                communes={communes}
                onEdit={handleEditProperty}
                onDelete={handleDelete}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyManagement;
