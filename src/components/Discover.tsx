import { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { getSupabaseClient } from "../lib/supabase";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { Filter, Zap, ShieldAlert, Sparkles, MapPin, Wine, Music, Heart, Ban, AlertCircle, Home, CheckCircle2 } from "lucide-react";
import { getQuoteForAlcohol } from "../lib/quotes";

const FILTER_CATEGORIES = [
  { name: "All", preferences: [] },
  { name: "Single Malts", preferences: ["Amrut", "Paul John"] },
  { name: "Craft Beers", preferences: ["Bira 91", "Kingfisher"] },
  { name: "Rum", preferences: ["Old Monk"] },
  { name: "Whisky", preferences: ["Royal Stag", "Blenders Pride"] },
  { name: "Premium Wines", preferences: ["Sula Wines"] },
  { name: "Desi & Vodka", preferences: ["Desi Daru", "Magic Moments"] },
];

const VIBE_CATEGORIES = [
  "Any Vibe",
  "Chilled Out",
  "Live Music Enthusiast",
  "Artisanal Cocktail Explorer",
  "Weekend Warrior",
  "Deep Conversations"
];

interface Props {
  currentUser: any;
}

function calculateCompatibility(user1: UserProfile | null, user2: UserProfile): number {
  if (!user1) return 0;
  
  let score = 30; // Base score
  
  const mutualAlcohol = user2.alcoholPreferences?.filter(p => user1.alcoholPreferences?.includes(p)) || [];
  score += mutualAlcohol.length * 15;
  
  const mutualMusic = user2.musicVibes?.filter(p => user1.musicVibes?.includes(p)) || [];
  score += mutualMusic.length * 15;

  const mutualPlaces = user2.preferredPlaces?.filter(p => user1.preferredPlaces?.includes(p)) || [];
  score += mutualPlaces.length * 15;

  const mutualSmoke = user2.smokePreferences?.filter(p => user1.smokePreferences?.includes(p)) || [];
  score += mutualSmoke.length * 5;
  
  if (user1.availability === user2.availability) {
    score += 10;
  }
  
  return Math.min(score, 99);
}

export function Discover({ currentUser }: Props) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeVibeFilter, setActiveVibeFilter] = useState("Any Vibe");

  const supabaseClient = getSupabaseClient();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  const fetchProfiles = async () => {
    try {
      let fetched: UserProfile[] = [];
      if (currentUser) {
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", currentUser.uid || currentUser.id)
          .maybeSingle();

        if (profile) {
          const mappedProfile = {
            ...profile,
            uid: profile.id,
            displayName: profile.display_name,
            photoURL: profile.photo_url,
            alcoholPreferences: profile.alcohol_preferences,
            smokePreferences: profile.smoke_preferences,
            safetyVerified: profile.safety_verified,
            musicVibes: profile.music_vibes,
            preferredPlaces: profile.preferred_places,
            verificationStatus: profile.verification_status || "unverified",
            subscriptionTier: profile.subscription_tier || "free",
            swipesRemaining: profile.swipes_remaining !== undefined ? profile.swipes_remaining : 3
          };
          setCurrentUserProfile(mappedProfile as UserProfile);
        }

        const { data: list } = await supabaseClient
          .from("profiles")
          .select("*")
          .neq("id", currentUser.uid || currentUser.id);

        if (list) {
          fetched = list.map((item: any) => ({
            ...item,
            uid: item.id,
            displayName: item.display_name,
            photoURL: item.photo_url,
            alcoholPreferences: item.alcohol_preferences,
            smokePreferences: item.smoke_preferences,
            safetyVerified: item.safety_verified,
            musicVibes: item.music_vibes,
            preferredPlaces: item.preferred_places,
            verificationStatus: item.verification_status || "unverified"
          }));
        }
      }
      
      if (fetched.length === 0) {
        fetched.push(
          { uid: "mock1", displayName: "Aarohi", age: 24, gender: "Female", bio: "Let's grab a beer and talk about startups.", alcoholPreferences: ["Bira 91", "Magic Moments"], smokePreferences: ["Non-smoker"], photoURL: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=400&q=80", availability: "Available", safetyVerified: true, createdAt: 0, vibes: ["Chilled Out", "Deep Conversations"], musicVibes: ["Punjabi Beats", "EDM / Techno Clubbing"], preferredPlaces: ["Rooftop / Cafe Vibe", "Flat / Home Party"], verificationStatus: "verified" },
          { uid: "mock2", displayName: "Rohan", age: 27, gender: "Male", bio: "Weekend Old Monk enthusiast. Looking for a plus one for standup comedy.", alcoholPreferences: ["Old Monk", "Blenders Pride"], smokePreferences: ["Classic Milds"], photoURL: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80", availability: "Looking for plans", safetyVerified: false, createdAt: 0, vibes: ["Live Music Enthusiast", "Weekend Warrior"], musicVibes: ["Bollywood Retro & Sad Songs", "Silent Acoustic / Unplugged"], preferredPlaces: ["BYOB / Ahata", "Local Dhaba / Highway"], verificationStatus: "verified" },
          { uid: "mock3", displayName: "Simran", age: 26, gender: "Female", bio: "Wine and dine. Seeking good conversations.", alcoholPreferences: ["Sula Wines"], smokePreferences: ["Vape/Juul"], photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", availability: "Busy", safetyVerified: true, createdAt: 0, vibes: ["Artisanal Cocktail Explorer", "Deep Conversations"], musicVibes: ["Sufi / Ghazals", "Indie / Rock Vibe"], preferredPlaces: ["Rooftop / Cafe Vibe", "Club / Elite Lounge"], verificationStatus: "verified" }
        );
      }
      
      setProfiles(fetched);
    } catch (error) {
      console.error("Error fetching profiles", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [currentUser]);

  const handleSwipe = async (direction: "left" | "right", targetUid: string) => {
    setProfiles(prev => prev.filter(p => p.uid !== targetUid));
    if (!currentUser) return;
    
    try {
      await supabaseClient.from("swipes").insert({
        from_user_id: currentUser.uid || currentUser.id,
        to_user_id: targetUid,
        action: direction === "right" ? "like" : "pass"
      });

      // Decrement swipes
      if (currentUserProfile && currentUserProfile.subscriptionTier === "free") {
        const nextSwipes = Math.max(0, (currentUserProfile.swipesRemaining || 3) - 1);
        setCurrentUserProfile(prev => prev ? { ...prev, swipesRemaining: nextSwipes } : null);
        await supabaseClient
          .from("profiles")
          .update({ swipes_remaining: nextSwipes })
          .eq("id", currentUser.uid || currentUser.id);
      }
    } catch (error) {
      console.error("Error saving swipe", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center pt-32">
        <div className="w-8 h-8 border-4 border-bumble-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Verification gating check
  const isVerified = currentUserProfile?.verificationStatus === "verified";
  const hasSwipes = currentUserProfile && 
    (currentUserProfile.subscriptionTier !== "free" || 
     (currentUserProfile.swipesRemaining !== undefined ? currentUserProfile.swipesRemaining > 0 : true));

  if (currentUserProfile && !isVerified) {
    const status = currentUserProfile.verificationStatus || "unverified";
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-6 max-w-md mx-auto relative z-20">
        <div className="w-20 h-20 bg-bumble-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-bumble-yellow/30">
          <ShieldAlert className="w-10 h-10 text-bumble-yellow" />
        </div>
        <h3 className="text-2xl font-black mb-2 text-white">
          {status === "pending" ? "Aadhar Verification Pending 🕒" : "Lounge is Locked 🔒"}
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed mb-6">
          {status === "pending" 
            ? "Your Aadhar card submission has been received and is being verified by our lounge moderator. We will notify you once approved."
            : "To view and match with other members, you must submit your 12-digit Aadhar Card details for moderator review in your Profile section."}
        </p>
        {status !== "pending" && (
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            Go to Profile &rarr; Submit Aadhar Card
          </p>
        )}
      </div>
    );
  }

  if (currentUserProfile && !hasSwipes) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-6 max-w-sm mx-auto relative z-20">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
          <Zap className="w-10 h-10 text-amber-500 fill-amber-500/20 animate-pulse" />
        </div>
        <h3 className="text-2xl font-black mb-2 text-white">Out of Free Swipes 🥂</h3>
        <p className="text-slate-400 text-xs leading-relaxed mb-6">
          You've exhausted your 3 free passes for the day. Upgrade to the **Chilled Quarter** or **Patiala Peg VIP Pass** in your Profile tab to unlock more matches instantly!
        </p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          Go to Profile &rarr; Upgrade Lounge Pass
        </p>
      </div>
    );
  }

  const filteredProfiles = profiles.filter(profile => {
    let matchesDrink = true;
    if (activeFilter !== "All") {
      const category = FILTER_CATEGORIES.find(c => c.name === activeFilter);
      if (category) {
        matchesDrink = profile.alcoholPreferences?.some(pref => category.preferences.includes(pref)) ?? false;
      }
    }
    
    let matchesVibe = true;
    if (activeVibeFilter !== "Any Vibe") {
      matchesVibe = profile.vibes?.includes(activeVibeFilter) ?? false;
    }
    
    return matchesDrink && matchesVibe;
  });

  const currentActiveCard = filteredProfiles[0] || null;

  return (
    <div className="flex-1 flex flex-col items-center justify-start w-full relative pb-8 px-4 sm:px-0 pt-4 md:pt-6">
      
      {/* Filter System */}
      <div className="w-full max-w-xl mb-6 flex flex-col gap-3 z-20">
        <div className="flex overflow-x-auto md:flex-wrap md:justify-center hide-scrollbar gap-2 px-2 pb-1 snap-x">
          {FILTER_CATEGORIES.map(category => (
            <button
              key={category.name}
              onClick={() => setActiveFilter(category.name)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
                activeFilter === category.name 
                  ? "bg-bumble-yellow border-yellow-300 text-slate-950 shadow-[0_4px_12px_rgba(255,219,91,0.25)]" 
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex overflow-x-auto md:flex-wrap md:justify-center hide-scrollbar gap-2 px-2 pb-1 snap-x">
          {VIBE_CATEGORIES.map(vibe => (
            <button
              key={vibe}
              onClick={() => setActiveVibeFilter(vibe)}
              className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
                activeVibeFilter === vibe 
                  ? "bg-white/10 border-white/20 text-white" 
                  : "bg-white/0 border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {vibe}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container for Desktop split view */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full max-w-5xl items-stretch">
        
        {/* Left Column: Swiper Container */}
        <div className="col-span-1 md:col-span-6 flex flex-col items-center justify-center min-h-[500px]">
          <div className="relative w-full max-w-[340px] aspect-[3/4.2] flex items-center justify-center">
            <AnimatePresence>
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile, index) => {
                  const isTop = index === 0;
                  const quoteObj = getQuoteForAlcohol(profile.alcoholPreferences?.[0] || "");
                  
                  return (
                    <motion.div
                      key={profile.uid}
                      style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0, scale: isTop ? 1 : scale }}
                      drag={isTop ? "x" : false}
                      dragConstraints={{ left: -300, right: 300 }}
                      onDragEnd={(e, info) => {
                        if (info.offset.x > 120) {
                          handleSwipe("right", profile.uid);
                        } else if (info.offset.x < -120) {
                          handleSwipe("left", profile.uid);
                        }
                      }}
                      className="absolute w-full h-full bg-[#18181c] rounded-[28px] border border-white/10 overflow-hidden shadow-2xl flex flex-col cursor-grab active:cursor-grabbing origin-bottom"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, zIndex: filteredProfiles.length - index }}
                      exit={{ x: x.get() > 0 ? 300 : -300, opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    >
                      {/* Image Layer */}
                      <div className="relative flex-1 bg-slate-900 overflow-hidden">
                        <img 
                          src={profile.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} 
                          alt={profile.displayName} 
                          className="w-full h-full object-cover select-none pointer-events-none" 
                        />
                        
                        {/* Film Quote Overlay Container */}
                        <div className="absolute top-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                          <p className="text-[10px] italic font-medium text-bumble-yellow">"{quoteObj.quote}"</p>
                          <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 block">— {quoteObj.movie} ({quoteObj.alcoholTag})</span>
                        </div>

                        {/* Custom tags overlay */}
                        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1.5 pointer-events-none">
                          {profile.musicVibes?.slice(0, 1).map(v => (
                            <span key={v} className="bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-[9px] font-black uppercase text-white tracking-wider flex items-center gap-1">
                              <Music className="w-2.5 h-2.5" /> {v}
                            </span>
                          ))}
                          {profile.preferredPlaces?.slice(0, 1).map(p => (
                            <span key={p} className="bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-[9px] font-black uppercase text-white tracking-wider flex items-center gap-1">
                              <Home className="w-2.5 h-2.5" /> {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Info Panel */}
                      <div className="p-5 bg-gradient-to-b from-[#18181c] to-[#121214] border-t border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-black text-white">{profile.displayName}, {profile.age}</h4>
                            {profile.safetyVerified && (
                              <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border border-slate-900">
                                <CheckCircle2 className="w-3 h-3 text-slate-950 font-bold" />
                              </div>
                            )}
                          </div>
                          
                          {/* Match Compatibility Badge */}
                          <div className="bg-bumble-yellow/10 border border-bumble-yellow/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3 text-bumble-yellow fill-bumble-yellow/50" />
                            <span className="text-[10px] font-black text-bumble-yellow uppercase tracking-wider">
                              {calculateCompatibility(currentUserProfile, profile)}% Match
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{profile.bio}</p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center p-6 space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 text-slate-500">
                    <Ban className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-white">No Profiles Found</h4>
                  <p className="text-slate-400 text-xs">Try relaxing your filters to discover more peers in the lounge.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Swipe controls */}
          {filteredProfiles.length > 0 && (
            <div className="flex items-center gap-4 mt-6">
              <button 
                onClick={() => handleSwipe("left", currentActiveCard!.uid)}
                className="w-12 h-12 bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <Ban className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleSwipe("right", currentActiveCard!.uid)}
                className="w-14 h-14 bg-bumble-yellow hover:bg-bumble-yellow-hover text-slate-950 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl active:scale-95 hover:scale-105"
              >
                <Heart className="w-6 h-6 fill-slate-950/20" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Detailed Desktop Stats Dashboard (Hidden on mobile) */}
        <div className="hidden md:flex md:col-span-6 flex-col justify-start space-y-5 bg-white/5 p-6 rounded-[28px] border border-white/10 h-full">
          {currentActiveCard ? (
            <>
              <div>
                <h3 className="text-xs uppercase font-black tracking-widest text-slate-500 mb-1">Peers Dashboard</h3>
                <h2 className="text-2xl font-black text-white">Match Compatibility Profile</h2>
              </div>

              {/* Compatibility score breakdowns */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-slate-400">Match Breakdown</h4>
                
                {/* Drinks compatibility bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                    <span>Drinks Alignment</span>
                    <span>
                      {currentActiveCard.alcoholPreferences?.some(p => currentUserProfile?.alcoholPreferences?.includes(p)) ? "High" : "Low"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-bumble-yellow h-full" 
                      style={{ width: currentActiveCard.alcoholPreferences?.some(p => currentUserProfile?.alcoholPreferences?.includes(p)) ? "85%" : "30%" }} 
                    />
                  </div>
                </div>

                {/* Music vibes alignment */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                    <span>Music Alignment</span>
                    <span>
                      {currentActiveCard.musicVibes?.some(p => currentUserProfile?.musicVibes?.includes(p)) ? "Perfect Match" : "Good Vibe"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full" 
                      style={{ width: currentActiveCard.musicVibes?.some(p => currentUserProfile?.musicVibes?.includes(p)) ? "95%" : "60%" }} 
                    />
                  </div>
                </div>
              </div>

              {/* Preferences Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Wine className="w-3.5 h-3.5 text-bumble-yellow" /> Drinks Choice
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {currentActiveCard.alcoholPreferences?.map(p => (
                      <span key={p} className="bg-bumble-yellow/10 text-bumble-yellow px-2 py-0.5 rounded text-[9px] font-bold">{p}</span>
                    )) || "None"}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-bumble-yellow" /> Music Genre
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {currentActiveCard.musicVibes?.map(v => (
                      <span key={v} className="bg-white/10 text-white px-2 py-0.5 rounded text-[9px] font-bold">{v}</span>
                    )) || "None"}
                  </div>
                </div>
              </div>

              {/* Lounge Location preferences */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-bumble-yellow" /> Spot / Place Match
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentActiveCard.preferredPlaces?.map(p => (
                    <span key={p} className="bg-white/10 text-white px-2.5 py-1 rounded text-[9px] font-bold">{p}</span>
                  )) || "None"}
                </div>
              </div>

              {/* AI Desi Bartender Pairing recommendation */}
              <div className="bg-gradient-to-br from-bumble-yellow/5 to-amber-500/5 border border-bumble-yellow/20 rounded-2xl p-4 space-y-2">
                <span className="text-[9px] uppercase font-black text-bumble-yellow tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-bumble-yellow" /> Bartender Recommendation
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed italic">
                  "Based on {currentActiveCard.displayName}'s preference for {currentActiveCard.alcoholPreferences?.[0] || 'drinks'}, we recommend starting the happy hour conversation at a {currentActiveCard.preferredPlaces?.[0] || 'cafe'} with some {currentActiveCard.musicVibes?.[0] || 'beats'}!"
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-slate-500">
              <Ban className="w-10 h-10 mb-2" />
              <p className="text-xs">No active match selected.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
