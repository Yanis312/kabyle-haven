
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fr } from "date-fns/locale";
import { format, isAfter, startOfDay } from "date-fns";
import { toast } from "sonner";
import { CalendarRange, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "./PropertyForm";
import { DateRange } from "react-day-picker";

interface AvailabilityManagerProps {
  property: Property;
  onAvailabilityUpdated?: () => void;
}

interface AvailabilityData {
  start_date: string;
  end_date: string;
}

export default function AvailabilityManager({ property, onAvailabilityUpdated }: AvailabilityManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined
  });

  // Parse existing availability from property
  useEffect(() => {
    if (property?.availability) {
      try {
        const availabilityData = typeof property.availability === 'string' 
          ? JSON.parse(property.availability as string) as AvailabilityData 
          : property.availability as unknown as AvailabilityData;
          
        if (availabilityData?.start_date && availabilityData?.end_date) {
          setDateRange({
            from: new Date(availabilityData.start_date),
            to: new Date(availabilityData.end_date)
          });
        }
      } catch (error) {
        console.error("Error parsing availability data:", error);
      }
    }
  }, [property]);

  const handleSaveAvailability = async () => {
    if (!property?.id || !dateRange?.from || !dateRange?.to) {
      toast.error("Veuillez sélectionner une plage de dates complète");
      return;
    }
    
    if (isAfter(startOfDay(dateRange.from), startOfDay(dateRange.to))) {
      toast.error("La date de début doit être avant la date de fin");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Format the availability data
      const availabilityData = {
        start_date: format(dateRange.from, "yyyy-MM-dd"),
        end_date: format(dateRange.to, "yyyy-MM-dd")
      };
      
      // Update the property in Supabase
      const { error } = await supabase
        .from("guesthouses")
        .update({ 
          availability: availabilityData 
        })
        .eq("id", property.id);
      
      if (error) throw error;
      
      toast.success("Disponibilité mise à jour avec succès");
      if (onAvailabilityUpdated) onAvailabilityUpdated();
    } catch (error: any) {
      console.error("Error updating availability:", error);
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearAvailability = async () => {
    if (!property?.id) return;
    
    try {
      setIsLoading(true);
      
      // Clear the availability data
      const { error } = await supabase
        .from("guesthouses")
        .update({ availability: null })
        .eq("id", property.id);
      
      if (error) throw error;
      
      setDateRange({ from: undefined, to: undefined });
      toast.success("Disponibilité supprimée avec succès");
      if (onAvailabilityUpdated) onAvailabilityUpdated();
    } catch (error: any) {
      console.error("Error clearing availability:", error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gérer la disponibilité</CardTitle>
        <CardDescription>
          Définissez les périodes où votre logement est disponible à la location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-green-500 mr-1"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-gray-300 mr-1"></div>
              <span>Non disponible</span>
            </div>
          </div>

          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            defaultMonth={dateRange?.from || new Date()}
            numberOfMonths={2}
            locale={fr}
            className="border rounded-md p-3"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <div>
            {dateRange?.from && dateRange?.to && (
              <div className="text-sm">
                <span className="font-medium">Période sélectionnée:</span>{" "}
                <span className="text-green-600">
                  {format(dateRange.from, "d MMMM yyyy", { locale: fr })} - {format(dateRange.to, "d MMMM yyyy", { locale: fr })}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleClearAvailability}
            disabled={isLoading || (!dateRange?.from && !dateRange?.to)}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Effacer
          </Button>
          <Button
            onClick={handleSaveAvailability}
            disabled={isLoading || !dateRange?.from || !dateRange?.to}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
