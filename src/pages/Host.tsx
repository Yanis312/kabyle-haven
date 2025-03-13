
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, ChevronDown, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(10, {
    message: "Le titre doit contenir au moins 10 caractères.",
  }),
  description: z.string().min(50, {
    message: "La description doit contenir au moins 50 caractères.",
  }),
  village: z.string({
    required_error: "Veuillez sélectionner un village.",
  }),
  wilaya: z.string({
    required_error: "Veuillez sélectionner une wilaya.",
  }),
  price: z.number({
    required_error: "Veuillez entrer un prix par nuit.",
    invalid_type_error: "Le prix doit être un nombre.",
  }).min(1, {
    message: "Le prix doit être supérieur à 0.",
  }),
  capacity: z.number({
    required_error: "Veuillez entrer une capacité.",
    invalid_type_error: "La capacité doit être un nombre.",
  }).min(1, {
    message: "La capacité doit être au moins 1 personne.",
  }),
  images: z
    .any()
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "La taille maximum est de 5MB."
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Formats acceptés: .jpg, .jpeg, .png et .webp."
    )
    .optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  cultural_offerings: z.array(z.string()).optional(),
  availability: z.object({
    startDate: z.date({
      required_error: "Veuillez sélectionner une date de début.",
    }),
    endDate: z.date({
      required_error: "Veuillez sélectionner une date de fin.",
    }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const villages = [
  "Ath Yenni", "Tizi Ouzou", "Tikjda", "Akbou", "Maatkas", "Boghni", 
  "Tigzirt", "Azeffoun", "Larbaa Nath Irathen", "Beni Douala"
];

const wilayas = [
  "Tizi Ouzou", "Béjaïa", "Bouira", "Boumerdès", "Bordj Bou Arreridj"
];

const features = [
  { id: "traditional", label: "Maison traditionnelle" },
  { id: "mountain_view", label: "Vue montagne" },
  { id: "hiking", label: "Accès randonnées" },
  { id: "artisanat", label: "Artisanat local" },
  { id: "djurdjura", label: "Vue sur le Djurdjura" },
  { id: "garden", label: "Jardin d'oliviers" },
  { id: "modern", label: "Architecture moderne" }
];

const amenities = [
  { id: "wifi", label: "Wifi" },
  { id: "kitchen", label: "Cuisine équipée" },
  { id: "terrace", label: "Terrasse" },
  { id: "heating", label: "Chauffage" },
  { id: "parking", label: "Parking" },
  { id: "pool", label: "Piscine" },
  { id: "air_conditioning", label: "Climatisation" },
  { id: "fireplace", label: "Cheminée" }
];

const culturalOfferings = [
  { id: "traditional_meal", label: "Repas traditionnel" },
  { id: "jewelry_workshop", label: "Atelier bijoux" },
  { id: "local_guide", label: "Guide local" },
  { id: "olive_oil", label: "Dégustation huile d'olive" },
  { id: "mountain_guide", label: "Guide de montagne" },
  { id: "traditional_bivouac", label: "Bivouac traditionnel" },
  { id: "market_tour", label: "Visite guidée du marché" },
  { id: "cooking_workshop", label: "Atelier cuisine" },
  { id: "pottery", label: "Atelier poterie" },
  { id: "painting", label: "Cours de peinture berbère" }
];

export default function HostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      capacity: undefined,
      features: [],
      amenities: [],
      cultural_offerings: [],
      availability: {
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)), // Default 3 months availability
      },
    },
  });

  function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    
    // This would normally send data to your backend
    console.log("Form data:", data);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Votre logement a été ajouté avec succès !");
      navigate("/");
    }, 1500);
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Devenir hôte</h1>
          <p className="text-gray-600">
            Partagez votre logement en Kabylie et faites découvrir la culture kabyle aux voyageurs du monde entier.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Informations générales</h2>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du logement</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Maison Traditionnelle avec Vue sur le Djurdjura" {...field} />
                      </FormControl>
                      <FormDescription>
                        Donnez un titre accrocheur qui met en valeur les caractéristiques uniques de votre logement.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez votre logement, son ambiance, son environnement et ce qui le rend unique..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Détaillez les particularités de votre logement et mentionnez les éléments culturels kabyles.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="wilaya"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wilaya</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une wilaya" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wilayas.map((wilaya) => (
                              <SelectItem key={wilaya} value={wilaya}>
                                {wilaya}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Village</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un village" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {villages.map((village) => (
                              <SelectItem key={village} value={village}>
                                {village}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix par nuit (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Ex: 75"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacité (personnes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Ex: 4"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Photos du logement</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition">
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            id="image-upload"
                            onChange={(e) => onChange(e.target.files)}
                            {...field}
                          />
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <UploadCloud className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                              Glissez des photos ici ou cliquez pour télécharger
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              PNG, JPG, WEBP jusqu'à 5MB (max 5 photos)
                            </p>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Caractéristiques et équipements</h2>
                
                <FormField
                  control={form.control}
                  name="features"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Caractéristiques</FormLabel>
                        <FormDescription>
                          Sélectionnez les caractéristiques qui correspondent à votre logement.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {features.map((feature) => (
                          <FormField
                            key={feature.id}
                            control={form.control}
                            name="features"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={feature.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(feature.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), feature.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== feature.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {feature.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amenities"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Équipements</FormLabel>
                        <FormDescription>
                          Sélectionnez les équipements disponibles dans votre logement.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {amenities.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="amenities"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Expériences culturelles</h2>
                
                <FormField
                  control={form.control}
                  name="cultural_offerings"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Offres culturelles</FormLabel>
                        <FormDescription>
                          Sélectionnez les expériences culturelles que vous proposez aux voyageurs.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {culturalOfferings.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="cultural_offerings"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Disponibilité</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="availability.startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date de début</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Choisir une date</span>
                                )}
                                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date()
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availability.endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date de fin</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Choisir une date</span>
                                )}
                                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date <= form.getValues("availability.startDate") ||
                                date < new Date()
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-kabyle-terracotta hover:bg-kabyle-terracotta/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Publier votre logement"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
