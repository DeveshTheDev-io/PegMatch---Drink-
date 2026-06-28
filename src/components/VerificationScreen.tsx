import { useState, useRef, useCallback } from "react";
import { Camera, ShieldCheck, X, Loader2, CheckCircle2 } from "lucide-react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface Props {
  currentUser: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function VerificationScreen({ currentUser, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<"intro" | "camera" | "processing" | "success">("intro");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    setStep("camera");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback for demo purposes if camera access is denied/unavailable
      simulateProcessing();
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    stopCamera();
    simulateProcessing();
  };

  const simulateProcessing = () => {
    setStep("processing");
    // Simulate AI verification delay
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, "users", currentUser.uid), { safetyVerified: true });
        setStep("success");
      } catch (err) {
        console.error("Failed to verify", err);
        onClose();
      }
    }, 2500);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleSuccess = () => {
    stopCamera();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0C] flex flex-col pt-12 pb-8 px-6 overflow-hidden">
      <div className="flex justify-end mb-8 relative z-10">
        <button 
          onClick={handleClose}
          className="p-3 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {step === "intro" && (
          <div className="text-center max-w-sm w-full">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/30">
              <ShieldCheck className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-3xl font-black mb-4">Get Verified</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Take a quick selfie to verify your identity. This helps keep our community safe and shows others you're real.
            </p>
            <button 
              onClick={startCamera}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Take Selfie
            </button>
          </div>
        )}

        {step === "camera" && (
          <div className="w-full max-w-sm flex flex-col items-center">
            <h3 className="text-xl font-bold mb-6">Position your face</h3>
            <div className="relative w-64 h-80 rounded-full overflow-hidden border-4 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)] mb-8">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-0 border-[8px] border-black/20 rounded-full pointer-events-none" />
              
              {/* Scanline animation overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/20 to-transparent h-24 animate-[scan_2s_ease-in-out_infinite]" />
            </div>
            <p className="text-slate-400 mb-8 text-center text-sm">
              Make sure your face is well-lit and clearly visible in the oval.
            </p>
            <button 
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full border-4 border-blue-500 flex items-center justify-center shadow-xl hover:scale-95 transition-transform"
            >
              <div className="w-16 h-16 bg-white border-2 border-black/10 rounded-full" />
            </button>
          </div>
        )}

        {step === "processing" && (
          <div className="text-center max-w-sm w-full">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-12 h-12 text-blue-500 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Analyzing...</h3>
            <p className="text-slate-400">Verifying your identity securely.</p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center max-w-sm w-full">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black mb-4">You're Verified!</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Your profile now has the Verified badge. Cheers to safe connections!
            </p>
            <button 
              onClick={handleSuccess}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest transition-colors shadow-lg shadow-orange-600/30"
            >
              Return to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
