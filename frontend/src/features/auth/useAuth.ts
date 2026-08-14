import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "./api";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { extractErrorMessage } from "@/lib/apiError";

export function useLogin(redirectTo = "/destinations") {
  const setSession = useAuthStore((s) => s.setSession);
  const pushToast = useUIStore((s) => s.pushToast);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setSession(data.access_token, data.user);
      pushToast(`Welcome back, ${data.user.full_name.split(" ")[0]}!`, "success");
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => pushToast(extractErrorMessage(error), "error"),
  });
}

export function useRegister(redirectTo = "/destinations") {
  const setSession = useAuthStore((s) => s.setSession);
  const pushToast = useUIStore((s) => s.pushToast);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setSession(data.access_token, data.user);
      pushToast(`Welcome to PenielGo, ${data.user.full_name.split(" ")[0]}!`, "success");
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => pushToast(extractErrorMessage(error), "error"),
  });
}
