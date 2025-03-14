
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
}

export interface PropertyAvailability {
  startDate: string;
  endDate: string;
}

// Updated Property type with correct availability structure
export interface Property {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  capacity: number;
  wilaya_id: number;
  commune_id: number;
  commune_name?: string;
  wilaya_name?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  owner_id?: string;
  availability?: PropertyAvailability;
  rating?: number;
  features?: string[];
}

export const properties: Property[] = [
  {
    id: "1",
    name: "Appartement de Luxe à Alger",
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
    },
    availability: {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
    rating: 4.8,
    features: ["Piscine", "Salle de sport", "Parking gratuit"],
  },
  {
    id: "2",
    name: "Villa Traditionnelle à Oran",
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
    },
    availability: {
      startDate: "2024-02-15",
      endDate: "2024-11-30",
    },
    rating: 4.5,
    features: ["Jardin", "Barbecue", "Climatisation"],
  },
  {
    id: "3",
    name: "Appartement Moderne à Constantine",
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
    },
    availability: {
      startDate: "2024-03-01",
      endDate: "2024-10-31",
    },
    rating: 4.2,
    features: ["Balcon", "Cuisine équipée", "WiFi gratuit"],
  },
  {
    id: "4",
    name: "Maison d'Hôtes à Tizi Ouzou",
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
    },
    availability: {
      startDate: "2024-04-15",
      endDate: "2024-09-30",
    },
    rating: 4.9,
    features: ["Petit déjeuner inclus", "Terrasse", "Vue sur la montagne"],
  },
  {
    id: "5",
    name: "Riad de Charme à Ghardaïa",
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
    },
    availability: {
      startDate: "2024-05-01",
      endDate: "2024-08-31",
    },
    rating: 4.6,
    features: ["Patio", "Décoration traditionnelle", "Proche du marché"],
  },
];
