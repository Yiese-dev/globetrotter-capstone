import axios from "axios";

interface ApiErrorDetail {
  msg?: string;
}

interface ApiErrorBody {
  error: { code: string; message: string; details?: ApiErrorDetail[] };
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const apiError = error.response?.data?.error;
    if (!apiError) return "Something went wrong. Please try again.";

    // For 422s, `message` is just the generic "Request validation failed" — the actually
    // useful text (e.g. "Password must contain at least one letter and one digit") is the
    // first field error's `msg`. Pydantic prefixes custom validator messages with
    // "Value error, "; strip that since it's an implementation detail, not user-facing.
    const firstDetailMessage = apiError.details?.[0]?.msg;
    if (firstDetailMessage) {
      return firstDetailMessage.replace(/^Value error,\s*/i, "");
    }
    return apiError.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}
