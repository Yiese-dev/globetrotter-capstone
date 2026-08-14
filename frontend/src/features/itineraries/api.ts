import { apiClient } from "@/services/api/apiClient";
import { endpoints } from "@/services/api/endpoints";
import type {
  Itinerary,
  ItineraryCreateInput,
  ItineraryUpdateInput,
  StopCreateInput,
  StopUpdateInput,
} from "@/types/itinerary";

export async function listItineraries() {
  const { data } = await apiClient.get<Itinerary[]>(endpoints.itineraries);
  return data;
}

export async function getItinerary(id: string) {
  const { data } = await apiClient.get<Itinerary>(endpoints.itinerary(id));
  return data;
}

export async function createItinerary(input: ItineraryCreateInput) {
  const { data } = await apiClient.post<Itinerary>(endpoints.itineraries, input);
  return data;
}

export async function updateItinerary(id: string, input: ItineraryUpdateInput) {
  const { data } = await apiClient.put<Itinerary>(endpoints.itinerary(id), input);
  return data;
}

export async function deleteItinerary(id: string) {
  await apiClient.delete(endpoints.itinerary(id));
}

export async function addStop(id: string, input: StopCreateInput) {
  const { data } = await apiClient.post<Itinerary>(endpoints.itineraryStops(id), input);
  return data;
}

export async function updateStop(id: string, stopId: string, input: StopUpdateInput) {
  const { data } = await apiClient.patch<Itinerary>(endpoints.itineraryStop(id, stopId), input);
  return data;
}

export async function removeStop(id: string, stopId: string) {
  const { data } = await apiClient.delete<Itinerary>(endpoints.itineraryStop(id, stopId));
  return data;
}
