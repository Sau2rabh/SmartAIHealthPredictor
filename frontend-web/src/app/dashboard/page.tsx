"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { 
  Activity, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Loader2, 
  CheckCircle2,
  Info,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 500);
    
    // Silence the specific Recharts width/height warning during mount
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('The width(-1) and height(-1) of chart should be greater than 0')) return;
      originalWarn(...args);
    };

    return () => { 
      clearTimeout(timer);
      console.warn = originalWarn;
    };
  }, []);

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("token");
    if (!authLoading && !user && !hasToken) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, profileRes] = await Promise.allSettled([
          api.get("/health/history"),
          api.get("/health/profile")
        ]);

        if (historyRes.status === "fulfilled") {
          setHistory(historyRes.value.data);
        }

        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value.data);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Unexpected error in dashboard data fetching", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
    if (!authLoading && !user) setLoading(false);
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-cyan-500 animate-pulse font-black uppercase tracking-widest text-[11px] italic">
        Syncing Medical Data...
      </div>
    );
  }

  const latestPrediction = history.length > 0 ? history[0] : null;

  return (
    <main className="min-h-screen pt-10 md:pt-16 pb-20 px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-500/5 blur-[120px] -z-10 rounded-full"></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-500/5 blur-[120px] -z-10 rounded-full"></div>

      <div className="max-w-7xl mx-auto">
        <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter text-white">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 mt-3 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-cyan-500/50" /> System Status: <span className="text-emerald-400">Optimal</span>
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
             <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Live Reports Available</span>
             </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-10">
            {/* Main Status Area */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 md:p-8 xl:p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden group backdrop-blur-3xl"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-600/10 blur-[100px] pointer-events-none transition-all group-hover:bg-cyan-600/20"></div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-4 flex items-center justify-center md:justify-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Latest Health Insight
                  </h2>
                  
                  {latestPrediction ? (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                           <span className={`text-4xl md:text-6xl font-black uppercase tracking-tighter ${
                             latestPrediction.prediction.riskLevel === 'Low' ? 'bg-clip-text text-transparent bg-gradient-to-br from-emerald-400 to-green-600' :
                             latestPrediction.prediction.riskLevel === 'Medium' ? 'bg-clip-text text-transparent bg-gradient-to-br from-amber-400 to-yellow-600' : 'bg-clip-text text-transparent bg-gradient-to-br from-red-400 to-rose-600'
                           }`}>
                             {latestPrediction.prediction.riskLevel}
                           </span>
                           <div className="flex flex-col leading-none">
                             <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Risk</span>
                             <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Level</span>
                           </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-xs md:text-sm font-medium max-w-md leading-relaxed">
                        Detected symptoms: <span className="text-white">{(latestPrediction.symptoms || []).map((s: any) => s.name).join(', ') || 'General Overview'}</span>
                        <br/> Assessment generated on <span className="text-cyan-500/80 italic font-bold">{new Date(latestPrediction.date).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}</span>.
                      </p>

                      <div className="flex items-center justify-center md:justify-start pt-2">
                        <Link href="/history" className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2 group/btn">
                          View Intel <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-400 text-sm font-medium italic">No recent scans available. Let&apos;s analyze your present health patterns.</p>
                      <Link href="/predict" className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl text-white font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-3">
                        Initialize Diagnostic <Activity className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>

                {latestPrediction && (
                  <div className="w-36 h-36 md:w-48 md:h-48 xl:w-56 xl:h-56 shrink-0 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-cyan-500/5 blur-2xl rounded-full"></div>
                    <svg viewBox="0 0 192 192" className="absolute inset-0 w-full h-full -rotate-90 overflow-visible">
                      <circle cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="1" className="text-white/5" />
                      <motion.circle
                        initial={{ strokeDashoffset: 553 }}
                        animate={{ strokeDashoffset: 553 - (553 * (latestPrediction.prediction.probability || 0) / 100) }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        cx="96" cy="96" r="88"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={553}
                        strokeLinecap="round"
                        className={`${
                          latestPrediction.prediction.riskLevel === 'Low' ? 'text-emerald-400' :
                          latestPrediction.prediction.riskLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'
                        } filter drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]`}
                      />
                    </svg>
                    <div className="flex flex-col items-center">
                       <span className="text-3xl md:text-5xl font-black italic tracking-tighter text-white">{Math.round(latestPrediction.prediction.probability || 0)}%</span>
                       <span className="text-[8px] uppercase font-black text-gray-500 tracking-[0.3em] mt-1">Confidence</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <DashboardMetric 
                  icon={<Activity className="w-6 h-6 text-cyan-400" />}
                  label="Metabolic Status"
                  value={profile?.lifestyle?.activityLevel || "Nominal"}
                  trend="+2.4%"
                  color="cyan"
               />
               <DashboardMetric 
                  icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
                  label="Health Quintessential"
                  value={latestPrediction?.prediction?.healthScore ? `${latestPrediction.prediction.healthScore}/100` : "84/100"}
                  trend={latestPrediction?.prediction?.healthScore > 80 ? "Superior" : "Standard"}
                  color="emerald"
               />
            </div>

            {/* Visual Analytics */}
            {history.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-10 rounded-[3rem] border border-white/10 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                   <div>
                    <h3 className="font-black text-2xl text-white tracking-tight flex items-center gap-3 italic">
                      <TrendingUp className="w-6 h-6 text-cyan-400" /> Longitudinal Assessment
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">Wellness Score Variance (30-Day Period)</p>
                   </div>
                   <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Temporal Resolution: High</span>
                   </div>
                </div>

                <div className="w-full h-80">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={[...history].reverse().map(item => ({
                          ...item,
                          displayDate: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                          score: item.prediction.healthScore || 0,
                          color: (item.prediction.healthScore || 0) > 80 ? '#10b981' : (item.prediction.healthScore || 0) > 50 ? '#f59e0b' : '#ef4444'
                        }))} 
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                        <XAxis 
                          dataKey="displayDate" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }}
                          dy={15}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }}
                          domain={[0, 105]}
                        />
                        <Tooltip 
                          cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="glass border border-white/10 p-5 rounded-3xl shadow-2xl backdrop-blur-3xl min-w-[140px]"
                                >
                                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">{data.displayDate}</p>
                                  <div className="flex items-center gap-4">
                                     <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_currentColor]" style={{ color: data.color, backgroundColor: data.color }}></div>
                                     <div className="flex flex-col">
                                       <span className="text-3xl font-black italic text-white tracking-tighter">{Math.round(data.score)}</span>
                                       <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Wellness Index</span>
                                     </div>
                                  </div>
                                </motion.div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#06b6d4" 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill="url(#colorScore)" 
                          strokeLinecap="round"
                          activeDot={{ r: 8, fill: '#0a0a0b', stroke: '#06b6d4', strokeWidth: 4 }}
                          dot={{ r: 4, fill: '#0a0a0b', stroke: '#06b6d4', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full bg-white/[0.02] rounded-3xl border border-dashed border-white/5 animate-pulse flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 italic">Synthesizing Chart Data...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar / Peripheral Controls */}
          <div className="space-y-10">
            <DailyHabits />

            {/* Health Summary Card */}
            <div className="glass p-8 rounded-[3rem] border border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl -z-10"></div>
               <h3 className="font-black text-xl text-white tracking-tight mb-8 flex items-center gap-4">
                 <div className="p-2 bg-white/5 rounded-xl border border-white/5"><Info className="w-4 h-4 text-cyan-400" /></div> Health Summary
               </h3>
               
               {profile ? (
                 <div className="space-y-6">
                    {[
                      { label: "BMI", value: profile.bmi, color: "text-cyan-400" },
                      { label: "Smoking", value: profile.lifestyle.smoking ? "Positive" : "Negative", color: profile.lifestyle.smoking ? "text-red-400" : "text-emerald-400" },
                      { label: "Pulse Status", value: "Verified", color: "text-emerald-400" }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center py-4 border-b border-white/5">
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">{row.label}</span>
                        <span className={`text-sm font-black italic ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                    <Link href="/profile" className="w-full mt-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all text-center block">
                      Edit Profile Matrix
                    </Link>
                 </div>
               ) : (
                 <div className="text-center py-8">
                   <p className="text-gray-500 text-xs font-bold leading-relaxed mb-6 italic uppercase tracking-widest">Data incomplete. Please initialize profile sequence.</p>
                   <Link href="/profile" className="px-8 py-3 bg-cyan-600/20 text-cyan-400 border border-cyan-600/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600/30 transition-all inline-block">
                     Setup Profile
                   </Link>
                 </div>
               )}
            </div>

            {/* Recent History Card */}
            <div className="glass p-8 rounded-[3.15rem] border border-white/10 backdrop-blur-3xl">
              <h3 className="font-black text-xl text-white tracking-tight mb-8 flex items-center gap-4">
                <div className="p-2 bg-white/5 rounded-xl border border-white/5"><Calendar className="w-4 h-4 text-cyan-400" /></div> Chronological Logs
              </h3>
              <div className="space-y-4">
                {history.slice(0, 3).map((item, i) => (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i} className="flex items-center gap-4 p-4 rounded-[2rem] bg-white/[0.03] border border-white/5 group hover:bg-white/[0.06] hover:border-cyan-500/20 transition-all cursor-pointer">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${
                      item.prediction.riskLevel === 'Low' ? 'bg-emerald-400 shadow-emerald-500/20' :
                      item.prediction.riskLevel === 'Medium' ? 'bg-amber-400 shadow-amber-500/20' : 'bg-red-400 shadow-red-500/20'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-200 truncate italic">{(item.symptoms || []).map((s:any)=>s.name).join(', ') || 'Diagnostic Report'}</p>
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mt-1">{new Date(item.date).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-cyan-400 transition-colors" />
                  </motion.div>
                ))}
                {history.length === 0 && <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest text-center py-6 italic">No history logged.</p>}
                {history.length > 3 && (
                  <Link href="/history" className="text-[9px] font-black uppercase text-gray-600 tracking-[0.4em] block text-center mt-6 hover:text-white transition-colors">
                    View Entire Log Book
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DashboardMetric({ icon, label, value, trend, color }: { icon: React.ReactNode, label: string, value: string, trend: string, color: 'cyan' | 'emerald' }) {
  return (
    <motion.div whileHover={{ y: -5 }} className="glass p-8 rounded-[3rem] border border-white/10 group transition-all">
      <div className="flex items-center justify-between mb-8">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-white/20 transition-all">{icon}</div>
        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md ${
           color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        }`}>
           {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-2">{label}</p>
        <p className="text-3xl font-black text-white italic tracking-tighter">{value}</p>
      </div>
    </motion.div>
  );
}

function DailyHabits() {
  const [habits, setHabits] = useState([
    { id: 'water', label: 'Hydration Target (2L)', completed: false, icon: <Zap className="w-4 h-4" /> },
    { id: 'meds', label: 'Clinical Protocols', completed: false, icon: <Zap className="w-4 h-4" /> },
    { id: 'walk', label: 'Kinetic Activity (30m)', completed: false, icon: <Zap className="w-4 h-4" /> }
  ]);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const today = new Date().toISOString().split('T')[0];
    const savedHabits = localStorage.getItem(`habits_${today}`);
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  const toggleHabit = (id: string) => {
    const newHabits = habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h);
    setHabits(newHabits);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`habits_${today}`, JSON.stringify(newHabits));
  };

  if (!mounted) return null;

  const progress = Math.round((habits.filter(h => h.completed).length / habits.length) * 100);

  return (
    <div className="glass p-8 rounded-[3.25rem] border border-white/10 flex flex-col backdrop-blur-3xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black text-xl text-white tracking-tight flex items-center gap-4">
           <div className="p-2 bg-white/5 rounded-xl border border-white/5"><ShieldCheck className="w-4 h-4 text-emerald-400" /></div> Daily Matrix
        </h3>
        <span className="text-lg font-black italic text-cyan-400 tracking-tighter">{progress}%</span>
      </div>
      
      {/* Sleek Progress Bar */}
      <div className="w-full bg-white/5 rounded-full h-2 mb-10 overflow-hidden border border-white/5 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"
        ></motion.div>
      </div>

      <div className="space-y-3">
        {habits.map(habit => (
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            key={habit.id} 
            onClick={() => toggleHabit(habit.id)}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${habit.completed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-cyan-500/20'}`}
          >
            <div className={`w-6 h-6 rounded-xl flex items-center justify-center transition-all ${habit.completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 border border-white/10 text-gray-700 group-hover:text-cyan-400 group-hover:border-cyan-400'}`}>
              {habit.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${habit.completed ? 'text-emerald-400 opacity-80 italic' : 'text-gray-300'}`}>
              {habit.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
