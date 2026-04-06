"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Loader2, MapPin, Navigation, Phone, Search, Sparkles, Wifi } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import api from "@/utils/api";

const Map = dynamic(() => import("@/components/emergency/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full glass rounded-[2rem] border border-white/10 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 border-2 border-red-400/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 border-t-2 border-red-400 rounded-full animate-spin"></div>
        </div>
        <p className="text-red-400 font-black uppercase tracking-widest text-xs animate-pulse">Loading Map...</p>
      </div>
    </div>
  )
});

export default function NearbyEmergencyPage() {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [aiDetails, setAiDetails] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const formatAddress = (tags: any) => {
    const parts = [];
    if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"]);
    if (tags["addr:street"]) parts.push(tags["addr:street"]);
    if (tags["addr:suburb"]) parts.push(tags["addr:suburb"]);
    if (tags["addr:city"]) parts.push(tags["addr:city"]);
    if (tags["addr:postcode"]) parts.push(tags["addr:postcode"]);
    if (parts.length === 0) {
      if (tags["addr:full"]) return tags["addr:full"];
      if (tags["addr:place"]) return tags["addr:place"];
    }
    return parts.join(", ") || null;
  };

  const fetchNearbyHospitals = async (lat: number, lon: number) => {
    setLoading(true);
    setError("");
    const proxies = [
      "https://overpass-api.de/api/interpreter",
      "https://lz4.overpass-api.de/api/interpreter",
      "https://z.overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter"
    ];
    const query = `
      [out:json][timeout:30];
      (
        node["amenity"="hospital"](around:8000, ${lat}, ${lon});
        way["amenity"="hospital"](around:8000, ${lat}, ${lon});
        relation["amenity"="hospital"](around:8000, ${lat}, ${lon});
      );
      out center;
    `;
    let success = false;
    for (const proxy of proxies) {
      try {
        const response = await axios.get(`${proxy}?data=${encodeURIComponent(query)}`);
        if (response.data?.elements) {
          const results = response.data.elements
            .filter((el: any) => el.tags?.name)
            .map((el: any) => ({
              id: el.id,
              lat: el.lat || el.center.lat,
              lon: el.lon || el.center.lon,
              tags: el.tags || {}
            }));
          setHospitals(results);
          success = true;
          fetchAiEnhancements(results);
          break;
        }
      } catch (err: any) {
        console.error(`Mirror ${proxy} failed:`, err.message);
      }
    }
    if (!success) setError("Failed to fetch nearby hospitals. Please try again later.");
    setLoading(false);
  };

  const fetchAiEnhancements = async (hospitalList: any[]) => {
    try {
      const topHospitals = hospitalList.slice(0, 7);
      const response = await api.post("/emergency/enhance-hospitals", { hospitals: topHospitals });
      setAiDetails(response.data);
    } catch (err) {
      console.error("Gemini Enhancement Failed:", err);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation([coords.latitude, coords.longitude]);
        fetchNearbyHospitals(coords.latitude, coords.longitude);
      },
      () => {
        setError("Could not access your location. Please check permissions.");
        setLoading(false);
      }
    );
  }, []);

  return (
    <main className="min-h-screen pt-8 pb-24 px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-500/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-orange-500/5 blur-[120px] -z-10 rounded-full"></div>

      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-10 font-black uppercase tracking-widest text-xs group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-5"
          >
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
              <div className="relative p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                <MapPin className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
                Nearby <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">Emergency</span> Services
              </h1>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 mt-1.5 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-red-400" /> AI-Powered Real-Time Facility Tracker · 8 KM Radius
              </p>
            </div>
          </motion.div>

          {/* Tracking Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl backdrop-blur-xl"
          >
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
              <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-60"></div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Current Status</p>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-400">Tracking Active</p>
            </div>
            <Wifi className="w-5 h-5 text-cyan-400 ml-2" />
          </motion.div>
        </header>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass p-6 rounded-[2rem] border border-red-500/20 bg-red-500/5 text-center mb-8 flex flex-col items-center gap-4"
            >
              <p className="text-red-400 font-black uppercase tracking-widest text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="relative group/btn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl blur-sm opacity-50 group-hover/btn:opacity-100 transition"></div>
                <div className="relative bg-black/40 border border-white/10 py-2.5 px-6 rounded-xl text-sm font-black uppercase tracking-widest text-white active:scale-95 transition-transform">
                  Retry Access
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Column */}
          <div className="lg:col-span-2">
            {location ? (
              <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <Map center={location} hospitals={hospitals} />
              </div>
            ) : (
              <div className="h-[320px] md:h-[500px] w-full glass rounded-[2rem] border border-white/10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-5">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-2 border-red-400/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-t-2 border-red-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-3 bg-red-500/10 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-red-400" />
                    </div>
                  </div>
                  <p className="text-red-400 font-black uppercase tracking-widest text-xs animate-pulse">Accessing GPS Location...</p>
                </div>
              </div>
            )}
          </div>

          {/* Facility List Column */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            <div className="sticky top-0 bg-transparent backdrop-blur-xl py-3 z-10">
              <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 flex items-center gap-3">
                <Search className="w-5 h-5 text-red-400" />
                List of Facilities
              </h3>
            </div>

            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="glass h-32 animate-pulse bg-white/5 border-white/10 rounded-[2rem]"></div>
              ))
            ) : hospitals.length > 0 ? (
              hospitals.map((h, i) => {
                const geminiData = aiDetails[h.id];
                const name = geminiData?.name || h.tags.name || "Hospital";
                const hasPhone = !!(h.tags.phone || h.tags["contact:phone"]);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass p-5 rounded-[2rem] border border-white/10 flex flex-col gap-4 hover:border-red-500/30 transition-all group relative overflow-hidden shadow-lg"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 blur-2xl -z-10"></div>

                    <div>
                      <h4 className="font-black text-white group-hover:text-red-300 transition-colors tracking-tight">
                        {name}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1 font-medium leading-relaxed">
                        {formatAddress(h.tags) || geminiData?.likely_address || "Searching address..."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(h.tags.emergency === "yes" || geminiData?.is_24_7) && (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/20">
                          24/7 ER
                        </span>
                      )}
                      <span className="text-[9px] font-black uppercase tracking-widest bg-cyan-500/15 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20">
                        {geminiData?.specialties || "General Medicine"}
                      </span>
                    </div>

                    {geminiData?.ai_tip && (
                      <div className="bg-cyan-500/5 p-3 rounded-2xl border border-cyan-500/15 flex gap-3 items-start">
                        <div className="mt-0.5 w-4 h-4 bg-cyan-500/20 rounded-full flex items-center justify-center shrink-0 border border-cyan-500/30">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                        </div>
                        <p className="text-[10px] text-cyan-300/70 leading-relaxed">
                          <span className="font-black uppercase text-[9px] text-cyan-400 block mb-1 tracking-widest">AI Insight</span>
                          {geminiData.ai_tip}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-white/5">
                      <a
                        href={`tel:${h.tags.phone || h.tags["contact:phone"] || ""}`}
                        className={`flex-1 group/call relative overflow-hidden rounded-xl ${!hasPhone ? 'opacity-40 pointer-events-none' : ''}`}
                        onClick={(e) => !hasPhone && e.preventDefault()}
                      >
                        {hasPhone && <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-80 group-hover/call:opacity-100 transition"></div>}
                        <div className={`relative ${hasPhone ? 'bg-black/20' : 'bg-white/5 border border-white/10'} py-2.5 px-4 rounded-xl flex items-center justify-center gap-2`}>
                          <Phone className="w-3.5 h-3.5 text-white" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">Call</span>
                        </div>
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                        target="_blank"
                        className="flex-1 group/nav relative overflow-hidden rounded-xl"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-500 opacity-50 group-hover/nav:opacity-80 transition"></div>
                        <div className="relative bg-black/30 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-white/10">
                          <Navigation className="w-3.5 h-3.5 text-white" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">Navigate</span>
                        </div>
                      </a>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass py-20 text-center rounded-[2rem] border border-white/5"
              >
                <MapPin className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-600 font-black uppercase tracking-widest text-xs">No hospitals found within 8km</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
