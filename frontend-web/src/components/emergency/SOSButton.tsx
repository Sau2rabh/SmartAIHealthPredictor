"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, MapPin, Send } from "lucide-react";
import api from "@/utils/api";

export default function SOSButton() {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

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
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end gap-3">
      {showConfirm && (
        <div className="bg-gray-900/90 backdrop-blur-xl border border-red-500/30 p-4 rounded-2xl shadow-2xl shadow-red-500/20 max-w-[280px] animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Send SOS Alert?</h4>
              <p className="text-gray-400 text-xs mt-1">This will send your location and medical info to your emergency contact via SMS.</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={triggerSOS}
              disabled={loading}
              className="flex-1 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              {loading ? "Sending..." : "Confirm SOS"}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowConfirm(!showConfirm)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          status === "success" 
            ? "bg-green-500 shadow-green-500/40" 
            : status === "error"
            ? "bg-orange-500 shadow-orange-500/40"
            : "bg-red-600 shadow-red-600/40 hover:bg-red-500"
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
        <span className="bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-green-500/20">
          Alert Sent!
        </span>
      )}
    </div>
  );
}
