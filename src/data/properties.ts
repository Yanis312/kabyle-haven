
export interface Wilaya {
  id: number;
  name: string;
  postal_code: number;
}

export interface Commune {
  id: number;
  name: string;
  wilaya_id: number;
}

export interface PropertyLocation {
  latitude: number;
  longitude: number;
  village?: string;
  wilaya?: string;
}

export interface PropertyAvailability {
  startDate: string;
  endDate: string;
}

export interface PropertyHost {
  name: string;
  avatar: string;
  languages: string[];
}

// Updated Property type with all required fields
export interface Property {
  id: string;
  name: string;
  title?: string; // For backward compatibility
  description: string;
  images: string[];
  price: number;
  capacity: number;
  wilaya_id: number;
  commune_id: number;
  commune_name?: string;
  wilaya_name?: string;
  location?: PropertyLocation;
  owner_id?: string;
  availability?: PropertyAvailability;
  rating?: number;
  features?: string[];
  reviewCount?: number;
  host?: PropertyHost;
  amenities?: string[];
  cultural_offerings?: string[];
}

export const properties: Property[] = [
  {
    id: "1",
    name: "Appartement de Luxe à Alger",
    title: "Appartement de Luxe à Alger",
    description:
      "Profitez d'un séjour luxueux dans cet appartement moderne avec vue sur la mer.",
    images: [
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
    ],
    price: 15000,
    capacity: 4,
    wilaya_id: 16,
    commune_id: 104,
    location: {
      latitude: 36.7525,
      longitude: 3.042,
      village: "Alger Centre",
      wilaya: "Alger"
    },
    availability: {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
    rating: 4.8,
    features: ["Piscine", "Salle de sport", "Parking gratuit"],
    reviewCount: 12,
    host: {
      name: "Karim",
      avatar: "https://via.placeholder.com/150",
      languages: ["Français", "Arabe", "Anglais"]
    },
    amenities: ["Wi-Fi", "Climatisation", "Cuisine équipée", "TV"],
    cultural_offerings: ["Visite guidée", "Cuisine locale"]
  },
  {
    id: "2",
    name: "Villa Traditionnelle à Oran",
    title: "Villa Traditionnelle à Oran",
    description:
      "Découvrez le charme de cette villa traditionnelle avec un grand jardin et une vue imprenable.",
    images: [
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
    ],
    price: 12000,
    capacity: 6,
    wilaya_id: 31,
    commune_id: 450,
    location: {
      latitude: 35.6911,
      longitude: -0.6314,
      village: "Oran Centre",
      wilaya: "Oran"
    },
    availability: {
      startDate: "2024-02-15",
      endDate: "2024-11-30",
    },
    rating: 4.5,
    features: ["Jardin", "Barbecue", "Climatisation"],
    reviewCount: 8,
    host: {
      name: "Amina",
      avatar: "https://via.placeholder.com/150",
      languages: ["Français", "Arabe"]
    },
    amenities: ["Wi-Fi", "Parking", "Piscine", "Terrasse"],
    cultural_offerings: ["Artisanat local", "Musique traditionnelle"]
  },
  {
    id: "3",
    name: "Appartement Moderne à Constantine",
    title: "Appartement Moderne à Constantine",
    description:
      "Séjournez dans cet appartement moderne au cœur de Constantine, à proximité des principaux sites touristiques.",
    images: [
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
    ],
    price: 10000,
    capacity: 3,
    wilaya_id: 25,
    commune_id: 300,
    location: {
      latitude: 36.365,
      longitude: 6.61472,
      village: "Constantine Centre",
      wilaya: "Constantine"
    },
    availability: {
      startDate: "2024-03-01",
      endDate: "2024-10-31",
    },
    rating: 4.2,
    features: ["Balcon", "Cuisine équipée", "WiFi gratuit"],
    reviewCount: 5,
    host: {
      name: "Sami",
      avatar: "https://via.placeholder.com/150",
      languages: ["Français", "Arabe", "Anglais"]
    },
    amenities: ["Wi-Fi", "Vue panoramique", "Ascenseur", "Sécurité"],
    cultural_offerings: ["Histoire locale", "Gastronomie"]
  },
  {
    id: "4",
    name: "Maison d'Hôtes à Tizi Ouzou",
    title: "Maison d'Hôtes à Tizi Ouzou",
    description:
      "Profitez de l'hospitalité kabyle dans cette charmante maison d'hôtes située à Tizi Ouzou.",
    images: [
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
    ],
    price: 8000,
    capacity: 2,
    wilaya_id: 15,
    commune_id: 200,
    location: {
      latitude: 36.7018,
      longitude: 4.0575,
      village: "Tizi Ouzou Centre",
      wilaya: "Tizi Ouzou"
    },
    availability: {
      startDate: "2024-04-15",
      endDate: "2024-09-30",
    },
    rating: 4.9,
    features: ["Petit déjeuner inclus", "Terrasse", "Vue sur la montagne"],
    reviewCount: 15,
    host: {
      name: "Nadia",
      avatar: "https://via.placeholder.com/150",
      languages: ["Français", "Kabyle", "Arabe"]
    },
    amenities: ["Wi-Fi", "Petit-déjeuner", "Parking", "Transport local"],
    cultural_offerings: ["Artisanat kabyle", "Cuisine traditionnelle", "Randonnées guidées"]
  },
  {
    id: "5",
    name: "Riad de Charme à Ghardaïa",
    title: "Riad de Charme à Ghardaïa",
    description:
      "Immergez-vous dans l'ambiance unique de Ghardaïa en séjournant dans ce riad traditionnel.",
    images: [
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-57548405/original/74952c43-4c49-484b-9c98-64196449c727.jpeg",
    ],
    price: 9000,
    capacity: 5,
    wilaya_id: 47,
    commune_id: 500,
    location: {
      latitude: 32.4846,
      longitude: 3.7708,
      village: "Ghardaïa Centre",
      wilaya: "Ghardaïa"
    },
    availability: {
      startDate: "2024-05-01",
      endDate: "2024-08-31",
    },
    rating: 4.6,
    features: ["Patio", "Décoration traditionnelle", "Proche du marché"],
    reviewCount: 9,
    host: {
      name: "Youcef",
      avatar: "https://via.placeholder.com/150",
      languages: ["Français", "Arabe", "Anglais"]
    },
    amenities: ["Wi-Fi", "Architecture typique", "Terrasse sur le toit", "Excursions"],
    cultural_offerings: ["Architecture M'zab", "Artisanat local", "Cuisine du désert"]
  },
];
