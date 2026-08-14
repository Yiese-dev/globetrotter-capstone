import { apiClient } from "@/services/api/apiClient";
import { endpoints } from "@/services/api/endpoints";
import type { Destination, Page } from "@/types/destination";

export interface ListDestinationsParams {
  category?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export async function listDestinations(params: ListDestinationsParams = {}) {
  const { data } = await apiClient.get<Page<Destination>>(endpoints.destinations, { params });
  return data;
}

export async function getDestination(id: string) {
  const { data } = await apiClient.get<Destination>(endpoints.destination(id));
  return data;
}

export async function listCategories() {
  const { data } = await apiClient.get<string[]>(endpoints.destinationCategories);
  return data;
}
