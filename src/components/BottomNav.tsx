import { Flame, MessageCircle, CalendarDays, UserCircle, Shield } from "lucide-react";

interface Props {
  currentTab: string;
  setTab: (tab: string) => void;
  isAdmin?: boolean;
}

export function BottomNav({ currentTab, setTab, isAdmin }: Props) {
  const tabs = [
    { id: "discover", icon: Flame, label: "Discover" },
    { id: "matches", icon: MessageCircle, label: "Matches" },
    { id: "events", icon: CalendarDays, label: "Events" },
    { id: "profile", icon: UserCircle, label: "Profile" },
    ...(isAdmin ? [{ id: "admin", icon: Shield, label: "Admin" }] : [])
  ];

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-bumble-slate/85 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full px-6 h-16 flex items-center w-full max-w-sm justify-between pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 relative px-2 py-1 cursor-pointer ${
                isActive ? "text-bumble-yellow scale-110" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {isActive && (
                <div className="absolute -top-4 w-10 h-1 bg-bumble-yellow rounded-b-full shadow-[0_4px_12px_rgba(255,219,91,0.6)]" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'fill-bumble-yellow/20' : ''} drop-shadow-md`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100 drop-shadow-[0_0_8px_#ffdb5b]' : 'opacity-70'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}


