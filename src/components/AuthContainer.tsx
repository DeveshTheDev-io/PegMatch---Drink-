import React, { useState } from "react";
import { getSupabaseClient } from "../lib/supabase";
import { motion } from "motion/react";
import { ShieldAlert, Mail, Lock, User as UserIcon, Calendar, ArrowRight } from "lucide-react";

interface Props {
  onAuthSuccess: () => void;
}

export function AuthContainer({ onAuthSuccess }: Props) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState<number>(21);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabaseClient = getSupabaseClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Please fill out all fields.");
      setLoading(false);
      return;
    }

    if (isSignUp) {
      if (!displayName) {
        setError("Please enter a display name.");
        setLoading(false);
        return;
      }
      if (age < 21) {
        setError("You must be 21 or older to enter the lounge.");
        setLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            age: age
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Pre-create user profile in database
      const profileData = {
        id: data.user?.id,
        display_name: displayName,
        age: age,
        availability: "Available",
        safety_verified: false,
        alcohol_preferences: [],
        smoke_preferences: [],
        music_vibes: [],
        preferred_places: [],
        bio: ""
      };
      
      const { error: profileError } = await supabaseClient.from("profiles").insert(profileData);
      if (profileError) {
        console.error("Profile creation error", profileError);
      }
    } else {
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onAuthSuccess();
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-bumble-slate relative z-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#18181c] border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 bg-bumble-yellow rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <span className="text-2xl font-black text-slate-900">P</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {isSignUp ? "Create Lounge Account" : "Enter Desi Lounge"}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUp ? "Set up your drinking preferences & match" : "Log in to connect with peers"}
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs flex items-center gap-2 mb-6">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Display Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="E.g. Aarav Sharma"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-bumble-yellow rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Age (Must be 21+)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    min={21}
                    required
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 21)}
                    className="w-full bg-white/5 border border-white/5 focus:border-bumble-yellow rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="yourname@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/5 focus:border-bumble-yellow rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/5 focus:border-bumble-yellow rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bumble-yellow hover:bg-bumble-yellow-hover text-slate-950 py-4 rounded-full font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}{" "}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-xs text-bumble-yellow hover:underline font-bold uppercase tracking-wider cursor-pointer"
          >
            {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
