import { useQuery } from "@tanstack/react-query";
import { getDestination, listCategories, listDestinations } from "./api";
import type { ListDestinationsParams } from "./api";

export function useDestinations(params: ListDestinationsParams) {
  return useQuery({
    queryKey: ["destinations", params],
    queryFn: () => listDestinations(params),
    placeholderData: (previous) => previous,
  });
}

export function useDestination(id: string | undefined) {
  return useQuery({
    queryKey: ["destination", id],
    queryFn: () => getDestination(id as string),
    enabled: Boolean(id),
  });
}

export function useDestinationCategories() {
  return useQuery({
    queryKey: ["destination-categories"],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });
}
