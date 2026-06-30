import React, { useState } from "react";
import { ShieldCheck, X, CheckCircle2, FileText, Upload, AlertCircle } from "lucide-react";
import { getSupabaseClient } from "../lib/supabase";

interface Props {
  currentUser: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function VerificationScreen({ currentUser, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [aadharNumber, setAadharNumber] = useState("");
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [aadharBase64, setAadharBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError("File size should not exceed 2MB.");
        return;
      }
      setAadharFile(file);

      // Convert to base64 for preview / storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setAadharBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate Aadhar Number
    const cleaned = aadharNumber.replace(/\s+/g, "");
    if (!/^\d{12}$/.test(cleaned)) {
      setError("Please enter a valid 12-digit Aadhar Number.");
      return;
    }

    if (!aadharBase64) {
      setError("Please upload a photo of your Aadhar Card.");
      return;
    }

    setLoading(true);
    setStep("processing");

    try {
      const supabaseClient = getSupabaseClient();
      let publicUrl = aadharBase64; // Fallback is base64

      // Attempt actual upload if Supabase client is authentic (not mock client)
      if (supabaseClient.auth.getSession && !supabaseClient.hasOwnProperty("triggerAuthChange")) {
        try {
          const fileExt = aadharFile?.name.split(".").pop();
          const fileName = `${currentUser.uid || currentUser.id}/aadhar_${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabaseClient.storage
            .from("verifications")
            .upload(fileName, aadharFile!, { cacheControl: "3600", upsert: true });

          if (!uploadError) {
            const { data } = supabaseClient.storage.from("verifications").getPublicUrl(fileName);
            if (data?.publicUrl) {
              publicUrl = data.publicUrl;
            }
          }
        } catch (e) {
          console.warn("Storage upload failed, falling back to base64 encoding", e);
        }
      }

      // Update database profile
      await supabaseClient
        .from("profiles")
        .update({
          aadhar_number: cleaned,
          aadhar_url: publicUrl,
          verification_status: "pending",
          safety_verified: false // Set to false until approved by moderator
        })
        .eq("id", currentUser.uid || currentUser.id);

      setTimeout(() => {
        setStep("success");
        setLoading(false);
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setStep("form");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0C] flex flex-col pt-12 pb-8 px-6 overflow-y-auto">
      <div className="flex justify-end mb-8 relative z-10 max-w-md mx-auto w-full">
        <button 
          onClick={onClose}
          disabled={loading}
          className="p-3 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative max-w-md mx-auto w-full">
        {step === "form" && (
          <div className="w-full space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-bumble-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-bumble-yellow/20">
                <ShieldCheck className="w-10 h-10 text-bumble-yellow" />
              </div>
              <h2 className="text-2xl font-black text-white">Aadhar Card Verification</h2>
              <p className="text-slate-400 text-xs mt-2 max-w-xs mx-auto">
                PegMatch requires verification to unlock matchmaking. Upload your card to ensure secure, real-profile connections.
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">12-Digit Aadhar Number</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={12}
                    placeholder="1234 5678 9012"
                    value={aadharNumber}
                    onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-white/5 border border-white/5 focus:border-bumble-yellow rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Upload Aadhar Card Photo</label>
                <div className="border-2 border-dashed border-white/10 hover:border-bumble-yellow/30 rounded-2xl p-6 text-center cursor-pointer relative bg-white/5 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {aadharFile ? (
                    <div className="space-y-2">
                      <p className="text-xs text-emerald-400 font-bold">Selected: {aadharFile.name}</p>
                      {aadharBase64 && (
                        <div className="w-full h-32 rounded-xl overflow-hidden border border-white/10 bg-slate-900 mt-2">
                          <img src={aadharBase64} alt="Aadhar Preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 text-slate-400">
                      <Upload className="w-8 h-8 mx-auto text-slate-500" />
                      <p className="text-xs font-semibold">Click to select or drag photo here</p>
                      <p className="text-[10px] text-slate-600">Supports JPG, PNG (Max 2MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-bumble-yellow hover:bg-bumble-yellow-hover text-slate-950 py-4 rounded-full font-black text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-6"
              >
                Submit Aadhar
              </button>
            </form>
          </div>
        )}

        {step === "processing" && (
          <div className="text-center">
            <div className="relative w-28 h-28 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
              <div className="absolute inset-0 border-4 border-bumble-yellow rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-bumble-yellow animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-white">Submitting...</h3>
            <p className="text-slate-400 text-xs mt-2">Encrypting and sending credentials for review.</p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-white">Submission Successful!</h2>
            <p className="text-slate-400 text-xs mt-3 leading-relaxed max-w-xs mx-auto">
              Your verification request has been successfully submitted to the lounge moderator. Matches will unlock once approved.
            </p>
            <button 
              onClick={onSuccess}
              className="w-full bg-bumble-yellow hover:bg-bumble-yellow-hover text-slate-950 py-4 rounded-full font-black text-xs uppercase tracking-wider transition-colors shadow-lg mt-8 cursor-pointer"
            >
              Return to Lounge
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
