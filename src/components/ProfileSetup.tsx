import { useState, useEffect } from "react";
import { getSupabaseClient } from "../lib/supabase";
import { INDIAN_ALCOHOLS, SMOKE_PREFS, MUSIC_VIBES, PREFERRED_PLACES, UserProfile } from "../types";
import { CheckCircle2, ChevronRight, ShieldCheck, GlassWater } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  user: any;
  onComplete: () => void;
}

export function ProfileSetup({ user, onComplete }: Props) {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    uid: user.uid || (user as any).id,
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    bio: "",
    age: 21,
    gender: "Other",
    alcoholPreferences: [],
    smokePreferences: [],
    availability: "Available",
    safetyVerified: false,
    vibes: [],
    musicVibes: [],
    preferredPlaces: [],
  });

  const supabaseClient = getSupabaseClient();

  useEffect(() => {
    const checkProfile = async () => {
      const { data } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.uid || (user as any).id)
        .maybeSingle();
      if (data && data.display_name) {
        onComplete();
      } else {
        setLoading(false);
      }
    };
    checkProfile();
  }, [user, onComplete]);

  const handleSave = async () => {
    try {
      const dbProfile = {
        id: user.uid || (user as any).id,
        display_name: profile.displayName || "",
        photo_url: profile.photoURL || "",
        bio: profile.bio || "",
        age: profile.age || 21,
        gender: profile.gender || "Other",
        availability: profile.availability || "Available",
        safety_verified: profile.safetyVerified || false,
        alcohol_preferences: profile.alcoholPreferences || [],
        smoke_preferences: profile.smokePreferences || [],
        music_vibes: profile.musicVibes || [],
        preferred_places: profile.preferredPlaces || [],
        vibes: profile.vibes || []
      };
      
      await supabaseClient.from("profiles").upsert(dbProfile);
      onComplete();
    } catch (error) {
      console.error("Error saving profile", error);
    }
  };

  const togglePref = (type: "alcohol" | "smoke" | "music" | "places", item: string) => {
    setProfile((prev) => {
      let key: "alcoholPreferences" | "smokePreferences" | "musicVibes" | "preferredPlaces";
      if (type === "alcohol") key = "alcoholPreferences";
      else if (type === "smoke") key = "smokePreferences";
      else if (type === "music") key = "musicVibes";
      else key = "preferredPlaces";

      const list = prev[key] || [];
      return {
        ...prev,
        [key]: list.includes(item) ? list.filter((i) => i !== item) : [...list, item],
      };
    });
  };

  if (loading) {
    return <div className="min-h-screen bg-bumble-slate flex items-center justify-center text-white"><GlassWater className="w-8 h-8 animate-pulse text-bumble-yellow" /></div>;
  }

  return (
    <div className="min-h-screen bg-bumble-slate text-slate-100 flex flex-col px-6 py-12 overflow-y-auto font-sans relative">
      <div className="max-w-md w-full mx-auto space-y-8 relative z-10">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-3xl font-black text-white">Basic Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-bold mb-2 block">Display Name</label>
                <input 
                  type="text" 
                  value={profile.displayName}
                  onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-bumble-yellow text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-bold mb-2 block">Age (Must be 21+)</label>
                <input 
                  type="number" 
                  value={profile.age}
                  min={21}
                  onChange={(e) => setProfile({...profile, age: parseInt(e.target.value) || 21})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-bumble-yellow text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-bold mb-2 block">Gender</label>
                <select 
                  value={profile.gender}
                  onChange={(e) => setProfile({...profile, gender: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-bumble-yellow text-slate-100"
                >
                  <option className="bg-bumble-slate text-white">Male</option>
                  <option className="bg-bumble-slate text-white">Female</option>
                  <option className="bg-bumble-slate text-white">Non-binary</option>
                  <option className="bg-bumble-slate text-white">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-bold mb-2 block">Bio</label>
                <textarea 
                  value={profile.bio}
                  placeholder="What's your perfect evening look like?"
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 h-24 resize-none focus:outline-none focus:border-bumble-yellow text-slate-100"
                />
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-bumble-yellow hover:bg-bumble-yellow-hover text-slate-950 font-black py-4 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 uppercase tracking-wider cursor-pointer"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-3xl font-black text-white">Your Vibe</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-[11px] text-slate-400 uppercase font-bold mb-3 block">Favorite Drinks</h3>
                <div className="flex flex-wrap gap-2">
                  {INDIAN_ALCOHOLS.map(drink => {
                    const selected = profile.alcoholPreferences?.includes(drink);
                    return (
                      <button
                        key={drink}
                        onClick={() => togglePref("alcohol", drink)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border cursor-pointer ${selected ? 'bg-bumble-yellow/20 border-bumble-yellow/50 text-bumble-yellow' : 'bg-white/5 border-white/10 text-slate-300'}`}
                      >
                        {drink}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] text-slate-400 uppercase font-bold mb-3 block">Favorite Drinking Music Vibe</h3>
                <div className="flex flex-wrap gap-2">
                  {MUSIC_VIBES.map(vibe => {
                    const selected = profile.musicVibes?.includes(vibe);
                    return (
                      <button
                        key={vibe}
                        onClick={() => togglePref("music", vibe)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border cursor-pointer ${selected ? 'bg-bumble-yellow/20 border-bumble-yellow/50 text-bumble-yellow' : 'bg-white/5 border-white/10 text-slate-300'}`}
                      >
                        {vibe}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] text-slate-400 uppercase font-bold mb-3 block">Preferred Drinking Location</h3>
                <div className="flex flex-wrap gap-2">
                  {PREFERRED_PLACES.map(place => {
                    const selected = profile.preferredPlaces?.includes(place);
                    return (
                      <button
                        key={place}
                        onClick={() => togglePref("places", place)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border cursor-pointer ${selected ? 'bg-bumble-yellow/20 border-bumble-yellow/50 text-bumble-yellow' : 'bg-white/5 border-white/10 text-slate-300'}`}
                      >
                        {place}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] text-slate-400 uppercase font-bold mb-3 block">Mood & Vibes</h3>
                <div className="flex flex-wrap gap-2">
                  {["Chilled Out", "Live Music Enthusiast", "Artisanal Cocktail Explorer", "Weekend Warrior", "Deep Conversations"].map(vibe => {
                    const selected = profile.vibes?.includes(vibe);
                    return (
                      <button
                        key={vibe}
                        onClick={() => {
                          const current = profile.vibes || [];
                          if (current.includes(vibe)) {
                            setProfile({ ...profile, vibes: current.filter(v => v !== vibe) });
                          } else if (current.length < 3) {
                            setProfile({ ...profile, vibes: [...current, vibe] });
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border cursor-pointer ${selected ? 'bg-bumble-yellow/20 border-bumble-yellow/50 text-bumble-yellow' : 'bg-white/5 border-white/10 text-slate-300'}`}
                      >
                        {vibe}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] text-slate-400 uppercase font-bold mb-3 block">Smoke Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {SMOKE_PREFS.map(smoke => {
                    const selected = profile.smokePreferences?.includes(smoke);
                    return (
                      <button
                        key={smoke}
                        onClick={() => togglePref("smoke", smoke)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border cursor-pointer ${selected ? 'bg-bumble-yellow/20 border-bumble-yellow/50 text-bumble-yellow' : 'bg-white/5 border-white/10 text-slate-300'}`}
                      >
                        {smoke}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-400 text-sm">Safety Verification</h4>
                  <p className="text-[11px] text-emerald-400/80 mt-1">We require real-time photo verification to keep the community safe. You'll complete this step later.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)}
                className="w-1/3 bg-white/5 border border-white/10 text-slate-300 font-bold py-4 rounded-full text-sm cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={handleSave}
                className="w-2/3 bg-bumble-yellow hover:bg-bumble-yellow-hover text-slate-950 font-black py-4 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 uppercase tracking-wider text-sm cursor-pointer"
              >
                Complete <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}


