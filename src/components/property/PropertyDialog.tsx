
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PropertyForm from "./PropertyForm";
import { Property, Wilaya, Commune } from "./PropertyForm";

interface PropertyDialogProps {
  editingProperty: Property | null;
  wilayas: Wilaya[];
  communes: Commune[];
  isSubmitting: boolean;
  isUploading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onRemoveImage: (url: string) => Promise<void>;
}

const PropertyDialog = ({
  editingProperty,
  wilayas,
  communes,
  isSubmitting,
  isUploading,
  onSubmit,
  onRemoveImage
}: PropertyDialogProps) => {
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{editingProperty ? "Modifier le logement" : "Ajouter un logement"}</DialogTitle>
      </DialogHeader>
      <PropertyForm
        property={editingProperty || undefined}
        wilayas={wilayas}
        communes={communes}
        isSubmitting={isSubmitting}
        isUploading={isUploading}
        onSubmit={onSubmit}
        onRemoveImage={onRemoveImage}
      />
    </DialogContent>
  );
};

export default PropertyDialog;
