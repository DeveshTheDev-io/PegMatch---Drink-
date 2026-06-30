import { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { getSupabaseClient } from "../lib/supabase";
import { X, Check, Sparkles, Flame, Droplets } from "lucide-react";

interface Spirit {
  id: string;
  name: string;
  category: string;
  profile: string;
  description: string;
  tags: string[];
}

const TRENDING_SPIRITS: Spirit[] = [
  {
    id: "amrut_fusion",
    name: "Amrut Fusion",
    category: "Single Malt",
    profile: "Oak, Vanilla, Gentle Smoke",
    description: "A flagship Indian single malt bridging Eastern and Western traditions with a complex, peaty finish.",
    tags: ["Amrut", "Single Malt", "Smoky"]
  },
  {
    id: "paul_john_brilliance",
    name: "Paul John Brilliance",
    category: "Single Malt",
    profile: "Honey, Cinnamon, Cocoa",
    description: "A non-peated Goan single malt offering a sweet, rich, and intensely fruity experience.",
    tags: ["Paul John", "Single Malt", "Sweet"]
  },
  {
    id: "jaisalmer_gin",
    name: "Jaisalmer Craft Gin",
    category: "Gin",
    profile: "Juniper, Coriander, Vetiver",
    description: "A triple-distilled gin infused with traditional Indian botanicals like Darjeeling green tea and lemongrass.",
    tags: ["Gin", "Botanical", "Citrus"]
  },
  {
    id: "maka_zai",
    name: "Maka Zai Gold",
    category: "Rum",
    profile: "Caramel, Vanilla, Spice",
    description: "A premium artisanal craft rum from Goa with a rich, oak-aged character.",
    tags: ["Rum", "Aged", "Spiced"]
  },
  {
    id: "sula_dindori",
    name: "Sula Dindori Reserve",
    category: "Wine",
    profile: "Dark Fruit, Spice, Oak",
    description: "A bold, full-bodied Shiraz aged in oak barrels, perfect for pairing with spicy Indian dishes.",
    tags: ["Sula Wines", "Red Wine", "Bold"]
  },
  {
    id: "bira_white",
    name: "Bira 91 White",
    category: "Craft Beer",
    profile: "Citrus, Coriander, Wheat",
    description: "A deliciously different wheat beer with low bitterness and a hint of spicy citrus.",
    tags: ["Bira 91", "Beer", "Refreshing"]
  }
];

interface Props {
  currentUser: any;
  onClose: () => void;
  onUpdate: (prefs: string[]) => void;
}

export function SpiritGuide({ currentUser, onClose, onUpdate }: Props) {
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const supabaseClient = getSupabaseClient();

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        const { data } = await supabaseClient
          .from("profiles")
          .select("alcohol_preferences")
          .eq("id", currentUser.uid || currentUser.id)
          .maybeSingle();
        if (data) {
          setPreferences(data.alcohol_preferences || []);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [currentUser]);

  const toggleSpirit = async (spiritName: string) => {
    const updated = preferences.includes(spiritName)
      ? preferences.filter(p => p !== spiritName)
      : [...preferences, spiritName];
      
    setPreferences(updated);
    onUpdate(updated);

    if (currentUser) {
      await supabaseClient
        .from("profiles")
        .update({ alcohol_preferences: updated })
        .eq("id", currentUser.uid || currentUser.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-bumble-slate flex flex-col pt-12 pb-8 px-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-bumble-yellow" />
            Desi Spirit Guide
          </h2>
          <p className="text-slate-400 text-sm mt-1">Discover trending Indian crafts & select your vibe</p>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative z-10 space-y-4 pb-20 max-w-xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-bumble-yellow border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          TRENDING_SPIRITS.map((spirit) => {
            const isSelected = preferences.some(p => spirit.tags.includes(p) || p === spirit.name || spirit.tags.some(t => p.includes(t)));
            
            return (
              <div 
                key={spirit.id} 
                className={`p-5 rounded-[24px] border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-bumble-yellow/10 border-bumble-yellow/50 shadow-[0_0_30px_rgba(255,219,91,0.1)]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => toggleSpirit(spirit.tags[0])}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-bumble-yellow mb-1 block">
                      {spirit.category}
                    </span>
                    <h3 className="text-xl font-black text-white">{spirit.name}</h3>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                    isSelected ? 'bg-bumble-yellow border-bumble-yellow text-slate-950' : 'border-white/20 text-transparent'
                  }`}>
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-bumble-yellow" />
                  <span className="text-sm font-bold text-slate-300">{spirit.profile}</span>
                </div>
                
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  {spirit.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {spirit.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-full text-[10px] font-bold text-slate-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

