"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { AlertTriangle, Loader2, MapPin, Send } from "lucide-react";
import api from "@/utils/api";

export interface SOSButtonRef {
  open: () => void;
}

const SOSButton = forwardRef<SOSButtonRef, { hideButton?: boolean }>(({ hideButton = false }, ref) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useImperativeHandle(ref, () => ({
    open: () => setShowConfirm(true)
  }));

  const triggerSOS = async () => {
    setLoading(true);
    setStatus("idle");
    
    try {
      // 1. Get Location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // 2. Call API
      await api.post("/emergency/sos", {
        location: { lat: latitude, lng: longitude },
        message: "EMERGENCY: I need help! My location is shared."
      });

      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setShowConfirm(false);
      }, 5000);
    } catch (err) {
      console.error("SOS Error:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!hideButton && (
        <div className="fixed bottom-28 md:bottom-8 right-6 z-[100] flex flex-col items-end gap-4">
          <button
            onClick={() => setShowConfirm(!showConfirm)}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              status === "success" 
                ? "bg-green-500 shadow-green-500/40" 
                : status === "error"
                ? "bg-orange-500 shadow-orange-500/40"
                : "bg-red-600/90 shadow-red-600/40 hover:bg-red-500 hover:opacity-100 backdrop-blur-sm"
            } ${showConfirm ? "rotate-45" : ""}`}
          >
            {status === "success" ? (
              <MapPin className="w-6 h-6 text-white animate-bounce" />
            ) : status === "error" ? (
              <AlertTriangle className="w-6 h-6 text-white animate-shake" />
            ) : (
              <div className="relative">
                <AlertTriangle className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></span>
              </div>
            )}
          </button>
          
          {status === "success" && (
            <span className="bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-green-500/20 animate-in fade-in slide-in-from-right-4">
              Alert Sent!
            </span>
          )}
        </div>
      )}

      {/* Centered SOS Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center md:left-[18rem] pointer-events-none p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xl pointer-events-auto transition-opacity duration-500 animate-in fade-in"
            onClick={() => setShowConfirm(false)}
          />
          
          <div className="relative bg-[#0d1221] border border-red-500/40 p-8 rounded-[2.5rem] shadow-[0_0_80px_rgba(239,68,68,0.15)] max-w-md w-full pointer-events-auto transform transition-all duration-500 animate-in zoom-in-95 fade-in slide-in-from-bottom-12">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="bg-red-500/20 p-5 rounded-3xl mb-6 relative group">
                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse group-hover:scale-125 transition-transform duration-700"></div>
                <AlertTriangle className="w-10 h-10 text-red-500 relative z-10" />
              </div>
              <h4 className="text-2xl font-black text-white tracking-tighter uppercase mb-3">Send SOS Alert?</h4>
              <p className="text-gray-400 text-sm leading-relaxed px-4">
                This will instantly share your **live location** and **medical ID** with your emergency contacts via priority SMS.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-black uppercase tracking-[0.2em] border border-white/5 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={triggerSOS}
                disabled={loading}
                className="flex-1 py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/20 disabled:bg-red-800 text-white text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95 btn-shine"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {loading ? "Sending..." : "Confirm SOS"}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-red-500/70 text-center animate-pulse">
              Life-Critical System Active
            </div>
          </div>
        </div>
      )}
    </>
  );
});

SOSButton.displayName = "SOSButton";
export default SOSButton;

