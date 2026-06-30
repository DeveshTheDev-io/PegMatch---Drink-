import React, { useState, useEffect, useRef } from "react";
import { UserProfile } from "../types";
import { ArrowLeft, Send, Sparkles, Loader2, Calendar, Bot } from "lucide-react";
import { getSupabaseClient } from "../lib/supabase";
import { DateModal } from "./DateModal";

interface Props {
  currentUser: any;
  matchUser: any;
  onBack: () => void;
}

function parseInvite(content: string) {
  const lines = content.split('\n');
  const location = lines[1]?.replace("📍", "").trim() || "";
  const time = lines[2]?.replace("🕒", "").trim() || "";
  const drinkStyle = lines[3]?.replace("🥂", "").trim() || "";
  return { location, time, drinkStyle };
}

export function ChatWindow({ currentUser, matchUser, onBack }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [loadingIcebreakers, setLoadingIcebreakers] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const supabaseClient = getSupabaseClient();

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabaseClient
        .from("messages")
        .select("*")
        .eq("match_id", matchUser.id)
        .order("created_at", { ascending: true });

      if (data) {
        const mapped = data.map((m: any) => {
          const isInvite = m.content.startsWith("Meetup Invite:");
          return {
            id: m.id,
            text: m.content,
            senderId: m.sender_id,
            type: isInvite ? "invite" : "text",
            invite: isInvite ? parseInvite(m.content) : null
          };
        });
        setMessages(mapped);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        const { data } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", currentUser.uid || currentUser.id)
          .maybeSingle();
        if (data) {
          setCurrentUserProfile({
            ...data,
            uid: data.id,
            displayName: data.display_name,
            photoURL: data.photo_url,
            alcoholPreferences: data.alcohol_preferences,
            smokePreferences: data.smoke_preferences,
            safetyVerified: data.safety_verified,
            musicVibes: data.music_vibes,
            preferredPlaces: data.preferred_places
          } as UserProfile);
        }
      }
    };
    fetchProfile();
  }, [currentUser]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [matchUser.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.senderId === "bartender") return;

    const checkBartender = async () => {
      try {
        const textToCheck = lastMsg.type === "invite" ? lastMsg.invite.drinkStyle : lastMsg.text;
        
        const response = await fetch("/api/gemini/bartender", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: textToCheck }),
        });
        
        const data = await response.json();
        if (data.fact) {
          setIsBotTyping(true);
          setTimeout(async () => {
            const botMessage = {
              match_id: matchUser.id,
              sender_id: "bartender",
              content: `💡 Bartender Fact: ${data.fact}`
            };
            
            await supabaseClient.from("messages").insert(botMessage);
            setIsBotTyping(false);
            fetchMessages();
          }, 1500);
        }
      } catch (err) {
        console.error("Error communicating with bartender api", err);
      }
    };
    checkBartender();
  }, [messages.length]);

  const generateIcebreakers = async () => {
    if (!currentUserProfile) return;
    setLoadingIcebreakers(true);
    try {
      const response = await fetch("/api/gemini/icebreaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user1Name: currentUserProfile.displayName,
          user1Prefs: currentUserProfile.alcoholPreferences || [],
          user2Name: matchUser.user.displayName,
          user2Prefs: matchUser.user.alcoholPreferences || ["Beer", "Whisky"],
        }),
      });
      const data = await response.json();
      if (data.icebreakers) {
        setIcebreakers(data.icebreakers);
      }
    } catch (error) {
      console.error("Failed to generate icebreakers", error);
    }
    setLoadingIcebreakers(false);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    try {
      await supabaseClient.from("messages").insert({
        match_id: matchUser.id,
        sender_id: currentUser?.uid || currentUser?.id,
        content: text
      });
      setInputText("");
      setIcebreakers([]);
      fetchMessages();
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleSendDateInvite = async (invite: { time: string; location: string; drinkStyle: string }) => {
    const formattedDate = new Date(invite.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    const text = `Meetup Invite:\n📍 ${invite.location}\n🕒 ${formattedDate}\n🥂 ${invite.drinkStyle}`;
    try {
      await supabaseClient.from("messages").insert({
        match_id: matchUser.id,
        sender_id: currentUser?.uid || currentUser?.id,
        content: text
      });
      setShowDateModal(false);
      fetchMessages();
    } catch (err) {
      console.error("Failed to send date invitation", err);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#0A0A0C]/95 backdrop-blur-3xl z-50 flex flex-col pt-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between px-6 pb-4 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 bg-white/5 rounded-full hover:bg-white/10 hover:scale-110 transition-all border border-transparent hover:border-white/10 cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={matchUser.user.photoURL} alt={matchUser.user.displayName} className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-lg" />
              {matchUser.user.availability === 'Available' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0A0A0C] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
            </div>
            <div>
              <h3 className="font-black text-white tracking-wide">{matchUser.user.displayName}</h3>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{matchUser.user.availability}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setShowDateModal(true)}
          className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-500 rounded-full hover:from-amber-500/30 hover:to-orange-600/30 transition-all border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-105 cursor-pointer"
        >
          <Calendar className="w-5 h-5 drop-shadow-md" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(msg => {
          const isMe = msg.senderId === (currentUser?.uid || currentUser?.id);
          const isBartender = msg.senderId === "bartender";
          
          if (msg.type === "invite") {
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] rounded-3xl p-5 border shadow-xl ${isMe ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/10 border-amber-500/30 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.3)]' : 'bg-white/5 border-white/10 backdrop-blur-md'}`}>
                   <div className="flex items-center gap-2 mb-4">
                     <Calendar className={`w-4 h-4 ${isMe ? 'text-amber-500' : 'text-slate-400'}`} />
                     <span className={`text-[10px] font-black uppercase tracking-widest ${isMe ? 'text-amber-500' : 'text-slate-400'}`}>
                       Date Invitation
                     </span>
                   </div>
                   <div className="space-y-3 mb-5">
                     <p className="text-sm text-slate-200"><strong className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Location</strong> {msg.invite.location}</p>
                     <p className="text-sm text-slate-200"><strong className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Time</strong> {msg.invite.time}</p>
                     <p className="text-sm text-slate-200"><strong className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Vibe</strong> {msg.invite.drinkStyle}</p>
                   </div>
                   {!isMe && (
                     <div className="flex gap-3 mt-4">
                       <button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_5px_15px_rgba(245,158,11,0.4)] hover:scale-105 transition-transform cursor-pointer">Accept</button>
                       <button className="flex-1 bg-white/5 border border-white/10 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors cursor-pointer">Decline</button>
                     </div>
                   )}
                 </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-[24px] px-5 py-3.5 shadow-lg ${
                isMe 
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white font-medium rounded-tr-sm shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)]' 
                  : isBartender
                  ? 'bg-amber-500/10 text-amber-400 rounded-tl-sm border border-amber-500/20 backdrop-blur-md'
                  : 'bg-white/10 text-slate-200 rounded-tl-sm border border-white/5 backdrop-blur-md'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        {isBotTyping && (
          <div className="flex justify-center my-6">
            <div className="max-w-[85%] rounded-3xl p-4 bg-gradient-to-br from-orange-900/40 to-black/40 border border-orange-500/30 flex items-center gap-3 backdrop-blur-md">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500/20 to-orange-600/20 flex items-center justify-center shrink-0 border border-orange-500/40">
                <Bot className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex gap-1.5 ml-2">
                <span className="w-2 h-2 bg-amber-500/80 rounded-full animate-bounce shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                <span className="w-2 h-2 bg-amber-500/80 rounded-full animate-bounce shadow-[0_0_8px_rgba(245,158,11,0.8)]" style={{ animationDelay: "0.2s" }}></span>
                <span className="w-2 h-2 bg-amber-500/80 rounded-full animate-bounce shadow-[0_0_8px_rgba(245,158,11,0.8)]" style={{ animationDelay: "0.4s" }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      
      {icebreakers.length > 0 && (
        <div className="px-6 py-4 flex flex-col gap-2 bg-gradient-to-t from-[#0A0A0C] to-transparent">
          <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Icebreakers
          </div>
          {icebreakers.map((ib, idx) => (
            <button 
              key={idx} 
              onClick={() => handleSend(ib)}
              className="text-left bg-white/5 hover:bg-white/10 border border-white/10 text-sm p-4 rounded-2xl text-slate-300 transition-all hover:scale-[1.02] hover:border-white/20 hover:shadow-lg backdrop-blur-md cursor-pointer"
            >
              "{ib}"
            </button>
          ))}
        </div>
      )}

      <div className="p-6 pt-4 bg-[#0A0A0C]/80 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center gap-3">
          <button 
            onClick={generateIcebreakers}
            disabled={loadingIcebreakers}
            className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl hover:bg-amber-500/20 transition-all border border-amber-500/30 hover:scale-105 shadow-[inset_0_0_15px_rgba(245,158,11,0.1)] cursor-pointer"
          >
            {loadingIcebreakers ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 drop-shadow-md" />}
          </button>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
            placeholder="Type a message..." 
            className="flex-1 bg-white/5 border border-white/10 text-sm rounded-2xl px-5 py-3.5 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 text-slate-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] transition-all"
          />
          <button 
            onClick={() => handleSend(inputText)}
            className="p-3.5 bg-gradient-to-tr from-amber-500 to-orange-600 text-white rounded-2xl hover:scale-105 transition-all shadow-[0_5px_15px_rgba(245,158,11,0.4)] cursor-pointer"
          >
            <Send className="w-5 h-5 drop-shadow-md" />
          </button>
        </div>
      </div>
      
      {showDateModal && (
        <DateModal 
          matchUser={matchUser}
          onClose={() => setShowDateModal(false)}
          onSend={handleSendDateInvite}
        />
      )}
    </div>
  );
}
