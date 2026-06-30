import React, { useState } from "react";
import { X, Sparkles, ShieldCheck, Zap, Gem, Check } from "lucide-react";
import { getSupabaseClient } from "../lib/supabase";

interface Props {
  currentUser: any;
  currentTier: "free" | "intermediate" | "ultimate";
  onClose: () => void;
  onSuccess: () => void;
}

export function SubscriptionModal({ currentUser, currentTier, onClose, onSuccess }: Props) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const supabaseClient = getSupabaseClient();

  const handleSubscribe = async (tier: "free" | "intermediate" | "ultimate") => {
    setLoadingPlan(tier);
    try {
      const swipes = tier === "ultimate" ? 9999 : tier === "intermediate" ? 15 : 3;
      await supabaseClient
        .from("profiles")
        .update({
          subscription_tier: tier,
          swipes_remaining: swipes
        })
        .eq("id", currentUser.uid || currentUser.id);

      setTimeout(() => {
        setLoadingPlan(null);
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error("Subscription update failed", error);
      setLoadingPlan(null);
    }
  };

  const PLANS = [
    {
      id: "free",
      name: "Free Pass",
      price: "₹0",
      description: "Standard entry ticket for the local lounge",
      features: [
        "3 swipes per day limit",
        "Standard matching algorithms",
        "Aadhar document verification"
      ],
      icon: Zap,
      color: "border-white/10 text-slate-400"
    },
    {
      id: "intermediate",
      name: "Chilled Quarter",
      price: "₹99/mo",
      description: "Perfect for weekend social hours",
      features: [
        "15 swipes per day limit",
        "Virtual Bartender tips access",
        "Premium profile customization",
        "Ad-free lounge browsing"
      ],
      icon: Sparkles,
      color: "border-bumble-yellow/30 text-bumble-yellow bg-bumble-yellow/5"
    },
    {
      id: "ultimate",
      name: "Patiala Peg Pass",
      price: "₹299/mo",
      description: "Full VIP access with unlimited drinks matching",
      features: [
        "Unlimited swiping & matching",
        "Instant Aadhar verification priority",
        "Direct Icebreaker suggestions",
        "👑 Patiala VIP Crown Badge on profile",
        "Group Happy Hour VIP access"
      ],
      icon: Gem,
      color: "border-amber-500/40 text-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#18181c] border border-white/10 rounded-[32px] w-full max-w-4xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-md mx-auto space-y-2">
          <h2 className="text-3xl font-black text-white">Upgrade Lounge Pass</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Unlock additional matches, priorities, and custom Desi Bartender perks tailored for Indian drink lounge vibes.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentTier === plan.id;
            const isSelected = loadingPlan === plan.id;

            return (
              <div 
                key={plan.id}
                className={`border rounded-[28px] p-6 flex flex-col justify-between transition-all relative overflow-hidden ${plan.color} ${
                  isCurrent ? "ring-2 ring-bumble-yellow" : ""
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-4 right-4 bg-bumble-yellow text-slate-950 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm uppercase tracking-wider">{plan.name}</h4>
                      <span className="text-2xl font-black text-white">{plan.price}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-normal">{plan.description}</p>

                  <div className="border-t border-white/5 pt-4 space-y-2">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id as any)}
                  disabled={isCurrent || loadingPlan !== null}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all mt-8 cursor-pointer disabled:opacity-50 ${
                    isCurrent 
                      ? "bg-white/5 border border-white/10 text-slate-500 cursor-default" 
                      : plan.id === "ultimate" 
                      ? "bg-amber-500 hover:bg-amber-600 text-white" 
                      : "bg-bumble-yellow hover:bg-bumble-yellow-hover text-slate-950"
                  }`}
                >
                  {isSelected ? "Processing..." : isCurrent ? "Active Plan" : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
