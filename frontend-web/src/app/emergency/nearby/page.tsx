"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Loader2, MapPin, Navigation, Phone, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

// Dynamically import Leaflet map to avoid SSR issues
const Map = dynamic(() => import("@/components/emergency/Map"), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-white/5 animate-pulse rounded-2xl flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
});

export default function NearbyEmergencyPage() {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchNearbyHospitals = async (lat: number, lon: number) => {
    try {
      // Overpass API Query for hospitals within 5km
      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:5000, ${lat}, ${lon});
          way["amenity"="hospital"](around:5000, ${lat}, ${lon});
          relation["amenity"="hospital"](around:5000, ${lat}, ${lon});
        );
        out center;
      `;
      const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      
      const results = response.data.elements.map((el: any) => ({
        id: el.id,
        lat: el.lat || el.center.lat,
        lon: el.lon || el.center.lon,
        tags: el.tags
      }));
      
      setHospitals(results);
    } catch (err) {
      console.error("Overpass API Error:", err);
      setError("Failed to fetch nearby hospitals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation([latitude, longitude]);
        fetchNearbyHospitals(latitude, longitude);
      },
      (err) => {
        setError("Could not access your location. Please check permissions.");
        setLoading(false);
      }
    );
  }, []);

  return (
    <main className="min-h-screen pt-8 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 font-medium text-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin className="text-red-500 w-8 h-8" /> 
              Nearby Emergency Services
            </h1>
            <p className="text-gray-400 mt-2">Find the closest hospitals and medical facilities in real-time.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="bg-cyan-500/10 p-2 rounded-lg">
                <Navigation className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-sm">
                <p className="text-gray-400">Current Status</p>
                <p className="font-bold text-white uppercase tracking-wider text-[10px]">Tracking Active</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center mb-8">
            <p className="text-red-400 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-all"
            >
              Retry Access
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {location ? (
              <Map center={location} hospitals={hospitals} />
            ) : (
                <div className="h-[500px] w-full bg-white/5 animate-pulse rounded-2xl flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                        <p className="text-cyan-500 font-medium animate-pulse">Accessing your GPS location...</p>
                    </div>
                </div>
            )}
          </div>

          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
             <h3 className="text-xl font-bold flex items-center gap-2 sticky top-0 bg-gray-950 py-2 z-10">
                 <Search className="w-5 h-5 text-cyan-400" /> List of Facilities
             </h3>
             
             {loading ? (
                Array(5).fill(0).map((_, i) => (
                    <div key={i} className="glass-card animate-pulse">
                        <div className="h-4 w-3/4 bg-white/10 rounded mb-4"></div>
                        <div className="h-3 w-1/2 bg-white/10 rounded"></div>
                    </div>
                ))
             ) : hospitals.length > 0 ? (
                hospitals.map((h, i) => (
                    <div key={i} className="glass-card flex flex-col gap-4 hover:border-cyan-500/30 transition-all group">
                        <div>
                            <h4 className="font-bold text-lg group-hover:text-cyan-400 transition-colors">
                                {h.tags.name || "Hospital"}
                            </h4>
                            <p className="text-sm text-gray-400 mt-1 capitalize">
                                {h.tags["addr:street"] || h.tags["addr:city"] || "Address not specified"}
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                            {h.tags.emergency === "yes" && (
                                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-lg border border-red-500/20">24/7 ER</span>
                            )}
                            {h.tags.healthcare === "hospital" && (
                                <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-lg border border-cyan-500/20">Multi-Speciality</span>
                            )}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-white/5">
                            <a 
                                href={`tel:${h.tags.phone || h.tags["contact:phone"] || ""}`}
                                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                                    (h.tags.phone || h.tags["contact:phone"]) 
                                    ? "bg-green-600 hover:bg-green-500 text-white" 
                                    : "bg-white/5 text-gray-400 cursor-not-allowed opacity-50"
                                }`}
                                onClick={(e) => !(h.tags.phone || h.tags["contact:phone"]) && e.preventDefault()}
                            >
                                <Phone className="w-3 h-3" /> Call
                            </a>
                            <a 
                                href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                                target="_blank"
                                className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center justify-center gap-2 text-xs font-bold transition-all"
                            >
                                <Navigation className="w-3 h-3" /> Nav
                            </a>
                        </div>
                    </div>
                ))
             ) : (
                <div className="text-center py-20 text-gray-500 glass-card">
                    <p>No hospitals found within 5km of your location.</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </main>
  );
}
