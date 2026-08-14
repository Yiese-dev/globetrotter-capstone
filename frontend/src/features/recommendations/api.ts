import { apiClient } from "@/services/api/apiClient";
import { endpoints } from "@/services/api/endpoints";
import type { RecommendationsResponse } from "@/types/destination";

export async function getRecommendations(limit = 10) {
  const { data } = await apiClient.get<RecommendationsResponse>(endpoints.recommendations, { params: { limit } });
  return data;
}
