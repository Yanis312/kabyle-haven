
import { Home, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import PropertyDialog from "./PropertyDialog";
import { Wilaya, Commune } from "./PropertyForm";

interface EmptyPropertyListProps {
  wilayas: Wilaya[];
  communes: Commune[];
  isSubmitting: boolean;
  isUploading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onRemoveImage: (url: string) => Promise<void>;
}

const EmptyPropertyList = ({
  wilayas,
  communes,
  isSubmitting,
  isUploading,
  onSubmit,
  onRemoveImage
}: EmptyPropertyListProps) => {
  return (
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
        <PropertyDialog
          editingProperty={null}
          wilayas={wilayas}
          communes={communes}
          isSubmitting={isSubmitting}
          isUploading={isUploading}
          onSubmit={onSubmit}
          onRemoveImage={onRemoveImage}
        />
      </Dialog>
    </div>
  );
};

export default EmptyPropertyList;
