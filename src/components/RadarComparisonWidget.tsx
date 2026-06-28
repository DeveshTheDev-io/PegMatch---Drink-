import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { motion } from 'motion/react';

interface Props {
  profile: UserProfile;
}

const ALL_CATEGORIES = [
  "Single Malt",
  "Gin",
  "Rum",
  "Wine",
  "Craft Beer",
  "Vodka",
  "Tequila",
];

export function RadarComparisonWidget({ profile }: Props) {
  // We'll mock a match's preferences for the sake of comparison in the user profile view
  const matchPrefs = ["Gin", "Wine", "Craft Beer", "Tequila"];
  const userPrefs = profile.alcoholPreferences || [];

  const data = ALL_CATEGORIES.map(category => {
    return {
      category,
      You: userPrefs.some(p => p.includes(category) || category.includes(p)) ? 100 : 20,
      Match: matchPrefs.some(p => p.includes(category) || category.includes(p)) ? 100 : 20,
    };
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:bg-white/10 transition-all hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.1)] hover:-translate-y-1 h-full flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-amber-500 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Spirit Compatibility
        </h4>
      </div>
      
      <div className="text-xs text-slate-300 mb-6 leading-relaxed font-medium">
        Comparing your flavor profile against your most recent match. Expand your palate to increase compatibility!
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="You" dataKey="You" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
            <Radar name="Match" dataKey="Match" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(10, 10, 12, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ fontSize: '12px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
