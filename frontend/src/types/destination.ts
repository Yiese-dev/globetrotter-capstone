export interface Destination {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  image_url: string;
  lat: number;
  lng: number;
  address: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}

export interface ScoredDestination {
  destination: Destination;
  score: number;
}

export interface RecommendationsResponse {
  items: ScoredDestination[];
  based_on_preferences: string[];
  fallback: boolean;
}
