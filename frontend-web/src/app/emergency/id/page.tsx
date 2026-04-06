"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, Info, Loader2, Phone, Save, Share2, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";

export default function EmergencyIDPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/health/profile");
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#030711",
        scale: 2
      });
      const link = document.createElement("a");
      link.download = `Medical_ID_${user?.name?.replace(/\s/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download Error:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
      </div>
    );
  }

  const qrData = JSON.stringify({
    n: user?.name,
    b: profile?.emergencyInfo?.bloodGroup || "U",
    a: profile?.emergencyInfo?.allergies?.join(", ") || "None",
    m: profile?.emergencyInfo?.medications?.join(", ") || "None",
    ec: profile?.emergencyInfo?.emergencyContact?.phone || "None"
  });

  return (
    <main className="min-h-screen pt-8 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 font-medium text-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mb-10">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShieldCheck className="text-red-500 w-8 h-8" /> 
              Emergency Medical ID
            </h1>
            <p className="text-gray-400 mt-2">Generate a portable medical profile for paramedics and emergency responders.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Digital Card View */}
          <div className="space-y-6">
             <div 
               ref={cardRef}
               className="w-full max-w-[360px] mx-auto aspect-[1/1.6] bg-slate-950 border-2 border-red-500/30 rounded-[32px] p-8 shadow-2xl shadow-red-500/10 relative overflow-hidden"
             >
                {/* Texture/Header */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-600/20 to-transparent"></div>
                <div className="absolute top-4 right-6 text-red-500 font-black italic tracking-tighter opacity-50">MEDICAL EMERGENCY</div>

                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                           {user?.avatar ? (
                               // eslint-disable-next-line @next/next/no-img-element
                               <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                           ) : (
                               <User className="w-8 h-8 text-gray-500" />
                           )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">{user?.name}</h2>
                            <p className="text-red-400 text-xs font-black uppercase tracking-widest mt-1">
                                BLOOD: {profile?.emergencyInfo?.bloodGroup || "Unknown"}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center mb-8">
                        <div className="p-3 bg-white rounded-xl mb-4">
                            <QRCodeSVG 
                              value={qrData} 
                              size={160} 
                              level="H"
                              includeMargin={false}
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Scan for medical profile</p>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-red-500 uppercase">Emergency Contact</span>
                            <span className="text-sm font-medium text-white flex items-center gap-2">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {profile?.emergencyInfo?.emergencyContact?.phone || "Not set"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-red-500 uppercase">Known Allergies</span>
                            <span className="text-sm text-gray-300">
                                {profile?.emergencyInfo?.allergies?.join(", ") || "None recorded"}
                            </span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-between items-center mt-auto">
                         <div className="flex flex-col">
                             <span className="text-[9px] text-gray-600 font-bold">HealthAI</span>
                             <span className="text-[8px] text-gray-500">Secure Medical ID</span>
                         </div>
                         <ShieldCheck className="w-5 h-5 text-red-500/30" />
                    </div>
                </div>
             </div>

             <div className="flex gap-4 justify-center">
                <button 
                  onClick={downloadCard}
                  className="btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-500 border-none px-6"
                >
                  <Download className="w-4 h-4" /> Download Image
                </button>
             </div>
          </div>

          <div className="space-y-8">
             <div className="glass-card bg-red-500/5 border-red-500/20">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                   <Info className="w-5 h-5 text-red-400" /> How it works
                </h3>
                <ol className="space-y-4 text-gray-400 text-sm leading-relaxed">
                   <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs border border-red-500/20">1</span>
                      Paramedics or anyone who finds you scan this QR code with their phone camera.
                   </li>
                   <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs border border-red-500/20">2</span>
                      They immediately see your blood group, allergies, medications, and emergency contact.
                   </li>
                   <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs border border-red-500/20">3</span>
                      Download this card as an image and set it as your phone's **Lock Screen Wallpaper**.
                   </li>
                </ol>
             </div>

             <div className="glass-card">
                 <h3 className="text-lg font-bold mb-4">Sharing Options</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <button className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/10">
                        <Share2 className="w-6 h-6 text-cyan-400" />
                        <span className="text-xs font-bold text-gray-400">Share Link</span>
                    </button>
                    <button 
                      onClick={() => router.push('/profile')}
                      className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/10"
                    >
                        <Save className="w-6 h-6 text-green-400" />
                        <span className="text-xs font-bold text-gray-400">Update Info</span>
                    </button>
                 </div>
             </div>

             <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex gap-4 text-orange-200">
                <Info className="w-6 h-6 flex-shrink-0" />
                <p className="text-xs">
                    This ID contains sensitive health data. Only share it with trusted medical personnel or set it as a lock screen if you are comfortable with the visibility.
                </p>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
