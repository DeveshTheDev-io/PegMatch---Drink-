import { useEffect, useState } from "react";
import { getSupabaseClient } from "./lib/supabase";
import { ProfileSetup } from "./components/ProfileSetup";
import { BottomNav } from "./components/BottomNav";
import { Discover } from "./components/Discover";
import { Matches } from "./components/Matches";
import { Events } from "./components/Events";
import { Profile } from "./components/Profile";
import { LandingPage } from "./components/LandingPage";
import { AuthContainer } from "./components/AuthContainer";
import { AdminPanel } from "./components/AdminPanel";
import { Flame, MessageCircle, CalendarDays, UserCircle, Shield, X } from "lucide-react";
import { getRandomQuote } from "./lib/quotes";

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [currentTab, setCurrentTab] = useState("discover");
  const [dailyQuote, setDailyQuote] = useState(getRandomQuote());
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const supabaseClient = getSupabaseClient();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event: string, session: any) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        // Predefined Admin doesn't need to complete a profile
        if (currentUser.email === "admin@pegmatch.com") {
          setProfileComplete(true);
          setCurrentTab("admin");
          setLoading(false);
          return;
        }

        try {
          const { data: profile, error } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (profile && profile.display_name) {
            setProfileComplete(true);
          } else {
            setProfileComplete(false);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfileComplete(false);
        }
      } else {
        setProfileComplete(false);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    setProfileComplete(false);
    setCurrentTab("discover");
  };

  if (loading) {
    return <div className="min-h-screen bg-bumble-slate flex items-center justify-center" />;
  }

  const isAdmin = user?.email === "admin@pegmatch.com";

  if (!user) {
    return (
      <div className="min-h-screen bg-bumble-slate text-slate-100 flex flex-col relative overflow-hidden font-sans">
        {/* Film Quote Banner */}
        <div className="bg-bumble-yellow text-slate-900 px-4 py-2.5 text-center text-xs font-semibold relative z-30 shadow-md flex flex-wrap items-center justify-center gap-2 border-b border-yellow-400">
          <span className="bg-slate-900 text-bumble-yellow px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider">
            Filmy Vibe
          </span>
          <span className="italic font-bold">"{dailyQuote.quote}"</span>
          <span className="font-extrabold opacity-75">— {dailyQuote.movie}</span>
        </div>
        
        {/* Header Navigation */}
        <header className="relative z-30 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-bumble-slate/60 backdrop-blur-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-bumble-yellow rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,219,91,0.25)] border border-yellow-300/20">
              <span className="text-2xl font-black text-slate-900">P</span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">
              PegMatch <span className="text-[10px] tracking-widest uppercase text-bumble-yellow ml-1 hidden sm:inline">Desi Lounge</span>
            </h1>
          </div>
          <button 
            onClick={() => setAuthModalOpen(true)}
            className="bg-bumble-yellow hover:bg-bumble-yellow-hover text-slate-950 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
          >
            Sign In
          </button>
        </header>

        <LandingPage onSignIn={() => setAuthModalOpen(true)} />

        {/* Auth Modal Overlay */}
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="absolute top-6 right-6 z-50">
              <button 
                onClick={() => setAuthModalOpen(false)}
                className="p-3 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <AuthContainer onAuthSuccess={() => setAuthModalOpen(false)} />
          </div>
        )}
      </div>
    );
  }

  if (user && !profileComplete) {
    return <ProfileSetup user={user} onComplete={() => setProfileComplete(true)} />;
  }

  const tabs = [
    { id: "discover", icon: Flame, label: "Discover" },
    { id: "matches", icon: MessageCircle, label: "Matches" },
    { id: "events", icon: CalendarDays, label: "Events" },
    { id: "profile", icon: UserCircle, label: "Profile" },
    ...(isAdmin ? [{ id: "admin", icon: Shield, label: "Admin" }] : [])
  ];

  return (
    <div className="min-h-screen bg-bumble-slate text-slate-100 flex flex-col relative overflow-hidden font-sans selection:bg-bumble-yellow/30">
      {/* Film Quote Banner */}
      <div className="bg-bumble-yellow text-slate-900 px-4 py-2.5 text-center text-xs font-semibold relative z-30 shadow-md flex flex-wrap items-center justify-center gap-2 border-b border-yellow-400">
        <span className="bg-slate-950 text-bumble-yellow px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider">
          Filmy Vibe
        </span>
        <span className="italic font-bold">"{dailyQuote.quote}"</span>
        <span className="font-extrabold opacity-75">— {dailyQuote.movie}</span>
        <button 
          onClick={() => setDailyQuote(getRandomQuote())}
          className="ml-2 text-[10px] underline hover:text-black font-bold uppercase cursor-pointer"
        >
          Next Quote 🥂
        </button>
      </div>

      {/* Header Navigation */}
      <header className="relative z-30 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-bumble-slate/60 backdrop-blur-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-bumble-yellow rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,219,91,0.25)] border border-yellow-300/20">
            <span className="text-2xl font-black text-slate-900">P</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white">
            PegMatch <span className="text-[10px] tracking-widest uppercase text-bumble-yellow ml-1 hidden sm:inline">Desi Lounge</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-bumble-yellow/10 border border-bumble-yellow/30 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-bumble-yellow rounded-full animate-pulse shadow-[0_0_8px_#ffdb5b]" />
            <span className="text-xs font-bold text-bumble-yellow hidden sm:inline">
              {isAdmin ? "Lounge Moderator" : "Lounge Entry Pass"}
            </span>
          </div>
          {!isAdmin ? (
            <div 
              className="w-11 h-11 rounded-full border border-white/10 bg-bumble-yellow p-[2px] cursor-pointer hover:scale-105 transition-transform" 
              onClick={() => setCurrentTab('profile')}
            >
              <div className="w-full h-full rounded-full overflow-hidden border border-black/50">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt="avatar" 
                  className="w-full h-full object-cover bg-slate-800"
                />
              </div>
            </div>
          ) : (
            <button 
              onClick={handleSignOut}
              className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-2 rounded-full text-xs font-black uppercase cursor-pointer"
            >
              Log Out
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-20">
        {/* Desktop Sidebar Nav */}
        <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-black/20 backdrop-blur-2xl pt-8 px-4 h-full shrink-0 shadow-xl">
          <div className="space-y-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-full transition-all duration-300 relative overflow-hidden group ${
                    isActive 
                      ? "bg-bumble-yellow text-slate-950 shadow-[0_8px_32px_rgba(255,219,91,0.15)] border border-yellow-300/30" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`w-5 h-5 z-10 ${isActive ? 'fill-slate-950/20' : 'group-hover:scale-110 transition-transform'}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-xs font-black uppercase tracking-widest z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative z-10">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 min-h-full flex flex-col">
            {currentTab === "discover" && (
              <div className="h-full flex flex-col items-center">
                <Discover currentUser={user} />
              </div>
            )}
            {currentTab === "matches" && (
              <div className="w-full max-w-4xl mx-auto">
                <h2 className="text-3xl font-black mb-8 text-white">Matches & Chats</h2>
                <Matches currentUser={user} />
              </div>
            )}
            {currentTab === "events" && (
              <div className="w-full max-w-4xl mx-auto">
                <h2 className="text-3xl font-black mb-8 text-white">Group Happy Hours</h2>
                <Events />
              </div>
            )}
            {currentTab === "profile" && (
              <div className="w-full max-w-2xl mx-auto">
                <h2 className="text-3xl font-black mb-8 text-white">Your Lounge Profile</h2>
                <Profile currentUser={user} />
              </div>
            )}
            {currentTab === "admin" && isAdmin && (
              <div className="w-full max-w-5xl mx-auto">
                <AdminPanel />
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <BottomNav currentTab={currentTab} setTab={setCurrentTab} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
