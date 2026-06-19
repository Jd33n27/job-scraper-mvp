// Central configuration for API URL resolution
const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Ensure it points to the /api subroute correctly
export const API_BASE_URL = rawApiUrl.endsWith("/api") 
  ? rawApiUrl 
  : `${rawApiUrl.replace(/\/$/, "")}/api`;
