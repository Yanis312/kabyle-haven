
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "@/data/properties";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, CheckCircle, BellRing, Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingRequestFormProps {
  property: Property;
}

export default function BookingRequestForm({ property }: BookingRequestFormProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Helper function to safely parse dates
  const safelyParseDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    try {
      return new Date(dateValue);
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  // Check if property has availability data
  const hasAvailability = () => {
    if (!property.availability) return false;
    
    // If it's a JSON object from Supabase with start_date
    if (typeof property.availability === 'object' && 'start_date' in property.availability) {
      return Boolean(property.availability.start_date) && Boolean(property.availability.start_date);
    }
    
    // Original format
    return Boolean(property.availability.startDate) && Boolean(property.availability.endDate);
  };

  // Get available date range for the calendar
  const getAvailableDateRange = () => {
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    if (property.availability) {
      if (typeof property.availability === 'object' && 'start_date' in property.availability) {
        startDate = safelyParseDate(property.availability.start_date);
        // For Supabase format, let's handle the case when endDate is not explicitly defined
        if ('end_date' in property.availability) {
          endDate = safelyParseDate(property.availability.end_date);
        } else if (property.availability.endDate) {
          endDate = safelyParseDate(property.availability.endDate);
        }
      } else {
        startDate = safelyParseDate(property.availability.startDate);
        endDate = safelyParseDate(property.availability.endDate);
      }
    }
    
    return { startDate, endDate };
  };

  const { startDate: availableStartDate, endDate: availableEndDate } = getAvailableDateRange();

  // Generate selectable date ranges based on availability
  const generateDateRanges = () => {
    if (!availableStartDate || !availableEndDate) return [];
    
    const ranges = [];
    const startDate = new Date(availableStartDate);
    const endDate = new Date(availableEndDate);
    
    // For simplicity, let's offer weekly and full period options
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Full period
    ranges.push({
      label: `Toute la période disponible (${format(startDate, "d MMM", { locale: fr })} - ${format(endDate, "d MMM", { locale: fr })})`,
      start: startDate,
      end: endDate
    });
    
    // First week
    const firstWeekEnd = new Date(startDate.getTime() + (6 * oneDay));
    if (firstWeekEnd < endDate) {
      ranges.push({
        label: `Première semaine (${format(startDate, "d MMM", { locale: fr })} - ${format(firstWeekEnd, "d MMM", { locale: fr })})`,
        start: startDate,
        end: firstWeekEnd
      });
    }
    
    // Middle two weeks (if available)
    const middleStart = new Date(startDate.getTime() + (7 * oneDay));
    const middleEnd = new Date(middleStart.getTime() + (13 * oneDay));
    if (middleEnd < endDate) {
      ranges.push({
        label: `Deux semaines (${format(middleStart, "d MMM", { locale: fr })} - ${format(middleEnd, "d MMM", { locale: fr })})`,
        start: middleStart,
        end: middleEnd
      });
    }
    
    // Last week
    const lastWeekStart = new Date(endDate.getTime() - (6 * oneDay));
    if (lastWeekStart > startDate) {
      ranges.push({
        label: `Dernière semaine (${format(lastWeekStart, "d MMM", { locale: fr })} - ${format(endDate, "d MMM", { locale: fr })})`,
        start: lastWeekStart,
        end: endDate
      });
    }
    
    return ranges;
  };

  const handleDateRangeSelect = (value: string) => {
    const ranges = generateDateRanges();
    const selectedRange = ranges.find(range => range.label === value);
    
    if (selectedRange) {
      setDateRange({
        from: selectedRange.start,
        to: selectedRange.end
      });
    }
  };

  // Check if dates are available
  const areDatesAvailable = () => {
    if (!dateRange?.from || !dateRange?.to || !hasAvailability()) return false;
    
    let availableStart: Date;
    let availableEnd: Date;
    
    // Determine which format of availability data we have
    if (typeof property.availability === 'object' && 'start_date' in property.availability) {
      availableStart = safelyParseDate(property.availability.start_date) || new Date();
      
      // For Supabase format, let's handle the case when endDate is not explicitly defined
      if ('end_date' in property.availability) {
        availableEnd = safelyParseDate(property.availability.end_date) || new Date();
      } else if (property.availability.endDate) {
        availableEnd = safelyParseDate(property.availability.endDate) || new Date();
      } else {
        availableEnd = new Date(); // Fallback
      }
    } else if (property.availability) {
      availableStart = safelyParseDate(property.availability.startDate) || new Date();
      availableEnd = safelyParseDate(property.availability.endDate) || new Date();
    } else {
      return false;
    }
    
    return (
      !isBefore(dateRange.from, availableStart) &&
      !isAfter(dateRange.to, availableEnd)
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour effectuer une réservation");
      navigate("/auth", { state: { from: window.location.pathname } });
      return;
    }
    
    if (!dateRange?.from || !dateRange?.to) {
      setError("Veuillez sélectionner des dates de séjour");
      return;
    }
    
    if (!areDatesAvailable()) {
      setError("Ces dates ne sont pas disponibles");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Fetch owner ID from the property
      const { data: propertyData, error: propertyError } = await supabase
        .from("guesthouses")
        .select("owner_id")
        .eq("id", property.id)
        .single();
      
      if (propertyError) throw propertyError;
      if (!propertyData.owner_id) throw new Error("Information sur le propriétaire non disponible");
      
      // Create booking request
      const { error: bookingError } = await supabase
        .from("booking_requests")
        .insert({
          property_id: property.id,
          requester_id: user.id,
          owner_id: propertyData.owner_id,
          start_date: format(dateRange.from, "yyyy-MM-dd"),
          end_date: format(dateRange.to, "yyyy-MM-dd"),
          message: message,
        });
      
      if (bookingError) throw bookingError;
      
      setSuccess(true);
      toast.success("Votre demande de réservation a été envoyée avec succès");
    } catch (err: any) {
      console.error("Error submitting booking request:", err);
      setError(err.message || "Une erreur est survenue lors de l'envoi de votre demande");
      toast.error("Échec de l'envoi de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate the number of nights and total price
  const calculateNights = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    
    const startDate = startOfDay(dateRange.from);
    const endDate = startOfDay(dateRange.to);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * property.price;
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Demande de réservation</span>
          {property.price && (
            <Badge variant="outline" className="text-lg font-semibold">
              {formatCurrency(property.price)}/nuit
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Vérifiez la disponibilité et envoyez une demande au propriétaire
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAvailability() ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Indisponible</AlertTitle>
            <AlertDescription>
              Ce logement n'a pas de disponibilité indiquée. Veuillez contacter le propriétaire pour plus d'informations.
            </AlertDescription>
          </Alert>
        ) : success ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Demande envoyée</AlertTitle>
            <AlertDescription>
              <p>Votre demande de réservation a été envoyée au propriétaire. Vous recevrez une notification lorsqu'il aura répondu.</p>
              <p className="mt-2">Vous pouvez suivre l'état de votre demande dans <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/my-bookings")}>Mes réservations</Button>.</p>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Dates de séjour</label>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CalendarIcon className="mr-1 h-3 w-3" /> Disponible
                </Badge>
              </div>
              
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CalendarIcon className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Ce logement est disponible du{" "}
                  <span className="font-medium">
                    {availableStartDate ? format(availableStartDate, "d MMMM yyyy", { locale: fr }) : "?"}
                  </span>{" "}
                  au{" "}
                  <span className="font-medium">
                    {availableEndDate ? format(availableEndDate, "d MMMM yyyy", { locale: fr }) : "?"}
                  </span>
                </AlertDescription>
              </Alert>
              
              <div className="pt-2">
                <label className="text-sm font-medium">Choisissez une période</label>
                <Select onValueChange={handleDateRangeSelect}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Sélectionnez vos dates de séjour" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateDateRanges().map((range, index) => (
                      <SelectItem key={index} value={range.label}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {dateRange?.from && dateRange.to && (
              <div className="space-y-3 border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span>
                    {format(dateRange.from, "d MMM", { locale: fr })} - {format(dateRange.to, "d MMM", { locale: fr })}
                  </span>
                  <span>{calculateNights()} nuit(s)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{formatCurrency(property.price)} x {calculateNights()} nuits</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Message au propriétaire (facultatif)</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Présentez-vous et partagez la raison de votre voyage..."
                className="resize-none"
                rows={4}
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        {!success && (
          <Button 
            onClick={handleSubmit} 
            disabled={!areDatesAvailable() || !dateRange?.from || !dateRange?.to || isSubmitting}
            className="w-full bg-kabyle-terracotta hover:bg-kabyle-terracotta/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <BellRing className="mr-2 h-4 w-4" />
                Envoyer ma demande
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
