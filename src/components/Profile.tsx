import React, { useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/supabase";
import { UserProfile, INDIAN_ALCOHOLS, SMOKE_PREFS, MUSIC_VIBES, PREFERRED_PLACES } from "../types";
import { LogOut, ShieldCheck, Settings, MapPin, Wine, Cigarette, Edit3, UserCircle2, Sparkles, Music, Home, X, Upload, CheckCircle2 } from "lucide-react";

import { VerificationScreen } from "./VerificationScreen";
import { SpiritGuide } from "./SpiritGuide";
import { RadarComparisonWidget } from "./RadarComparisonWidget";
import { FoodPairingsWidget } from "./FoodPairingsWidget";
import { SubscriptionModal } from "./SubscriptionModal";
import { motion } from "motion/react";

interface Props {
  currentUser: any;
}

export function Profile({ currentUser }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);

  // Form states for editing
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAge, setEditAge] = useState(21);
  const [editGender, setEditGender] = useState("Other");
  const [editAlcohols, setEditAlcohols] = useState<string[]>([]);
  const [editSmokes, setEditSmokes] = useState<string[]>([]);
  const [editMusic, setEditMusic] = useState<string[]>([]);
  const [editPlaces, setEditPlaces] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const supabaseClient = getSupabaseClient();

  const fetchProfile = async () => {
    if (!currentUser) return;
    const { data } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", currentUser.uid || currentUser.id)
      .maybeSingle();
    if (data) {
      const mapped = {
        ...data,
        uid: data.id,
        displayName: data.display_name,
        photoURL: data.photo_url,
        alcoholPreferences: data.alcohol_preferences,
        smokePreferences: data.smoke_preferences,
        safetyVerified: data.safety_verified,
        musicVibes: data.music_vibes,
        preferredPlaces: data.preferred_places,
        verificationStatus: data.verification_status || "unverified",
        subscriptionTier: data.subscription_tier || "free"
      } as UserProfile;
      setProfile(mapped);

      // Populate form
      setEditName(mapped.displayName || "");
      setEditBio(mapped.bio || "");
      setEditAge(mapped.age || 21);
      setEditGender(mapped.gender || "Other");
      setEditAlcohols(mapped.alcoholPreferences || []);
      setEditSmokes(mapped.smokePreferences || []);
      setEditMusic(mapped.musicVibes || []);
      setEditPlaces(mapped.preferredPlaces || []);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  const toggleAvailability = async () => {
    if (!profile || !currentUser) return;
    const states = ["Available", "Looking for plans", "Busy"];
    const currentIndex = states.indexOf(profile.availability);
    const nextState = states[(currentIndex + 1) % states.length];
    
    setProfile({ ...profile, availability: nextState as any });
    await supabaseClient
      .from("profiles")
      .update({ availability: nextState })
      .eq("id", currentUser.uid || currentUser.id);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && profile) {
      const file = e.target.files[0];
      setUploadingPhoto(true);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        let publicUrl = base64String;

        // Try bucket upload if actual client exists
        if (supabaseClient.auth.getSession && !supabaseClient.hasOwnProperty("triggerAuthChange")) {
          try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${currentUser.uid || currentUser.id}/avatar_${Date.now()}.${fileExt}`;
            const { error: uploadErr } = await supabaseClient.storage
              .from("avatars")
              .upload(fileName, file, { cacheControl: "3600", upsert: true });

            if (!uploadErr) {
              const { data } = supabaseClient.storage.from("avatars").getPublicUrl(fileName);
              if (data?.publicUrl) {
                publicUrl = data.publicUrl;
              }
            }
          } catch (err) {
            console.warn("Storage avatar upload failed, falling back to local base64 preview", err);
          }
        }

        // Update local state and db
        setProfile(prev => prev ? { ...prev, photoURL: publicUrl } : null);
        await supabaseClient
          .from("profiles")
          .update({ photo_url: publicUrl })
          .eq("id", currentUser.uid || currentUser.id);

        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !currentUser) return;

    try {
      const updates = {
        display_name: editName,
        bio: editBio,
        age: editAge,
        gender: editGender,
        alcohol_preferences: editAlcohols,
        smoke_preferences: editSmokes,
        music_vibes: editMusic,
        preferred_places: editPlaces
      };

      await supabaseClient
        .from("profiles")
        .update(updates)
        .eq("id", currentUser.uid || currentUser.id);

      setEditModalOpen(false);
      fetchProfile();
    } catch (err) {
      console.error("Failed to save profile changes", err);
    }
  };

  const toggleSelection = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center pt-32 px-6">
        <UserCircle2 className="w-20 h-20 text-zinc-800 mb-6" />
        <h3 className="text-2xl font-bold mb-2">Create a Profile</h3>
        <p className="text-zinc-500 mb-8 max-w-sm">Join the community to setup your profile, connect with others, and discover events.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-bumble-yellow text-slate-950 px-8 py-4 rounded-full font-black uppercase tracking-wider transition-colors cursor-pointer"
        >
          Reload
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const verifStatus = profile.verificationStatus || "unverified";

  return (
    <div className="flex flex-col h-full pt-2">
      {/* Profile Picture */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: "spring" }} className="flex justify-center mb-6 relative">
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 overflow-hidden bg-slate-800 shadow-xl relative group">
            <img src={profile.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} alt={profile.displayName} className="w-full h-full object-cover" />
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-bumble-yellow border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <label className="absolute bottom-1 right-1 md:bottom-2 md:right-2 p-2.5 bg-bumble-yellow hover:bg-bumble-yellow-hover text-slate-950 rounded-full border-2 border-bumble-slate shadow-xl cursor-pointer hover:scale-110 transition-transform">
            <Upload className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>
      </motion.div>

      {/* Name, Age, Status */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="text-center mb-10">
        <div className="flex justify-center items-center gap-2 mb-2">
          <h3 className="text-3xl font-black font-sans tracking-tight text-white">{profile.displayName}, {profile.age}</h3>
          {profile.safetyVerified && <ShieldCheck className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            onClick={toggleAvailability}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
          >
            <div className={`w-2 h-2 rounded-full shadow-lg ${profile.availability === 'Available' ? 'bg-emerald-500 shadow-emerald-500/50' : profile.availability === 'Busy' ? 'bg-rose-500 shadow-rose-500/50' : 'bg-bumble-yellow shadow-yellow-500/50'}`} />
            {profile.availability}
          </button>
          
          <div className={`px-4 py-2 rounded-full border text-[10px] uppercase font-black tracking-widest ${
            verifStatus === "verified" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
            verifStatus === "pending" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
            verifStatus === "rejected" ? "bg-rose-500/10 border-rose-500/30 text-rose-400" :
            "bg-white/5 border-white/10 text-slate-400"
          }`}>
            Aadhar: {verifStatus}
          </div>

          <button 
            onClick={() => setSubscriptionOpen(true)}
            className={`px-4 py-2 rounded-full border text-[10px] uppercase font-black tracking-widest cursor-pointer hover:scale-105 transition-transform ${
              profile.subscriptionTier === "ultimate" ? "bg-amber-500/15 border-amber-500/30 text-amber-400" :
              profile.subscriptionTier === "intermediate" ? "bg-bumble-yellow/15 border-bumble-yellow/30 text-bumble-yellow" :
              "bg-white/5 border-white/10 text-slate-400"
            }`}
          >
            Pass: {profile.subscriptionTier || "free"}
          </button>
        </div>
      </motion.div>

      {/* Profile Details Container */}
      <div className="space-y-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 p-6 rounded-[24px] border border-white/10 backdrop-blur-xl h-full relative">
            <button 
              onClick={() => setEditModalOpen(true)}
              className="absolute top-4 right-4 p-2 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Edit Profile Info"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <h4 className="text-[10px] uppercase tracking-wider font-black text-slate-500 mb-3 flex items-center gap-2"><UserCircle2 className="w-4 h-4" /> About Me</h4>
            <p className="text-slate-300 text-sm leading-relaxed">{profile.bio || "No bio set yet. Click edit to write something about yourself!"}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 p-6 rounded-[24px] border border-white/10 backdrop-blur-xl h-full space-y-5 relative">
            <button 
              onClick={() => setEditModalOpen(true)}
              className="absolute top-4 right-4 p-2 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <h4 className="text-[10px] uppercase tracking-wider font-black text-slate-500 mb-2">Preferences</h4>
            
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2.5 font-bold uppercase tracking-wider">
                <Wine className="w-4 h-4 text-bumble-yellow" /> Drinks
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.alcoholPreferences && profile.alcoholPreferences.length > 0 ? (
                  profile.alcoholPreferences.map(p => (
                    <span key={p} className="px-4 py-2 bg-bumble-yellow/15 text-bumble-yellow border border-bumble-yellow/20 rounded-full text-[11px] font-bold tracking-wide">{p}</span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">None selected</span>
                )}
              </div>
            </div>

            {profile.musicVibes && profile.musicVibes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2.5 font-bold uppercase tracking-wider">
                  <Music className="w-4 h-4 text-bumble-yellow" /> Music Vibe
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.musicVibes.map(p => (
                    <span key={p} className="px-4 py-2 bg-bumble-yellow/15 text-bumble-yellow border border-bumble-yellow/20 rounded-full text-[11px] font-bold tracking-wide">{p}</span>
                  ))}
                </div>
              </div>
            )}

            {profile.preferredPlaces && profile.preferredPlaces.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2.5 font-bold uppercase tracking-wider">
                  <Home className="w-4 h-4 text-bumble-yellow" /> Places
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredPlaces.map(p => (
                    <span key={p} className="px-4 py-2 bg-bumble-yellow/15 text-bumble-yellow border border-bumble-yellow/20 rounded-full text-[11px] font-bold tracking-wide">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RadarComparisonWidget profile={profile} />
          <FoodPairingsWidget profile={profile} />
        </div>

        {/* Dynamic Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="space-y-4">
          <button 
            onClick={() => setEditModalOpen(true)}
            className="w-full flex items-center justify-between p-5 bg-white/5 rounded-[24px] border border-white/10 hover:bg-white/10 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4 text-slate-300">
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-bumble-yellow/20 transition-colors">
                <Settings className="w-5 h-5 text-slate-400 group-hover:text-bumble-yellow" />
              </div>
              <span className="font-bold tracking-wide">Edit Profile Settings</span>
            </div>
          </button>

          <button 
            onClick={() => setGuideOpen(true)}
            className="w-full flex items-center justify-between p-5 bg-bumble-yellow/15 rounded-[24px] border border-bumble-yellow/20 hover:border-bumble-yellow/40 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4 text-bumble-yellow">
              <div className="p-3 bg-bumble-yellow/10 rounded-2xl transition-colors border border-bumble-yellow/20">
                <Sparkles className="w-5 h-5 text-bumble-yellow" />
              </div>
              <span className="font-black uppercase tracking-wider text-xs">Explore Spirit Guide</span>
            </div>
          </button>
          
          {verifStatus !== "verified" && (
            <button 
              onClick={() => setVerificationOpen(true)}
              className="w-full flex items-center justify-between p-5 bg-emerald-500/10 rounded-[24px] border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4 text-emerald-500">
                <div className="p-3 bg-emerald-500/10 rounded-2xl transition-colors border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="font-black uppercase tracking-wider text-xs">
                  {verifStatus === "pending" ? "Aadhar Verification Submitted" : "Submit Aadhar Card Verification"}
                </span>
              </div>
            </button>
          )}

          <button 
            onClick={() => supabaseClient.auth.signOut()}
            className="w-full flex items-center justify-center p-5 bg-white/5 text-rose-500 font-black rounded-full hover:bg-rose-500/10 transition-all mt-6 border border-rose-500/20 group cursor-pointer"
          >
            <LogOut className="w-5 h-5 mr-3" /> <span className="uppercase tracking-wider text-xs">Sign Out</span>
          </button>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#18181c] border border-white/10 rounded-[32px] w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">Edit Lounge Profile</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full cursor-pointer text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-bumble-yellow"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Age</label>
                <input 
                  type="number" 
                  min={21}
                  value={editAge} 
                  onChange={(e) => setEditAge(parseInt(e.target.value) || 21)} 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-bumble-yellow"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Bio</label>
                <textarea 
                  rows={3}
                  value={editBio} 
                  onChange={(e) => setEditBio(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-bumble-yellow"
                />
              </div>

              {/* Alcohol Selector */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2.5">Drinks Selection</label>
                <div className="flex flex-wrap gap-2">
                  {INDIAN_ALCOHOLS.map(drink => {
                    const active = editAlcohols.includes(drink);
                    return (
                      <button
                        type="button"
                        key={drink}
                        onClick={() => toggleSelection(editAlcohols, setEditAlcohols, drink)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border cursor-pointer ${
                          active 
                            ? "bg-bumble-yellow/20 border-bumble-yellow text-bumble-yellow" 
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        {drink}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Music Selection */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2.5">Music Selection</label>
                <div className="flex flex-wrap gap-2">
                  {MUSIC_VIBES.map(music => {
                    const active = editMusic.includes(music);
                    return (
                      <button
                        type="button"
                        key={music}
                        onClick={() => toggleSelection(editMusic, setEditMusic, music)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border cursor-pointer ${
                          active 
                            ? "bg-bumble-yellow/20 border-bumble-yellow text-bumble-yellow" 
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        {music}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Venue Selection */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2.5">Preferred Venues</label>
                <div className="flex flex-wrap gap-2">
                  {PREFERRED_PLACES.map(place => {
                    const active = editPlaces.includes(place);
                    return (
                      <button
                        type="button"
                        key={place}
                        onClick={() => toggleSelection(editPlaces, setEditPlaces, place)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border cursor-pointer ${
                          active 
                            ? "bg-bumble-yellow/20 border-bumble-yellow text-bumble-yellow" 
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        {place}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-bumble-yellow hover:bg-bumble-yellow-hover text-slate-950 py-3.5 rounded-full font-black text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {verificationOpen && (
        <VerificationScreen 
          currentUser={currentUser} 
          onClose={() => setVerificationOpen(false)} 
          onSuccess={() => {
            setVerificationOpen(false);
            fetchProfile();
          }}
        />
      )}

      {guideOpen && (
        <SpiritGuide 
          currentUser={currentUser} 
          onClose={() => setGuideOpen(false)} 
          onUpdate={(prefs) => setProfile(prev => prev ? { ...prev, alcoholPreferences: prefs } : null)}
        />
      )}

      {subscriptionOpen && (
        <SubscriptionModal 
          currentUser={currentUser}
          currentTier={profile.subscriptionTier || "free"}
          onClose={() => setSubscriptionOpen(false)}
          onSuccess={() => {
            setSubscriptionOpen(false);
            fetchProfile();
          }}
        />
      )}
    </div>
  );
}
