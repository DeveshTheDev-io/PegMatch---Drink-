import { useState, useEffect } from "react";
import { Sparkles, Utensils, Loader2 } from "lucide-react";
import { UserProfile } from "../types";
import { motion } from "motion/react";

interface Props {
  profile: UserProfile;
}

export function FoodPairingsWidget({ profile }: Props) {
  const [pairings, setPairings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPairings = async () => {
      if (!profile.alcoholPreferences || profile.alcoholPreferences.length === 0) return;
      
      setLoading(true);
      try {
        const response = await fetch("/api/gemini/pairings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            preferences: profile.alcoholPreferences
          }),
        });
        const data = await response.json();
        if (data.pairings) {
          setPairings(data.pairings);
        }
      } catch (error) {
        console.error("Failed to generate pairings", error);
      }
      setLoading(false);
    };

    fetchPairings();
  }, [profile.alcoholPreferences]);

  if (!profile.alcoholPreferences || profile.alcoholPreferences.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 p-6 rounded-[32px] border border-amber-500/20 backdrop-blur-xl relative overflow-hidden shadow-[0_10px_30px_-10px_rgba(245,158,11,0.2)] hover:-translate-y-1 hover:shadow-[0_15px_35px_-10px_rgba(245,158,11,0.3)] transition-all h-full flex flex-col"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 blur-[40px] rounded-full pointer-events-none -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-600/20 blur-[40px] rounded-full pointer-events-none -ml-10 -mb-10" />
      
      <div className="flex justify-between items-start mb-5 relative z-10">
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-amber-500 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
          <Utensils className="w-4 h-4" /> Expand the Palate
        </h4>
        <Sparkles className="w-4 h-4 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-amber-500/70 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Curating culinary matches...</span>
          </div>
        ) : pairings.length > 0 ? (
          <ul className="space-y-3">
            {pairings.map((pairing, idx) => (
              <li key={idx} className="text-sm text-slate-300 leading-relaxed flex gap-2">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: pairing.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-400 font-bold">$1</strong>') }} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">No pairings generated yet.</p>
        )}
      </div>
    </motion.div>
  );
}
