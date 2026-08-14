import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api/apiClient";
import { endpoints } from "@/services/api/endpoints";
import { getRecommendations } from "./api";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { extractErrorMessage } from "@/lib/apiError";

export function useRecommendations(limit = 10) {
  return useQuery({
    queryKey: ["recommendations", limit],
    queryFn: () => getRecommendations(limit),
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  const user = useAuthStore((s) => s.user);
  const pushToast = useUIStore((s) => s.pushToast);

  return useMutation({
    mutationFn: async (preferences: string[]) => {
      const { data } = await apiClient.patch<string[]>(endpoints.preferences, { preferences });
      return data;
    },
    onSuccess: (preferences) => {
      if (user) updateUser({ ...user, preferences });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      pushToast("Preferences updated", "success");
    },
    onError: (error) => pushToast(extractErrorMessage(error), "error"),
  });
}
