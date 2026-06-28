import { useEffect, useState } from "react";
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ProfileSetup } from "./components/ProfileSetup";
import { BottomNav } from "./components/BottomNav";
import { Discover } from "./components/Discover";
import { Matches } from "./components/Matches";
import { Events } from "./components/Events";
import { Profile } from "./components/Profile";
import { Flame, MessageCircle, CalendarDays, UserCircle, Menu } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [currentTab, setCurrentTab] = useState("discover");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const docRef = doc(db, "users", u.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfileComplete(true);
          } else {
            setProfileComplete(false);
          }
        } catch (error) {
          console.error("Error checking profile", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Auth error", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center" />;
  }

  if (user && !profileComplete) {
    return <ProfileSetup user={user} onComplete={() => setProfileComplete(true)} />;
  }

  const tabs = [
    { id: "discover", icon: Flame, label: "Discover" },
    { id: "matches", icon: MessageCircle, label: "Matches" },
    { id: "events", icon: CalendarDays, label: "Events" },
    { id: "profile", icon: UserCircle, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-slate-100 flex flex-col relative overflow-hidden font-sans selection:bg-amber-500/30">
      {/* Background Atmospheric Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-amber-900/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-indigo-900/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Navigation */}
      <header className="relative z-30 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-[#0A0A0C]/60 backdrop-blur-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-white/10">
            <span className="text-2xl font-black text-white drop-shadow-md">P</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500 drop-shadow-sm">
            PegMatch <span className="text-[10px] tracking-widest uppercase text-amber-500 ml-1 hidden sm:inline drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">India</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-xs font-bold text-emerald-400 hidden sm:inline drop-shadow-sm">Verified</span>
              </div>
              <div className="w-11 h-11 rounded-full border border-white/10 bg-gradient-to-tr from-amber-500 to-orange-600 p-[2px] shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer hover:scale-105 transition-transform" onClick={() => setCurrentTab('profile')}>
                <div className="w-full h-full rounded-full overflow-hidden border border-black/50">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                    alt="avatar" 
                    className="w-full h-full object-cover bg-slate-800"
                  />
                </div>
              </div>
            </>
          ) : (
            <button 
              onClick={handleSignIn}
              className="bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-500 border border-amber-500/40 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-amber-500/30 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-20">
        {/* Desktop Sidebar Nav */}
        <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-black/40 backdrop-blur-2xl pt-8 px-4 h-full shrink-0 shadow-xl">
          <div className="space-y-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                    isActive 
                      ? "bg-white/10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] text-amber-400" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent pointer-events-none" />
                  )}
                  <Icon className={`w-5 h-5 z-10 ${isActive ? 'fill-amber-500/20 drop-shadow-md' : 'group-hover:scale-110 transition-transform'}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-xs font-extrabold uppercase tracking-widest z-10 ${isActive ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]' : ''}`}>{tab.label}</span>
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
                <h2 className="text-3xl font-black mb-8">Matches & Chats</h2>
                <Matches currentUser={user} />
              </div>
            )}
            {currentTab === "events" && (
              <div className="w-full max-w-4xl mx-auto">
                <h2 className="text-3xl font-black mb-8">Group Happy Hours</h2>
                <Events />
              </div>
            )}
            {currentTab === "profile" && (
              <div className="w-full max-w-2xl mx-auto">
                <h2 className="text-3xl font-black mb-8">Your Profile</h2>
                <Profile currentUser={user} />
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <BottomNav currentTab={currentTab} setTab={setCurrentTab} />
      </div>
    </div>
  );
}
