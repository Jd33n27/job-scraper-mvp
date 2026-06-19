export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  skills: string;
  bio: string;
}

import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL;

export const fetchProfile = async (): Promise<UserProfile | null> => {
  try {
    const response = await fetch(`${API_URL}/profile`);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.error("Failed to fetch profile:", e);
  }
  return null;
};

export const updateProfile = async (profile: UserProfile): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    return response.ok;
  } catch (e) {
    console.error("Failed to update profile:", e);
    return false;
  }
};
