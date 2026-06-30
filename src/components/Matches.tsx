import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { Video, CalendarDays, Search } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { getSupabaseClient } from "../lib/supabase";
import { motion } from "motion/react";

interface Props {
  currentUser: any;
}

export function Matches({ currentUser }: Props) {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMatches = async () => {
    try {
      const supabaseClient = getSupabaseClient();
      const currentId = currentUser.uid || currentUser.id;
      const { data } = await supabaseClient
        .from("matches")
        .select("*");
      
      if (data) {
        const userMatches = data.filter((m: any) => m.user_1 === currentId || m.user_2 === currentId);
        
        const results = await Promise.all(userMatches.map(async (m: any) => {
          const targetId = m.user_1 === currentId ? m.user_2 : m.user_1;
          const { data: profile } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", targetId)
            .maybeSingle();
            
          return {
            id: m.id,
            user: profile ? {
              displayName: profile.display_name,
              photoURL: profile.photo_url,
              availability: profile.availability || "Available",
              alcoholPreferences: profile.alcohol_preferences || []
            } : { displayName: "Lounge Member", photoURL: "", availability: "Available", alcoholPreferences: [] },
            lastMessage: "Tap to open chat room",
            time: "Active",
            unread: 0
          };
        }));

        if (results.length === 0) {
          setMatches([
            { id: "mock-m1", user: { displayName: "Priya", photoURL: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=150&q=80", availability: "Available", alcoholPreferences: ["Bira 91", "Kingfisher"] }, lastMessage: "Let's meet at Socials tonight?", time: "2m ago", unread: 2 },
            { id: "mock-m2", user: { displayName: "Vikram", photoURL: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", availability: "Busy", alcoholPreferences: ["Old Monk"] }, lastMessage: "Haha yes, Kingfisher is the best.", time: "1h ago", unread: 0 },
            { id: "mock-m3", user: { displayName: "Neha", photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", availability: "Looking for plans", alcoholPreferences: ["Sula Wines"] }, lastMessage: "Table booked for 8 PM!", time: "Yesterday", unread: 0 },
          ]);
        } else {
          setMatches(results);
        }
      }
    } catch (err) {
      console.error("Failed to load matches", err);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [currentUser]);

  const filteredMatches = matches.filter(m => 
    m.user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedMatch) {
    return (
      <ChatWindow 
        currentUser={currentUser}
        matchUser={selectedMatch}
        onBack={() => {
          setSelectedMatch(null);
          fetchMatches();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full pt-2">
      <div className="mb-6 relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Search matches..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 backdrop-blur-xl border border-white/10 text-sm rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 text-slate-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] transition-all"
        />
      </div>

      <div className="mb-8">
        <h3 className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em]">New Matches</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {filteredMatches.map((match, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, type: "spring" }}
              key={match.id + '-new'} 
              className="flex flex-col items-center gap-3 min-w-[80px] cursor-pointer hover:scale-110 transition-transform snap-start" 
              onClick={() => setSelectedMatch(match)}
            >
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 p-[2px] shadow-[0_4px_15px_rgba(245,158,11,0.3)]">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-black">
                    <img src={match.user.photoURL} alt={match.user.displayName} className="w-full h-full object-cover" />
                  </div>
                </div>
                {match.user.availability === 'Available' && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-300 tracking-wide text-center truncate w-16">{match.user.displayName}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em]">Active Conversations</h3>
        <div className="space-y-3">
          {filteredMatches.map((match) => (
            <div 
              key={match.id} 
              onClick={() => setSelectedMatch(match)}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-[24px] hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={match.user.photoURL} alt={match.user.displayName} className="w-14 h-14 rounded-full object-cover border border-white/10" />
                  {match.user.availability === 'Available' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#121214] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-amber-500 transition-colors text-sm">{match.user.displayName}</h4>
                  <p className="text-xs text-slate-400 truncate w-48 mt-0.5">{match.lastMessage}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{match.time}</span>
                {match.unread > 0 && (
                  <span className="w-5 h-5 bg-amber-500 text-slate-950 font-black rounded-full flex items-center justify-center text-[9px] shadow-[0_4px_10px_rgba(245,158,11,0.4)]">{match.unread}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
