export interface Property {
  id: string;
  title: string;
  location: {
    village: string;
    wilaya: string;
  };
  images: string[];
  price: number;
  rating: number;
  reviewCount: number;
  features: string[];
  description: string;
  host: {
    name: string;
    avatar: string;
    languages: string[];
  };
  amenities: string[];
  availability: {
    startDate: string;
    endDate: string;
  };
  cultural_offerings: string[];
  created_at?: string;
  updated_at?: string;
  status?: string;
}

const properties: Property[] = [
  {
    id: "1",
    title: "Maison Traditionnelle avec Vue sur le Djurdjura",
    location: {
      village: "Ath Yenni",
      wilaya: "Tizi Ouzou"
    },
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608226081278-be8bad14270e?q=80&w=1374&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=1470&auto=format&fit=crop"
    ],
    price: 75,
    rating: 4.9,
    reviewCount: 128,
    features: ["Vue montagne", "Maison traditionnelle", "Artisanat local"],
    description: "Charmante maison traditionnelle kabyle nichée au cœur du village historique d'Ath Yenni. Profitez d'une vue imprenable sur les montagnes du Djurdjura depuis la terrasse. Décoration authentique avec poteries et bijoux d'argent traditionnels.",
    host: {
      name: "Idir",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1374&auto=format&fit=crop",
      languages: ["Kabyle", "Français", "Anglais"]
    },
    amenities: ["Wifi", "Cuisine équipée", "Terrasse", "Chauffage", "Parking"],
    availability: {
      startDate: "2023-06-01",
      endDate: "2023-09-30"
    },
    cultural_offerings: ["Repas traditionnel", "Atelier bijoux", "Guide local"],
    created_at: "2023-01-01T00:00:00Z",
    status: "available"
  },
  {
    id: "2",
    title: "Villa Moderne avec Jardin d'Oliviers",
    location: {
      village: "Tizi Ouzou",
      wilaya: "Tizi Ouzou"
    },
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1380&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1470&auto=format&fit=crop"
    ],
    price: 120,
    rating: 4.8,
    reviewCount: 64,
    features: ["Jardin d'oliviers", "Architecture moderne", "Près du centre-ville"],
    description: "Villa spacieuse située aux abords de Tizi Ouzou, entourée d'un jardin d'oliviers centenaires. Alliance parfaite entre confort moderne et caractère traditionnel kabyle. Idéal pour les familles souhaitant découvrir la région.",
    host: {
      name: "Kahina",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1376&auto=format&fit=crop",
      languages: ["Kabyle", "Français", "Arabe"]
    },
    amenities: ["Wifi", "Piscine", "Cuisine équipée", "Climatisation", "Barbecue", "Parking"],
    availability: {
      startDate: "2023-05-01",
      endDate: "2023-10-31"
    },
    cultural_offerings: ["Dégustation huile d'olive", "Repas traditionnel"]
  },
  {
    id: "3",
    title: "Cabane Rustique près des Sentiers de Randonnée",
    location: {
      village: "Tikjda",
      wilaya: "Bouira"
    },
    images: [
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595877244574-e90ce41ce089?q=80&w=1374&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484301548518-d0e0a5db0fc8?q=80&w=1470&auto=format&fit=crop"
    ],
    price: 60,
    rating: 4.7,
    reviewCount: 43,
    features: ["Accès randonnées", "Authenticité", "Nature préservée"],
    description: "Cabane rustique au cœur du Parc National de Tikjda, point de départ idéal pour les amateurs de randonnée. Construction en pierre et bois local, offrant une expérience authentique en pleine nature. Vue exceptionnelle sur les sommets environnants.",
    host: {
      name: "Arezki",
      avatar: "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?q=80&w=1374&auto=format&fit=crop",
      languages: ["Kabyle", "Français"]
    },
    amenities: ["Cheminée", "Eau chaude solaire", "Équipement randonnée", "Coin lecture"],
    availability: {
      startDate: "2023-04-15",
      endDate: "2023-11-15"
    },
    cultural_offerings: ["Guide de montagne", "Bivouac traditionnel"]
  },
  {
    id: "4",
    title: "Appartement au Cœur d'Akbou",
    location: {
      village: "Akbou",
      wilaya: "Béjaïa"
    },
    images: [
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c0382?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598928636135-d146006ff4be?q=80&w=1470&auto=format&fit=crop"
    ],
    price: 45,
    rating: 4.5,
    reviewCount: 37,
    features: ["Urbain", "Marché local", "Transports"],
    description: "Appartement lumineux situé en plein centre d'Akbou, à proximité des commerces, restaurants et du célèbre marché hebdomadaire. Parfait pour découvrir la vie urbaine kabyle et les traditions commerciales de la région.",
    host: {
      name: "Lydia",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=1374&auto=format&fit=crop",
      languages: ["Kabyle", "Français", "Anglais", "Arabe"]
    },
    amenities: ["Wifi", "TV", "Machine à laver", "Cuisine équipée", "Air conditionné"],
    availability: {
      startDate: "2023-01-01",
      endDate: "2023-12-31"
    },
    cultural_offerings: ["Visite guidée du marché", "Atelier cuisine"]
  },
  {
    id: "5",
    title: "Maison d'Artiste avec Atelier de Poterie",
    location: {
      village: "Maatkas",
      wilaya: "Tizi Ouzou"
    },
    images: [
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?q=80&w=1470&auto=format&fit=crop"
    ],
    price: 90,
    rating: 4.9,
    reviewCount: 52,
    features: ["Atelier d'artisanat", "Maison d'artiste", "Vue panoramique"],
    description: "Maison unique appartenant à une famille de potiers traditionnels kabyles. Comprend un atelier où vous pourrez vous initier à cet art ancestral. Décoration entièrement réalisée avec des pièces artisanales locales.",
    host: {
      name: "Zohra",
      avatar: "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?q=80&w=1476&auto=format&fit=crop",
      languages: ["Kabyle", "Français"]
    },
    amenities: ["Atelier poterie", "Terrasse panoramique", "Bibliothèque d'art", "Wifi", "Parking"],
    availability: {
      startDate: "2023-03-01",
      endDate: "2023-11-30"
    },
    cultural_offerings: ["Atelier poterie", "Cours de peinture berbère", "Rencontre avec artistes locaux"]
  },
  {
    id: "6",
    title: "Gîte Rural avec Ferme Pédagogique",
    location: {
      village: "Boghni",
      wilaya: "Tizi Ouzou"
    },
    images: [
      "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523459178261-62c789cd3338?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516681200295-a31e922b3e9f?q=80&w=1470&auto=format&fit=crop"
    ],
    price: 80,
    rating: 4.8,
    reviewCount: 74,
    features: ["Ferme", "Activités pour enfants", "Produits locaux"],
    description: "Gîte rural au cœur d'une ferme traditionnelle kabyle en activité. Idéal pour les familles, avec nombreuses activités pédagogiques autour de l'agriculture et l'élevage traditionnels. Produits frais disponibles directement de la ferme.",
    host: {
      name: "Mohand",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1470&auto=format&fit=crop",
      languages: ["Kabyle", "Français", "Arabe"]
    },
    amenities: ["Animaux de ferme", "Jardin potager", "Aire de jeux", "Barbecue", "Parking"],
    availability: {
      startDate: "2023-04-01",
      endDate: "2023-10-31"
    },
    cultural_offerings: ["Fabrication de fromage", "Récolte fruits et légumes", "Cuisine à la ferme"]
  }
];

export default properties;
