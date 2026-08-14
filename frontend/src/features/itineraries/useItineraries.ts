import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { ItineraryCreateInput, ItineraryUpdateInput, StopCreateInput, StopUpdateInput } from "@/types/itinerary";
import { useUIStore } from "@/store/uiStore";
import { extractErrorMessage } from "@/lib/apiError";

export function useItineraries() {
  return useQuery({ queryKey: ["itineraries"], queryFn: api.listItineraries });
}

export function useItinerary(id: string | undefined) {
  return useQuery({
    queryKey: ["itinerary", id],
    queryFn: () => api.getItinerary(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateItinerary() {
  const queryClient = useQueryClient();
  const pushToast = useUIStore((s) => s.pushToast);
  return useMutation({
    mutationFn: (input: ItineraryCreateInput) => api.createItinerary(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      pushToast("Itinerary created", "success");
    },
    onError: (error) => pushToast(extractErrorMessage(error), "error"),
  });
}

export function useUpdateItinerary(id: string) {
  const queryClient = useQueryClient();
  const pushToast = useUIStore((s) => s.pushToast);
  return useMutation({
    mutationFn: (input: ItineraryUpdateInput) => api.updateItinerary(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      queryClient.invalidateQueries({ queryKey: ["itinerary", id] });
      pushToast("Itinerary updated", "success");
    },
    onError: (error) => pushToast(extractErrorMessage(error), "error"),
  });
}

export function useDeleteItinerary() {
  const queryClient = useQueryClient();
  const pushToast = useUIStore((s) => s.pushToast);
  return useMutation({
    mutationFn: (id: string) => api.deleteItinerary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      pushToast("Itinerary deleted", "success");
    },
    onError: (error) => pushToast(extractErrorMessage(error), "error"),
  });
}

export function useAddStop(itineraryId: string) {
  const queryClient = useQueryClient();
  const pushToast = useUIStore((s) => s.pushToast);
  return useMutation({
    mutationFn: (input: StopCreateInput) => api.addStop(itineraryId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary", itineraryId] });
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      pushToast("Added to itinerary", "success");
    },
    onError: (error) => pushToast(extractErrorMessage(error), "error"),
  });
}

export function useUpdateStop(itineraryId: string) {
  const queryClient = useQueryClient();
  const pushToast = useUIStore((s) => s.pushToast);
  return useMutation({
    mutationFn: ({ stopId, input }: { stopId: string; input: StopUpdateInput }) =>
      api.updateStop(itineraryId, stopId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary", itineraryId] });
      pushToast("Stop updated", "success");
    },
    onError: (error) => pushToast(extractErrorMessage(error), "error"),
  });
}

export function useRemoveStop(itineraryId: string) {
  const queryClient = useQueryClient();
  const pushToast = useUIStore((s) => s.pushToast);
  return useMutation({
    mutationFn: (stopId: string) => api.removeStop(itineraryId, stopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary", itineraryId] });
      pushToast("Stop removed", "success");
    },
    onError: (error) => pushToast(extractErrorMessage(error), "error"),
  });
}
