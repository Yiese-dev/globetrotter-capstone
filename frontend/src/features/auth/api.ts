import { apiClient } from "@/services/api/apiClient";
import { endpoints } from "@/services/api/endpoints";
import type { User } from "@/types/user";

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export async function registerUser(input: { email: string; password: string; full_name: string }) {
  const { data } = await apiClient.post<TokenResponse>(endpoints.register, input);
  return data;
}

export async function loginUser(input: { email: string; password: string }) {
  const { data } = await apiClient.post<TokenResponse>(endpoints.login, input);
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get<User>(endpoints.me);
  return data;
}
