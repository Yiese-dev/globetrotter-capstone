const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";
const originBase = apiBase.replace(/\/api\/v1\/?$/, "");

/** Destination photos are served by whichever backend is active (/static/...), not bundled
 * into the frontend — this turns the API's relative image_url into an absolute URL. */
export function resolveAssetUrl(path: string): string {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${originBase}${path.startsWith("/") ? path : `/${path}`}`;
}
