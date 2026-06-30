import { createClient } from "@supabase/supabase-js";
import { UserProfile } from "../types";

// Fetch values from environment
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

// Check if credentials are valid
const hasValidCredentials = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== "YOUR_SUPABASE_URL" && 
  supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY";

export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Mock database fallback using localStorage for robust local demo capability
class MockSupabaseClient {
  private listeners: ((event: string, session: any) => void)[] = [];

  constructor() {
    // Populate mock profiles if empty
    if (!localStorage.getItem("mock_profiles")) {
      const initialProfiles: UserProfile[] = [
        { 
          uid: "mock1", 
          displayName: "Aarohi", 
          photoURL: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=400&q=80", 
          bio: "Let's grab a beer and talk about startups.", 
          age: 24, 
          gender: "Female", 
          alcoholPreferences: ["Bira 91", "Magic Moments"], 
          smokePreferences: ["Non-smoker"], 
          availability: "Available", 
          safetyVerified: true, 
          createdAt: Date.now(), 
          vibes: ["Chilled Out", "Deep Conversations"],
          musicVibes: ["Punjabi Beats"],
          preferredPlaces: ["Rooftop / Cafe Vibe"]
        },
        { 
          uid: "mock2", 
          displayName: "Rohan", 
          photoURL: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80", 
          bio: "Weekend Old Monk enthusiast. Looking for a plus one for standup comedy.", 
          age: 27, 
          gender: "Male", 
          alcoholPreferences: ["Old Monk", "Blenders Pride"], 
          smokePreferences: ["Classic Milds"], 
          availability: "Looking for plans", 
          safetyVerified: false, 
          createdAt: Date.now(), 
          vibes: ["Live Music Enthusiast", "Weekend Warrior"],
          musicVibes: ["Bollywood Retro & Sad Songs"],
          preferredPlaces: ["BYOB / Ahata"]
        },
        { 
          uid: "mock3", 
          displayName: "Simran", 
          photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", 
          bio: "Wine and dine. Seeking good conversations.", 
          age: 26, 
          gender: "Female", 
          alcoholPreferences: ["Sula Wines"], 
          smokePreferences: ["Vape/Juul"], 
          availability: "Busy", 
          safetyVerified: true, 
          createdAt: Date.now(), 
          vibes: ["Artisanal Cocktail Explorer", "Deep Conversations"],
          musicVibes: ["Sufi / Ghazals"],
          preferredPlaces: ["Club / Elite Lounge"]
        }
      ];
      localStorage.setItem("mock_profiles", JSON.stringify(initialProfiles));
    }
  }

  get auth() {
    return {
      signUp: async ({ email, password, options }: any) => {
        const users = JSON.parse(localStorage.getItem("mock_users") || "[]");
        if (users.some((u: any) => u.email === email)) {
          return { data: null, error: { message: "User already exists." } };
        }
        
        const newUid = "u-" + Math.random().toString(36).substr(2, 9);
        const newUser = { uid: newUid, email, password, displayName: options?.data?.display_name || email.split("@")[0] };
        users.push(newUser);
        localStorage.setItem("mock_users", JSON.stringify(users));

        const session = { user: { id: newUid, email }, expires_in: 3600 };
        localStorage.setItem("mock_session", JSON.stringify(session));
        this.triggerAuthChange("SIGNED_IN", session);

        return { data: { user: session.user, session }, error: null };
      },
      
      signInWithPassword: async ({ email, password }: any) => {
        // Predefined Admin Check
        if (email === "admin@pegmatch.com" && password === "PegMatchAdmin2026!") {
          const session = { user: { id: "admin-uid", email, role: "admin" }, expires_in: 3600 };
          localStorage.setItem("mock_session", JSON.stringify(session));
          this.triggerAuthChange("SIGNED_IN", session);
          return { data: { user: session.user, session }, error: null };
        }

        const users = JSON.parse(localStorage.getItem("mock_users") || "[]");
        const found = users.find((u: any) => u.email === email && u.password === password);
        
        if (!found) {
          return { data: null, error: { message: "Invalid email or password." } };
        }

        const session = { user: { id: found.uid, email }, expires_in: 3600 };
        localStorage.setItem("mock_session", JSON.stringify(session));
        this.triggerAuthChange("SIGNED_IN", session);
        return { data: { user: session.user, session }, error: null };
      },

      signOut: async () => {
        localStorage.removeItem("mock_session");
        this.triggerAuthChange("SIGNED_OUT", null);
        return { error: null };
      },

      getSession: async () => {
        const sess = localStorage.getItem("mock_session");
        return { data: { session: sess ? JSON.parse(sess) : null }, error: null };
      },

      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        this.listeners.push(callback);
        // Initial trigger
        const sess = localStorage.getItem("mock_session");
        callback(sess ? "SIGNED_IN" : "INITIAL_SESSION", sess ? JSON.parse(sess) : null);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                this.listeners = this.listeners.filter(l => l !== callback);
              }
            }
          }
        };
      }
    };
  }

  private triggerAuthChange(event: string, session: any) {
    this.listeners.forEach(l => l(event, session));
  }

  from(table: string) {
    return {
      select: (queryStr: string = "*") => {
        const data = JSON.parse(localStorage.getItem(`mock_${table}`) || "[]");
        return {
          eq: (column: string, value: any) => {
            const filtered = data.filter((row: any) => row[column] === value);
            return {
              single: async () => ({ data: filtered[0] || null, error: null }),
              maybeSingle: async () => ({ data: filtered[0] || null, error: null }),
              then: async (resolve: any) => resolve({ data: filtered, error: null })
            };
          },
          neq: (column: string, value: any) => {
            const filtered = data.filter((row: any) => row[column] !== value);
            return {
              then: async (resolve: any) => resolve({ data: filtered, error: null })
            };
          },
          then: async (resolve: any) => resolve({ data, error: null })
        };
      },
      
      insert: (rows: any) => {
        const data = JSON.parse(localStorage.getItem(`mock_${table}`) || "[]");
        const newRows = Array.isArray(rows) ? rows : [rows];
        newRows.forEach(row => {
          if (!row.id) row.id = "r-" + Math.random().toString(36).substr(2, 9);
          data.push(row);
        });
        localStorage.setItem(`mock_${table}`, JSON.stringify(data));
        return {
          select: () => ({
            then: async (resolve: any) => resolve({ data: newRows, error: null })
          }),
          then: async (resolve: any) => resolve({ data: newRows, error: null })
        };
      },

      update: (updates: any) => {
        const data = JSON.parse(localStorage.getItem(`mock_${table}`) || "[]");
        return {
          eq: (column: string, value: any) => {
            let updatedRows: any[] = [];
            const nextData = data.map((row: any) => {
              if (row[column] === value) {
                const nextRow = { ...row, ...updates };
                updatedRows.push(nextRow);
                return nextRow;
              }
              return row;
            });
            localStorage.setItem(`mock_${table}`, JSON.stringify(nextData));
            return {
              then: async (resolve: any) => resolve({ data: updatedRows, error: null })
            };
          }
        };
      },

      delete: () => {
        const data = JSON.parse(localStorage.getItem(`mock_${table}`) || "[]");
        return {
          eq: (column: string, value: any) => {
            const nextData = data.filter((row: any) => row[column] !== value);
            localStorage.setItem(`mock_${table}`, JSON.stringify(nextData));
            return {
              then: async (resolve: any) => resolve({ data: null, error: null })
            };
          }
        };
      }
    };
  }
}

export const mockSupabase = new MockSupabaseClient();

export const getSupabaseClient = () => {
  return supabase || (mockSupabase as any);
};
