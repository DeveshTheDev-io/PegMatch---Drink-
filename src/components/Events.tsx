import { useState } from "react";
import { MapPin, Users, Calendar, Plus, GlassWater } from "lucide-react";
import { motion } from "motion/react";

export function Events() {
  const [events] = useState([
    { id: 1, title: "Tech & Tequila", venue: "Toit Brewpub, Indiranagar", date: "Friday, 8:00 PM", attendees: 12, capacity: 20, image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80", tags: ["Startups", "Cocktails"] },
    { id: 2, title: "Old Monk Enthusiasts Meetup", venue: "Bob's Bar, Koramangala", date: "Saturday, 7:30 PM", attendees: 8, capacity: 15, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=80", tags: ["Rum", "Chill"] },
    { id: 3, title: "Sunday Sundowner", venue: "Windmills Craftworks", date: "Sunday, 4:00 PM", attendees: 24, capacity: 30, image: "https://images.unsplash.com/photo-1574629810360-7efbb6b0488e?auto=format&fit=crop&w=800&q=80", tags: ["Craft Beer", "Music"] },
  ]);

  return (
    <div className="flex flex-col h-full pt-2">
      <div className="flex justify-between items-center mb-8">
        <p className="text-slate-400 text-sm">Join curated group meetups nearby</p>
        <button className="bg-gradient-to-tr from-amber-500/20 to-orange-600/20 text-amber-500 p-3 rounded-2xl border border-amber-500/30 hover:scale-110 transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <Plus className="w-5 h-5 drop-shadow-md" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
        {events.map((event, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15, type: "spring", damping: 20 }}
            key={event.id} 
            className="bg-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/10 flex flex-col p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:border-white/20 transition-all group hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] h-full"
          >
            <div className="h-48 relative rounded-[24px] overflow-hidden mb-5 shadow-inner">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/40 to-transparent" />
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-white shadow-lg">
                <Users className="w-4 h-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                {event.attendees}/{event.capacity}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="flex flex-wrap gap-2 mb-4">
                {event.tags.map(tag => (
                  <span key={tag} className="text-[9px] uppercase tracking-widest font-black text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
              
              <h3 className="text-2xl font-black text-white mb-4 tracking-wide">{event.title}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-300 text-sm bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Calendar className="w-4 h-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                  </div>
                  <span className="font-bold">{event.date}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <MapPin className="w-4 h-4 text-orange-500 drop-shadow-[0_0_8px_rgba(234,88,12,0.3)]" />
                  </div>
                  <span className="font-bold truncate">{event.venue}</span>
                </div>
              </div>

              <button className="w-full mt-auto py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl text-xs font-black tracking-widest uppercase transition-all shadow-[0_5px_15px_rgba(245,158,11,0.3)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.5)] hover:scale-[1.02] flex justify-center items-center gap-2">
                <GlassWater className="w-4 h-4 drop-shadow-md" />
                Request to Join
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
