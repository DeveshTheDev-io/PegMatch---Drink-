import { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where, addDoc, doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { X, Heart, Wine, Cigarette, Filter, Zap } from "lucide-react";

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
  if (!user1) return 0; // Don't show score if not logged in or profile not loaded
  
  let score = 40; // Base score
  
  const mutualAlcohol = user2.alcoholPreferences?.filter(p => user1.alcoholPreferences?.includes(p)) || [];
  score += mutualAlcohol.length * 15;
  
  const mutualSmoke = user2.smokePreferences?.filter(p => user1.smokePreferences?.includes(p)) || [];
  score += mutualSmoke.length * 10;
  
  if (user1.availability === user2.availability) {
    score += 15;
  }
  
  return Math.min(score, 99); // Max 99%
}

export function Discover({ currentUser }: Props) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const [activeVibeFilter, setActiveVibeFilter] = useState("Any Vibe");

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        let fetched: UserProfile[] = [];
        if (currentUser) {
          const userDocSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (userDocSnap.exists()) {
            setCurrentUserProfile(userDocSnap.data() as UserProfile);
          }

          const q = query(collection(db, "users"), where("uid", "!=", currentUser.uid));
          const snapshot = await getDocs(q);
          fetched = snapshot.docs.map(doc => doc.data() as UserProfile);
        }
        
        // Mock data if no one else is on the platform yet for demonstration.
        if (fetched.length === 0) {
          fetched.push(
            { uid: "mock1", displayName: "Aarohi", age: 24, gender: "Female", bio: "Let's grab a beer and talk about startups.", alcoholPreferences: ["Bira 91", "Magic Moments"], smokePreferences: ["Non-smoker"], photoURL: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=400&q=80", availability: "Available", safetyVerified: true, createdAt: 0, vibes: ["Chilled Out", "Deep Conversations"] },
            { uid: "mock2", displayName: "Rohan", age: 27, gender: "Male", bio: "Weekend Old Monk enthusiast. Looking for a plus one for standup comedy.", alcoholPreferences: ["Old Monk", "Blenders Pride"], smokePreferences: ["Classic Milds"], photoURL: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80", availability: "Looking for plans", safetyVerified: false, createdAt: 0, vibes: ["Live Music Enthusiast", "Weekend Warrior"] },
            { uid: "mock3", displayName: "Simran", age: 26, gender: "Female", bio: "Wine and dine. Seeking good conversations.", alcoholPreferences: ["Sula Wines"], smokePreferences: ["Vape/Juul"], photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", availability: "Busy", safetyVerified: true, createdAt: 0, vibes: ["Artisanal Cocktail Explorer", "Deep Conversations"] }
          );
        }
        
        setProfiles(fetched);
      } catch (error) {
        console.error("Error fetching profiles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [currentUser]);

  const handleSwipe = async (direction: "left" | "right", targetUid: string) => {
    setProfiles(prev => prev.filter(p => p.uid !== targetUid));
    if (!currentUser) return; // Do not save swipe if not logged in
    
    try {
      await addDoc(collection(db, "swipes"), {
        fromUserId: currentUser.uid,
        toUserId: targetUid,
        action: direction === "right" ? "like" : "pass",
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error saving swipe", error);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center pt-32"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const filteredProfiles = profiles.filter(profile => {
    // Drink filter
    let matchesDrink = true;
    if (activeFilter !== "All") {
      const category = FILTER_CATEGORIES.find(c => c.name === activeFilter);
      if (category) {
        matchesDrink = profile.alcoholPreferences?.some(pref => category.preferences.includes(pref)) ?? false;
      }
    }
    
    // Vibe filter
    let matchesVibe = true;
    if (activeVibeFilter !== "Any Vibe") {
      matchesVibe = profile.vibes?.includes(activeVibeFilter) ?? false;
    }
    
    return matchesDrink && matchesVibe;
  });

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full relative pb-8 px-4 sm:px-0 pt-4 md:pt-12">
      
      {/* Filter System */}
      <div className="w-full max-w-md lg:max-w-xl mb-4 flex flex-col gap-3 z-20">
        <div className="flex overflow-x-auto md:flex-wrap md:justify-center hide-scrollbar gap-2 px-2 pb-1 snap-x">
          {FILTER_CATEGORIES.map(category => (
            <button
              key={category.name}
              onClick={() => setActiveFilter(category.name)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all snap-start shrink-0 border shadow-lg ${
                activeFilter === category.name 
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white border-transparent shadow-[0_5px_15px_rgba(245,158,11,0.4)] scale-105' 
                  : 'bg-white/5 backdrop-blur-md text-slate-400 border-white/10 hover:bg-white/10 hover:text-white shadow-none'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="flex overflow-x-auto md:flex-wrap md:justify-center hide-scrollbar gap-2 px-2 pb-2 snap-x">
          {VIBE_CATEGORIES.map(vibe => (
            <button
              key={vibe}
              onClick={() => setActiveVibeFilter(vibe)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all snap-start shrink-0 border ${
                activeVibeFilter === vibe 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                  : 'bg-transparent text-slate-500 border-slate-800 hover:bg-white/5 hover:text-slate-300'
              }`}
            >
              {vibe}
            </button>
          ))}
        </div>
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center pt-12 px-6 w-full max-w-md">
          <Filter className="w-16 h-16 text-slate-800 mb-6" />
          <h3 className="text-2xl font-black mb-2 text-white">No matches found</h3>
          <p className="text-slate-400 max-w-xs">No profiles found for your selected filters. Try broadening your preferences or check back later.</p>
        </div>
      ) : (
        <div className="relative w-full max-w-md lg:max-w-[420px] aspect-[3/4] min-h-[450px] max-h-[65vh]" style={{ perspective: 1000 }}>
          <AnimatePresence>
            <motion.div
              key={filteredProfiles[0].uid}
              style={{ x, rotate, scale }}
              initial={{ opacity: 0, y: 50, rotateX: 10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                const swipeThreshold = 100;
                if (offset.x > swipeThreshold) handleSwipe("right", filteredProfiles[0].uid);
                else if (offset.x < -swipeThreshold) handleSwipe("left", filteredProfiles[0].uid);
              }}
              className="absolute inset-0 bg-slate-900 rounded-[32px] sm:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 group cursor-grab active:cursor-grabbing"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${filteredProfiles[0].photoURL || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col justify-end h-full pointer-events-none">
                <div className="flex items-end justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-4xl font-black text-white leading-none">{filteredProfiles[0].displayName}, {filteredProfiles[0].age}</h2>
                      {filteredProfiles[0].safetyVerified && (
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" title="Verified">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${filteredProfiles[0].availability === 'Available' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : filteredProfiles[0].availability === 'Busy' ? 'bg-rose-500' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-300">{filteredProfiles[0].availability}</span>
                    </div>
                  </div>
                  
                  {currentUserProfile && (
                    <div className="flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10 shrink-0 shadow-xl mb-1">
                      <div className="flex items-center gap-1 text-amber-500 font-black text-xl">
                        <Zap className="w-4 h-4 fill-amber-500" />
                        {calculateCompatibility(currentUserProfile, filteredProfiles[0])}%
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Match</span>
                    </div>
                  )}
                </div>
                
                <p className="text-slate-300 text-base mb-6 line-clamp-3">
                  "{filteredProfiles[0].bio}"
                </p>

                <div className="flex flex-wrap gap-2 mb-8 max-h-[80px] overflow-y-auto hide-scrollbar pointer-events-auto">
                  {filteredProfiles[0].vibes?.map(vibe => (
                    <span key={vibe} className="px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span> {vibe}
                    </span>
                  ))}
                  {filteredProfiles[0].alcoholPreferences?.map(pref => (
                    <span key={pref} className="px-3 py-1.5 bg-black/40 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0 text-slate-200">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> {pref}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4 pointer-events-auto mt-auto">
                   <button 
                     onClick={() => handleSwipe("left", filteredProfiles[0].uid)}
                     className="flex-[1] h-14 bg-black/40 backdrop-blur-xl hover:bg-black/60 border border-white/10 rounded-2xl flex items-center justify-center font-bold text-xs uppercase tracking-widest transition-all text-slate-300"
                   >
                     Pass
                   </button>
                   <button 
                     onClick={() => handleSwipe("right", filteredProfiles[0].uid)}
                     className="flex-[2] h-14 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center font-black text-sm tracking-widest text-white shadow-[0_10px_25px_-5px_rgba(234,88,12,0.5)] hover:scale-[1.02] transition-transform uppercase"
                   >
                     Cheers!
                   </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
