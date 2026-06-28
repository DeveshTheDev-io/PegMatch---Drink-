import { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { Video, CalendarDays, Search } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { motion } from "motion/react";

interface Props {
  currentUser: any;
}

export function Matches({ currentUser }: Props) {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

  // Mocking matches for UI display
  useEffect(() => {
    setMatches([
      { id: "1", user: { displayName: "Priya", photoURL: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=150&q=80", availability: "Available" }, lastMessage: "Let's meet at Socials tonight?", time: "2m ago", unread: 2 },
      { id: "2", user: { displayName: "Vikram", photoURL: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", availability: "Busy" }, lastMessage: "Haha yes, Kingfisher is the best.", time: "1h ago", unread: 0 },
      { id: "3", user: { displayName: "Neha", photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", availability: "Looking for plans" }, lastMessage: "Table booked for 8 PM!", time: "Yesterday", unread: 0 },
    ]);
  }, []);

  return (
    <div className="flex flex-col h-full pt-2">
      <div className="mb-6 relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Search matches..." 
          className="w-full bg-white/5 backdrop-blur-xl border border-white/10 text-sm rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 text-slate-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] transition-all"
        />
      </div>

      <div className="mb-8">
        <h3 className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em]">New Matches</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {matches.map((match, idx) => (
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
                  <div className="w-full h-full rounded-full overflow-hidden border border-black/50">
                    <img src={match.user.photoURL} alt={match.user.displayName} className="w-full h-full object-cover" />
                  </div>
                </div>
                {match.user.availability === 'Available' && <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0A0A0C] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
              </div>
              <span className="text-xs font-bold text-slate-300 tracking-wide">{match.user.displayName}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em]">Messages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.3, type: "spring" }}
              key={match.id} 
              onClick={() => setSelectedMatch(match)} 
              className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-xl group"
            >
              <div className="relative shrink-0">
                <img src={match.user.photoURL} alt={match.user.displayName} className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover shadow-lg" />
                {match.user.availability === 'Available' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0A0A0C] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-white text-sm md:text-base truncate">{match.user.displayName}</h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{match.time}</span>
                </div>
                <p className={`text-xs md:text-sm truncate ${match.unread > 0 ? 'text-slate-200 font-bold' : 'text-slate-400'}`}>
                  {match.lastMessage}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                {match.unread > 0 ? (
                  <div className="w-5 h-5 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-[0_2px_8px_rgba(245,158,11,0.4)] text-[10px] font-black flex items-center justify-center rounded-full">
                    {match.unread}
                  </div>
                ) : <div className="h-5" />}
                
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-white/5 text-slate-300 rounded-full hover:bg-amber-500/20 hover:text-amber-500 border border-transparent hover:border-amber-500/30 transition-all">
                    <Video className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-2 bg-white/5 text-slate-300 rounded-full hover:bg-amber-500/20 hover:text-amber-500 border border-transparent hover:border-amber-500/30 transition-all">
                    <CalendarDays className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {selectedMatch && (
        <ChatWindow 
          currentUser={currentUser} 
          matchUser={selectedMatch} 
          onBack={() => setSelectedMatch(null)} 
        />
      )}
    </div>
  );
}
