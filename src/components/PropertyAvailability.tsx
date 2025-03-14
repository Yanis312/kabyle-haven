
import { useState } from "react";
import { Property } from "@/data/properties";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle,
  CheckCircle2,
  CalendarIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface PropertyAvailabilityProps {
  property: Property;
  editable?: boolean;
  onAvailabilityChange?: (startDate: Date, endDate: Date) => void;
}

const PropertyAvailability = ({ 
  property, 
  editable = false,
  onAvailabilityChange 
}: PropertyAvailabilityProps) => {
  const [date, setDate] = useState<Date | undefined>(
    property.availability?.startDate ? 
    new Date(property.availability.startDate) : 
    undefined
  );

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: property.availability?.startDate ? new Date(property.availability.startDate) : undefined,
    to: property.availability?.endDate ? new Date(property.availability.endDate) : undefined,
  });

  const hasAvailability = property.availability && 
    property.availability.startDate && 
    property.availability.endDate;

  const handleSelect = (selectedDateRange: {
    from: Date | undefined;
    to: Date | undefined;
  }) => {
    setDateRange(selectedDateRange);
    
    if (onAvailabilityChange && selectedDateRange.from && selectedDateRange.to) {
      onAvailabilityChange(selectedDateRange.from, selectedDateRange.to);
    }
  };

  if (!hasAvailability && !editable) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center text-gray-500">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
          <p>Aucune information de disponibilité n'a été fournie pour ce logement.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {editable ? (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Définir la disponibilité</h3>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      "Sélectionner des dates"
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={new Date()}
                  selected={dateRange}
                  onSelect={handleSelect}
                  numberOfMonths={2}
                  locale={fr}
                  className={cn("p-3 pointer-events-auto rounded-md border")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {dateRange.from && dateRange.to && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-700">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                <p>Le logement sera disponible du {format(dateRange.from, "d MMMM yyyy", { locale: fr })} au {format(dateRange.to, "d MMMM yyyy", { locale: fr })}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center text-green-700 mb-4">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
            <p className="font-medium">
              Ce logement est disponible du {format(new Date(property.availability.startDate), "d MMMM yyyy", { locale: fr })} au {format(new Date(property.availability.endDate), "d MMMM yyyy", { locale: fr })}
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-center">
            <Calendar
              mode="range"
              defaultMonth={new Date(property.availability.startDate)}
              selected={{
                from: new Date(property.availability.startDate),
                to: new Date(property.availability.endDate)
              }}
              className="pointer-events-none"
              disabled={[
                {
                  before: new Date(property.availability.startDate),
                  after: new Date(property.availability.endDate)
                }
              ]}
              locale={fr}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyAvailability;
