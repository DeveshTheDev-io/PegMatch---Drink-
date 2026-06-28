import { auth } from "../lib/firebase";
import { UserProfile } from "../types";
import { LogOut, ShieldCheck, Settings, MapPin, Wine, Cigarette, Edit3, UserCircle2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { VerificationScreen } from "./VerificationScreen";
import { SpiritGuide } from "./SpiritGuide";
import { RadarComparisonWidget } from "./RadarComparisonWidget";
import { FoodPairingsWidget } from "./FoodPairingsWidget";
import { motion } from "motion/react";

interface Props {
  currentUser: any;
}

export function Profile({ currentUser }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const fetchProfile = async () => {
      const docSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
    };
    fetchProfile();
  }, [currentUser]);

  const toggleAvailability = async () => {
    if (!profile || !currentUser) return;
    const states = ["Available", "Looking for plans", "Busy"];
    const currentIndex = states.indexOf(profile.availability);
    const nextState = states[(currentIndex + 1) % states.length];
    
    setProfile({ ...profile, availability: nextState as any });
    await updateDoc(doc(db, "users", currentUser.uid), { availability: nextState });
  };

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Auth error", error);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center pt-32 px-6">
        <UserCircle2 className="w-20 h-20 text-zinc-800 mb-6" />
        <h3 className="text-2xl font-semibold mb-2">Create a Profile</h3>
        <p className="text-zinc-500 mb-8 max-w-sm">Join the community to setup your profile, connect with others, and discover events.</p>
        <button 
          onClick={handleSignIn}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-orange-600/30 hover:scale-105 transition-transform"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col h-full pt-2">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: "spring" }} className="flex justify-center mb-6 relative">
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)] overflow-hidden bg-slate-800">
            <img src={profile.photoURL || 'https://via.placeholder.com/150'} alt={profile.displayName} className="w-full h-full object-cover" />
          </div>
          <button className="absolute bottom-1 right-1 md:bottom-2 md:right-2 p-2.5 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-full text-white border-2 border-[#0A0A0C] shadow-xl hover:scale-110 transition-transform">
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="text-center mb-10">
        <div className="flex justify-center items-center gap-2 mb-2">
          <h3 className="text-3xl font-black font-sans tracking-tight">{profile.displayName}, {profile.age}</h3>
          {profile.safetyVerified && <ShieldCheck className="w-6 h-6 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
        </div>
        <button 
          onClick={toggleAvailability}
          className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
        >
          <div className={`w-2 h-2 rounded-full shadow-lg ${profile.availability === 'Available' ? 'bg-emerald-500 shadow-emerald-500/50' : profile.availability === 'Busy' ? 'bg-rose-500 shadow-rose-500/50' : 'bg-amber-500 shadow-amber-500/50'}`} />
          {profile.availability}
        </button>
      </motion.div>

      <div className="space-y-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-xl h-full">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3 flex items-center gap-2"><UserCircle2 className="w-4 h-4" /> About Me</h4>
            <p className="text-slate-300 text-sm leading-relaxed">{profile.bio}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-xl h-full">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-4">Preferences</h4>
            
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-bold uppercase tracking-wider">
                <Wine className="w-4 h-4" /> Drinks
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.alcoholPreferences?.map(p => (
                  <span key={p} className="px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl text-[11px] font-bold tracking-wide">{p}</span>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-bold uppercase tracking-wider">
                <Cigarette className="w-4 h-4" /> Smokes
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.smokePreferences?.map(p => (
                  <span key={p} className="px-4 py-2 bg-white/5 text-slate-300 border border-white/10 rounded-xl text-[11px] font-bold tracking-wide">{p}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RadarComparisonWidget profile={profile} />
          <FoodPairingsWidget profile={profile} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="space-y-4">
          <button className="w-full flex items-center justify-between p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl transition-all group">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-amber-500/20 group-hover:text-amber-500 transition-colors">
                <Settings className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
              </div>
              <span className="font-bold tracking-wide">Settings</span>
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl transition-all group">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-amber-500/20 group-hover:text-amber-500 transition-colors">
                <MapPin className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
              </div>
              <span className="font-bold tracking-wide">Discovery Preferences</span>
            </div>
          </button>
          
          <button 
            onClick={() => setGuideOpen(true)}
            className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-amber-500/10 to-orange-600/10 backdrop-blur-md rounded-3xl border border-amber-500/20 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(245,158,11,0.15)] transition-all group"
          >
            <div className="flex items-center gap-4 text-amber-500">
              <div className="p-3 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-colors border border-amber-500/20">
                <Sparkles className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              </div>
              <span className="font-black uppercase tracking-widest text-xs drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">Explore Spirit Guide</span>
            </div>
          </button>
          
          {!profile.safetyVerified && (
            <button 
              onClick={() => setVerificationOpen(true)}
              className="w-full flex items-center justify-between p-5 bg-emerald-500/10 backdrop-blur-md rounded-3xl border border-emerald-500/20 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(16,185,129,0.15)] transition-all group"
            >
              <div className="flex items-center gap-4 text-emerald-500">
                <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <span className="font-black uppercase tracking-widest text-xs drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">Get Verified</span>
              </div>
            </button>
          )}

          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center justify-center p-5 bg-white/5 backdrop-blur-md text-rose-500 font-black rounded-3xl hover:-translate-y-1 hover:shadow-xl hover:bg-rose-500/10 transition-all mt-6 border border-rose-500/20 group"
          >
            <LogOut className="w-5 h-5 mr-3 group-hover:drop-shadow-[0_0_8px_rgba(243,62,118,0.5)]" /> <span className="uppercase tracking-widest text-xs">Sign Out</span>
          </button>
        </motion.div>
      </div>

      {verificationOpen && (
        <VerificationScreen 
          currentUser={currentUser} 
          onClose={() => setVerificationOpen(false)} 
          onSuccess={() => {
            setProfile({ ...profile, safetyVerified: true });
            setVerificationOpen(false);
          }} 
        />
      )}

      {guideOpen && (
        <SpiritGuide 
          currentUser={currentUser}
          onClose={() => setGuideOpen(false)}
          onUpdate={(prefs) => setProfile({ ...profile, alcoholPreferences: prefs })}
        />
      )}
    </div>
  );
}
