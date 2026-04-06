"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, Info, Loader2, Phone, Save, Share2, ShieldCheck, User, Sparkles, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
      <div className="min-h-screen flex items-center justify-center text-red-500 animate-pulse font-black uppercase tracking-widest text-sm italic">
        Loading Medical ID...
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
    <main className="min-h-screen pt-8 pb-24 px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-500/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-rose-500/5 blur-[120px] -z-10 rounded-full"></div>

      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-10 font-black uppercase tracking-widest text-xs group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Header */}
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-5"
          >
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-rose-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
              <div className="relative p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                <ShieldCheck className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
                Emergency <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-400">Medical ID</span>
              </h1>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 mt-1.5 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-red-400" /> Portable Medical Profile for First Responders
              </p>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Medical Card + Download */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div
              ref={cardRef}
              className="w-full max-w-[360px] mx-auto min-h-[600px] bg-slate-950 border-2 border-red-500/30 rounded-[32px] p-8 md:p-10 shadow-2xl shadow-red-500/10 relative overflow-hidden flex flex-col"
            >
              {/* Card Background Texture */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-600/20 to-transparent"></div>
              <div className="absolute top-5 right-6 text-red-500/50 font-black italic tracking-tighter text-xs uppercase">Medical Emergency</div>

              <div className="relative z-10 flex flex-col flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white leading-tight tracking-tight">{user?.name}</h2>
                    <p className="text-red-400 text-xs font-black uppercase tracking-widest mt-1">
                      Blood: {profile?.emergencyInfo?.bloodGroup || "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center mb-6">
                  <div className="p-3 bg-white rounded-xl mb-3">
                    <QRCodeSVG value={qrData} size={150} level="H" includeMargin={false} />
                  </div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Scan for Medical Profile</p>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Emergency Contact</span>
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {profile?.emergencyInfo?.emergencyContact?.phone || "Not set"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Known Allergies</span>
                    <span className="text-sm text-gray-300 font-medium">
                      {profile?.emergencyInfo?.allergies?.join(", ") || "None recorded"}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-between items-center mt-8">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-600 font-black">HealthAI</span>
                    <span className="text-[8px] text-gray-500">Secure Medical ID</span>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-red-500/30" />
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadCard}
                className="relative group/btn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-500 rounded-2xl blur-md opacity-50 group-hover/btn:opacity-100 transition duration-300"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 py-4 px-8 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-transform">
                  <Download className="w-5 h-5 text-red-400" />
                  <span className="text-sm font-black uppercase tracking-widest text-white">Download Image</span>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* How it works */}
            <div className="glass p-7 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-3xl">
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-red-500/5 blur-3xl -z-10 rounded-full"></div>
              <h3 className="text-lg font-black uppercase tracking-widest text-red-400 mb-6 flex items-center gap-3 border-b border-white/5 pb-5">
                <Info className="w-5 h-5" />
                How It Works
              </h3>
              <ol className="space-y-5">
                {[
                  "Paramedics or anyone who finds you can scan this QR code with their phone camera.",
                  "They immediately see your blood group, allergies, medications, and emergency contact.",
                  <>Download this card as an image and set it as your phone&apos;s <span className="text-white font-black">Lock Screen Wallpaper</span>.</>
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-red-500/30 to-rose-500/10 text-red-400 flex items-center justify-center font-black text-xs border border-red-500/20">
                      {i + 1}
                    </span>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Sharing Options */}
            <div className="glass p-7 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-3xl">
              <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-6 border-b border-white/5 pb-5">
                Sharing Options
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="relative group/share overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 opacity-0 group-hover/share:opacity-100 transition duration-300"></div>
                  <div className="relative flex flex-col items-center gap-3 p-5 bg-white/[0.03] rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all">
                    <Share2 className="w-6 h-6 text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/share:text-white transition-colors">Share Link</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="relative group/update overflow-hidden rounded-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/10 opacity-0 group-hover/update:opacity-100 transition duration-300"></div>
                  <div className="relative flex flex-col items-center gap-3 p-5 bg-white/[0.03] rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all">
                    <Save className="w-6 h-6 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/update:text-white transition-colors">Update Info</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Privacy Warning */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-r from-orange-500/[0.06] to-amber-500/[0.04] border border-orange-500/20 flex gap-4 items-start">
              <div className="w-9 h-9 rounded-full bg-orange-400/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-[10px] text-orange-200/60 leading-relaxed font-medium">
                This ID contains sensitive health data. Only share it with trusted medical personnel or set it as a lock screen if you are comfortable with the visibility.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
