// Central configuration for API URL resolution
const rawApiUrl = import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "https://job-scrapper-backend.onrender.com"
    : "http://localhost:8080");

// Ensure it points to the /api subroute correctly
export const API_BASE_URL = rawApiUrl.endsWith("/api") 
  ? rawApiUrl 
  : `${rawApiUrl.replace(/\/$/, "")}/api`;
