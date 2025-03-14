
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle } from "lucide-react";

interface HostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HostDialog: React.FC<HostDialogProps> = ({ open, onOpenChange }) => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleBecomeHost = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour devenir hôte");
      return;
    }

    try {
      // Mettre à jour le profil de l'utilisateur pour le rôle propriétaire
      await updateProfile({ role: "proprietaire" });
      
      toast.success("Vous êtes maintenant un hôte! Vous pouvez ajouter des logements.");
      
      // Rediriger vers la page de gestion des propriétés
      navigate("/property-management");
      
      // Fermer le dialogue
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erreur lors du changement de rôle:", error);
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Devenir hôte</DialogTitle>
          <DialogDescription>
            Partagez votre espace traditionnel et gagnez un revenu supplémentaire.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-primary/10 p-6">
              <Home className="h-12 w-12 text-primary" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="font-medium">Partagez votre logement traditionnel</h3>
              <p className="text-sm text-muted-foreground">
                Vous avez un logement traditionnel que vous souhaitez partager? Devenez hôte et commencez à gagner un revenu supplémentaire.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleBecomeHost}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Devenir hôte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HostDialog;
