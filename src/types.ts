export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  bio: string;
  age: number;
  gender: string;
  alcoholPreferences: string[];
  smokePreferences: string[];
  availability: "Available" | "Busy" | "Looking for plans";
  safetyVerified: boolean;
  createdAt: number;
  vibes?: string[];
  musicVibes?: string[];
  preferredPlaces?: string[];
  aadharNumber?: string;
  aadharURL?: string;
  verificationStatus?: "unverified" | "pending" | "verified" | "rejected";
  subscriptionTier?: "free" | "intermediate" | "ultimate";
  swipesRemaining?: number;
}

export const INDIAN_ALCOHOLS = [
  "Old Monk",
  "Kingfisher",
  "Amrut",
  "Paul John",
  "Royal Stag",
  "Blenders Pride",
  "Bira 91",
  "Magic Moments",
  "Sula Wines",
  "Desi Daru",
  "Teetotaler (Just Vibes)"
];

export const SMOKE_PREFS = [
  "Classic Milds",
  "Classic Regular",
  "Gold Flake Kings",
  "Marlboro Advance",
  "Wills Navy Cut",
  "Four Square",
  "Gudang Garam",
  "Vape/Juul",
  "Non-smoker",
  "Social smoker"
];

export const MUSIC_VIBES = [
  "Punjabi Beats",
  "Sufi / Ghazals",
  "Bollywood Retro & Sad Songs",
  "EDM / Techno Clubbing",
  "Indie / Rock Vibe",
  "Silent Acoustic / Unplugged"
];

export const PREFERRED_PLACES = [
  "BYOB / Ahata",
  "Flat / Home Party",
  "Club / Elite Lounge",
  "Local Dhaba / Highway",
  "Rooftop / Cafe Vibe",
  "Park / Outdoors (Chull)"
];

