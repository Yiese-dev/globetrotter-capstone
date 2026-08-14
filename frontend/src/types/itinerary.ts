export interface ItineraryStop {
  stop_id: string;
  destination_id: string;
  name: string;
  category: string;
  image_url: string;
  lat: number;
  lng: number;
  order: number;
  planned_date: string | null;
  notes: string | null;
}

export interface Itinerary {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  stops: ItineraryStop[];
  created_at: string;
  updated_at: string;
}

export interface ItineraryCreateInput {
  title: string;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
}

export interface ItineraryUpdateInput {
  title?: string;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
}

export interface StopCreateInput {
  destination_id: string;
  name: string;
  category: string;
  image_url: string;
  lat: number;
  lng: number;
  planned_date?: string | null;
  notes?: string | null;
}

export interface StopUpdateInput {
  planned_date?: string | null;
  notes?: string | null;
  order?: number;
}
