"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MapPin, PhoneCall, AlertTriangle, ShieldAlert, HeartPulse, ExternalLink } from "lucide-react";

export default function CarePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("token");
    if (!authLoading && !user && !hasToken) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const handleFindHospitals = () => {
    // Open Google Maps search for nearby hospitals
    window.open('https://www.google.com/maps/search/hospitals+near+me', '_blank');
  };

  const handleFindPharmacies = () => {
    // Open Google Maps search for nearby pharmacies
    window.open('https://www.google.com/maps/search/pharmacies+near+me', '_blank');
  };

  return (
    <main className="min-h-screen pt-8 md:pt-12 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <HeartPulse className="w-8 h-8 text-cyan-400" />
            Find Care & SOS
          </h1>
          <p className="text-gray-400 mt-2">Locate nearby medical facilities and emergency contacts instantly.</p>
        </header>

        {/* SOS Emergency Section */}
        <div className="glass-card overflow-hidden relative border-red-500/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] -z-10"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-red-500/20 rounded-xl text-red-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-red-400">EMERGENCY SOS</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="tel:108" className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors group">
              <div>
                <p className="text-sm text-red-400 font-bold uppercase tracking-widest mb-1">Ambulance</p>
                <p className="text-3xl font-black text-white">108</p>
              </div>
              <PhoneCall className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform" />
            </a>
            <a href="tel:112" className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors group">
              <div>
                <p className="text-sm text-red-400 font-bold uppercase tracking-widest mb-1">National Emergency</p>
                <p className="text-3xl font-black text-white">112</p>
              </div>
              <PhoneCall className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform" />
            </a>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 text-yellow-500" />
              <p>If you or someone else is experiencing severe chest pain, extreme difficulty breathing, or sudden weakness/numbness, call emergency services immediately.</p>
            </div>
          </div>
        </div>

        {/* Facility Locator */}
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            Nearby Medical Facilities
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button 
              onClick={handleFindHospitals}
              className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-center"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Hospitals & Clinics</h3>
              <p className="text-sm text-gray-400 mb-4">Find general hospitals, specialty clinics, and doctors near you.</p>
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full">
                Open Maps <ExternalLink className="w-3 h-3" />
              </span>
            </button>

            <button 
              onClick={handleFindPharmacies}
              className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-center"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Pharmacies</h3>
              <p className="text-sm text-gray-400 mb-4">Find 24/7 medical stores and pharmacies to get your prescribed medicines.</p>
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full">
                Open Maps <ExternalLink className="w-3 h-3" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
