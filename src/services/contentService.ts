export type FeaturedContent = {
  title: string;
  eyebrow: string;
  description: string;
  language: string;
  genre: string;
  year: string;
  artwork: string;
};

export const FEATURED_CONTENT: FeaturedContent[] = [
  {
    title: "The Last Monsoon",
    eyebrow: "GO PREMIERE",
    description: "A quiet city. A storm that remembers everything. Discover stories made for the nights that stay with you.",
    language: "Hindi",
    genre: "Drama",
    year: "2024",
    artwork: "https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?auto=format&fit=crop&w=1800&q=85",
  },
  {
    title: "City Lights",
    eyebrow: "FEATURED TONIGHT",
    description: "The pulse of Mumbai after dark, told through three lives that refuse to follow the script.",
    language: "Marathi",
    genre: "Original",
    year: "2025",
    artwork: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1800&q=85",
  },
  {
    title: "Northbound",
    eyebrow: "NEW SEASON",
    description: "Some journeys are measured in miles. The best ones change your direction.",
    language: "English",
    genre: "Adventure",
    year: "2024",
    artwork: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=85",
  },
];
