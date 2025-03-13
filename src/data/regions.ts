
export interface Region {
  name: string;
  wilaya: string;
  description: string;
  image: string;
  cultural_highlights: string[];
}

const regions: Region[] = [
  {
    name: "Ath Yenni",
    wilaya: "Tizi Ouzou",
    description: "Village célèbre pour ses bijoux en argent et corail. L'artisanat y est une tradition séculaire, particulièrement la bijouterie avec ses motifs géométriques distinctifs.",
    image: "https://images.unsplash.com/photo-1604406737558-5582480078b5?q=80&w=1374&auto=format&fit=crop",
    cultural_highlights: ["Bijouterie traditionnelle", "Festival du bijou", "Architecture berbère"]
  },
  {
    name: "Tizi Ouzou",
    wilaya: "Tizi Ouzou",
    description: "Capitale de la Grande Kabylie, centre économique et culturel important. La ville combine traditions ancestrales et modernité dans un cadre montagneux impressionnant.",
    image: "https://images.unsplash.com/photo-1579014134953-1580d6239de1?q=80&w=1475&auto=format&fit=crop",
    cultural_highlights: ["Marché hebdomadaire", "Musée du tapis", "Université"]
  },
  {
    name: "Béjaïa",
    wilaya: "Béjaïa",
    description: "Ville côtière riche en histoire, ancien royaume médiéval. Elle allie plages méditerranéennes, sites archéologiques et montagnes verdoyantes.",
    image: "https://images.unsplash.com/photo-1632990469617-34f2a209d282?q=80&w=1374&auto=format&fit=crop",
    cultural_highlights: ["Port historique", "Plages", "Parc national de Gouraya"]
  },
  {
    name: "Tikjda",
    wilaya: "Bouira",
    description: "Station de montagne située dans le Parc National du Djurdjura. Paradis pour les amoureux de la nature et des sports de montagne, avec ses forêts de cèdres et sommets enneigés en hiver.",
    image: "https://images.unsplash.com/photo-1580212206604-81f5b5f80a22?q=80&w=1374&auto=format&fit=crop",
    cultural_highlights: ["Randonnées", "Sports d'hiver", "Flore et faune endémiques"]
  },
  {
    name: "Maatkas",
    wilaya: "Tizi Ouzou",
    description: "Région connue pour sa poterie traditionnelle aux motifs géométriques uniques. Les femmes y perpétuent un savoir-faire ancestral transmis de génération en génération.",
    image: "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?q=80&w=1470&auto=format&fit=crop",
    cultural_highlights: ["Poterie berbère", "Huile d'olive", "Fêtes traditionnelles"]
  },
  {
    name: "Akbou",
    wilaya: "Béjaïa",
    description: "Centre commercial important de la vallée de la Soummam. Connue pour son dynamisme économique et son marché hebdomadaire attirant des commerçants de toute la région.",
    image: "https://images.unsplash.com/photo-1532339142463-fd0a8979791a?q=80&w=1470&auto=format&fit=crop",
    cultural_highlights: ["Marché traditionnel", "Gastronomie locale", "Vallée de la Soummam"]
  }
];

export default regions;
