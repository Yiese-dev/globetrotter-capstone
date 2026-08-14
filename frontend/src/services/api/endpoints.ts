export const endpoints = {
  register: "/auth/register",
  login: "/auth/login",
  me: "/auth/me",
  preferences: "/users/me/preferences",

  destinations: "/destinations",
  destination: (id: string) => `/destinations/${id}`,
  destinationCategories: "/destinations/categories",

  recommendations: "/recommendations",

  itineraries: "/itineraries",
  itinerary: (id: string) => `/itineraries/${id}`,
  itineraryStops: (id: string) => `/itineraries/${id}/stops`,
  itineraryStop: (id: string, stopId: string) => `/itineraries/${id}/stops/${stopId}`,
};
