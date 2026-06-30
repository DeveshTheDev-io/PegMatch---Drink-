import { motion } from "motion/react";
import { Sparkles, Wine, Flame, Music, Home, ArrowRight, ShieldCheck, MessageSquare } from "lucide-react";
import { DRINKING_QUOTES } from "../lib/quotes";

interface Props {
  onSignIn: () => void;
}

export function LandingPage({ onSignIn }: Props) {
  // Let's grab three fun quotes to showcase
  const featuredQuotes = DRINKING_QUOTES.slice(0, 3);

  return (
    <div className="flex-1 flex flex-col bg-bumble-slate text-slate-100 font-sans selection:bg-bumble-yellow/30 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:py-32 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto w-full z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 bg-bumble-yellow/10 border border-bumble-yellow/20 px-4 py-2 rounded-full text-xs font-black text-bumble-yellow uppercase tracking-widest">
            <span className="w-2 h-2 bg-bumble-yellow rounded-full animate-ping" />
            India's #1 Drinking Matchmaker
          </div>

          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none text-white max-w-4xl">
            Cheers to Finding Your <br />
            <span className="text-bumble-yellow underline decoration-yellow-400/40">Perfect Drinking Partner</span>
          </h1>

          <p className="text-slate-400 text-sm md:text-xl max-w-2xl mx-auto font-medium">
            Match by favorite Indian spirits, music vibe, and preferred hangout spots. Because no one should drink a Patiala peg alone!
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onSignIn}
              className="w-full sm:w-auto bg-bumble-yellow hover:bg-bumble-yellow-hover text-slate-950 px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 cursor-pointer"
            >
              Enter the Lounge <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-wider text-slate-300 text-center"
            >
              See What's Inside
            </a>
          </div>
        </motion.div>
      </section>

      {/* Movie Quotes Ticker Section */}
      <section className="bg-bumble-yellow/5 border-y border-white/5 py-10 overflow-hidden relative w-full">
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <h3 className="text-[10px] font-black text-bumble-yellow uppercase tracking-widest text-center">🍿 Connect over Filmy Dialogues</h3>
        </div>
        <div className="flex gap-6 justify-center flex-wrap px-4">
          {featuredQuotes.map((q, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-black/30 border border-white/10 p-5 rounded-2xl max-w-xs shrink-0 backdrop-blur-sm"
            >
              <p className="text-xs font-medium italic text-slate-200">"{q.quote}"</p>
              <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 font-bold">
                <span>— {q.movie}</span>
                <span className="bg-bumble-yellow/15 text-bumble-yellow px-2 py-0.5 rounded-full">{q.alcoholTag}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Feature Showcases */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto w-full space-y-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Lounge Features</h2>
          <p className="text-slate-400 text-sm md:text-base">Everything you need to find the right companion for your weekend happy hours, BYOB sessions, or pub crawls.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Indian Alcohol & Vibes */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[24px] space-y-5 hover:-translate-y-1 hover:border-bumble-yellow/45 transition-all">
            <div className="w-12 h-12 bg-bumble-yellow/15 rounded-2xl flex items-center justify-center border border-bumble-yellow/20">
              <Wine className="w-6 h-6 text-bumble-yellow" />
            </div>
            <h3 className="text-xl font-bold text-white">Indian Spirits Match</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Find partners who match your exact choice in spirits. Whether you swear by a neat single malt like Amrut, traditional Old Monk, or a chilled craft beer like Bira 91.
            </p>
          </div>

          {/* Card 2: Music & Location Vibes */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[24px] space-y-5 hover:-translate-y-1 hover:border-bumble-yellow/45 transition-all">
            <div className="w-12 h-12 bg-bumble-yellow/15 rounded-2xl flex items-center justify-center border border-bumble-yellow/20">
              <Music className="w-6 h-6 text-bumble-yellow" />
            </div>
            <h3 className="text-xl font-bold text-white">Music & Spot Pairing</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Match with peers who share your setting: Sufi and ghazals at a cozy flat session, high-energy Punjabi beats at a BYOB ahata, or techno beats at a high-end club.
            </p>
          </div>

          {/* Card 3: Virtual Bartender */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[24px] space-y-5 hover:-translate-y-1 hover:border-bumble-yellow/45 transition-all">
            <div className="w-12 h-12 bg-bumble-yellow/15 rounded-2xl flex items-center justify-center border border-bumble-yellow/20">
              <Sparkles className="w-6 h-6 text-bumble-yellow" />
            </div>
            <h3 className="text-xl font-bold text-white">AI Desi Bartender</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Leverage our Gemini-powered virtual bartender to fetch perfect Indian food pairings, brand origins, and icebreakers to initiate your conversation.
            </p>
          </div>
        </div>
      </section>

      {/* Extra Premium Feature Highlight */}
      <section className="bg-bumble-yellow/5 border-t border-white/5 py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> 100% Verified Community
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Safety & Verification At The Core
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              We employ strict photo-verification processes and active status checks (Available, Busy, Looking for plans) to ensure your nightout plans are always safe, real, and prompt.
            </p>
            <div className="flex gap-8 text-left pt-2">
              <div>
                <span className="block text-3xl font-black text-bumble-yellow leading-none">Real-time</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 block">Live Verification</span>
              </div>
              <div className="border-l border-white/10 pl-8">
                <span className="block text-3xl font-black text-bumble-yellow leading-none">Dhaba & BYOB</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 block">Local Integrations</span>
              </div>
            </div>
          </div>
          <div className="bg-[#18181c] border border-white/10 rounded-[32px] p-6 space-y-6 shadow-2xl relative">
            <div className="absolute top-4 right-4 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Example Lounge Match</span>
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="mock" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-white flex items-center gap-1.5">Aanya, 25 <ShieldCheck className="w-4 h-4 text-emerald-400" /></h4>
                <p className="text-[10px] text-slate-400 font-medium">Old Monk & Bira 91 • Sufi / Ghazals</p>
              </div>
            </div>
            <p className="text-xs italic text-slate-300">"Let's grab a glass of wine and sing vintage Bollywood retro tracks on a cozy rooftop flat."</p>
            <button 
              onClick={onSignIn}
              className="w-full bg-bumble-yellow hover:bg-bumble-yellow-hover text-slate-950 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Connect Now 🥂
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black/20 text-center">
        <p className="text-xs text-slate-500">© 2026 PegMatch Desi Lounge. Drive safe, drink responsibly. Must be 21+ to enter.</p>
      </footer>
    </div>
  );
}
