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
  PlusCircle, 
  Loader2, 
  AlertTriangle,
  CheckCircle2,
  Info
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart, Bar, Cell, LabelList, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
        // Fetch history and profile in parallel, but handle their results independently
        const [historyRes, profileRes] = await Promise.allSettled([
          api.get("/health/history"),
          api.get("/health/profile")
        ]);

        if (historyRes.status === "fulfilled") {
          setHistory(historyRes.value.data);
        } else {
          console.error("Error fetching history", historyRes.reason);
        }

        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value.data);
        } else {
          // If profile fetch fails with any status (like 404), treat as null
          console.warn("Profile not found or error fetching profile. User may need to complete setup.");
          setProfile(null);
        }
      } catch (err) {
        console.error("Unexpected error in dashboard data fetching", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
    // If not loading auth anymore and no user, skip data fetch
    if (!authLoading && !user) setLoading(false);
  }, [user, authLoading]);

  // Only show full-screen loader BEFORE we know auth status
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  // Once auth is known, render the shell immediately — data cards show their own loaders
  const latestPrediction = history.length > 0 ? history[0] : null;

  return (
    <main className="min-h-screen pt-8 md:pt-12 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
          <p className="text-gray-400 mt-2">Here&apos;s an overview of your health status and recent analysis.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Status Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] -z-10"></div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" /> Latest Risk Assessment
                  </h2>
                  {latestPrediction ? (
                    <div className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-black uppercase ${
                          latestPrediction.prediction.riskLevel === 'Low' ? 'text-green-400' :
                          latestPrediction.prediction.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {latestPrediction.prediction.riskLevel}
                        </span>
                        <span className="text-gray-500 font-medium">Risk Level</span>
                      </div>
                      <p className="text-gray-400 text-sm max-w-md">
                        Based on your reported symptoms ({(latestPrediction.symptoms || []).map((s: any) => s.name).join(', ')})
                        from {new Date(latestPrediction.date).toLocaleDateString()}.
                      </p>
                      <div className="flex gap-3">
                        <Link href="/history" className="text-cyan-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                          View Details <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-400 italic">No predictions yet. Let&apos;s analyze your health.</p>
                      <Link href="/predict" className="btn-primary inline-flex">
                        Start New Analysis
                      </Link>
                    </div>
                  )}
                </div>

                {latestPrediction && (
                  <div className="w-48 h-48 shrink-0 rounded-full flex flex-col items-center justify-center relative mx-auto md:mx-0">
                    <svg viewBox="0 0 192 192" className="absolute inset-0 w-full h-full -rotate-90 overflow-visible">
                      <circle
                        cx="96" cy="96" r="84"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-white/5"
                      />
                      <circle
                        cx="96" cy="96" r="84"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeDasharray={527}
                        strokeDashoffset={527 - (527 * (latestPrediction.prediction.probability || 0) / 100)}
                        strokeLinecap="round"
                        className={`${
                          latestPrediction.prediction.riskLevel === 'Low' ? 'text-green-400' :
                          latestPrediction.prediction.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                        }`}
                      />
                    </svg>
                    <span className="text-3xl font-black">{Math.round(latestPrediction.prediction.probability || 0)}%</span>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Confidence</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions / Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <DashboardMetric 
                  icon={<Activity className="w-5 h-5 text-cyan-400" />}
                  label="Daily Activity"
                  value={profile?.lifestyle?.activityLevel || "N/A"}
                  trend="Stable"
               />
               <DashboardMetric 
                  icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
                  label="Health Score"
                  value={latestPrediction ? (latestPrediction.prediction.riskLevel === 'Low' ? '92/100' : '74/100') : "N/A"}
                  trend="+2.4%"
               />
            </div>

            {/* History Chart */}
            {history.length > 0 && (
              <div className="glass-card p-6 h-80 border border-white/5">
                <h3 className="font-bold mb-6 text-gray-300">Risk Probability Over Time</h3>
                {mounted ? (
                  <div className="w-full" style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={[...history].reverse().map(item => ({
                      ...item,
                      chartProb: Array.isArray(item.prediction.probability) ? item.prediction.probability[0] : item.prediction.probability,
                      chartColor: item.prediction.riskLevel === 'Low' ? '#4ade80' : item.prediction.riskLevel === 'Medium' ? '#facc15' : '#f87171'
                    }))} 
                    margin={{ top: 20, right: 5, left: -20, bottom: 5 }}
                  >
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                      stroke="#ffffff33" 
                      fontSize={12} 
                      dy={10} 
                      tickLine={false}
                    />
                    <YAxis stroke="#ffffff33" fontSize={12} domain={[0, 100]} dx={-10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-black/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl flex flex-col min-w-[120px]">
                              <span className="text-gray-400 text-xs font-bold mb-2">{label ? new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : ''}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-white text-2xl font-black">{Math.round(data.chartProb)}%</span>
                                <span 
                                  className="text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wider border"
                                  style={{ 
                                    color: data.chartColor, 
                                    backgroundColor: `${data.chartColor}20`,
                                    borderColor: `${data.chartColor}40`
                                  }}
                                >
                                  {data.prediction.riskLevel} Risk
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="chartProb" radius={[6, 6, 0, 0]} maxBarSize={50}>
                      {
                        [...history].reverse().map((entry, index) => {
                          const risk = entry.prediction.riskLevel;
                          const color = risk === 'Low' ? '#4ade80' : risk === 'Medium' ? '#facc15' : '#f87171';
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })
                      }
                      <LabelList 
                        dataKey="chartProb" 
                        position="top" 
                        fill="#9ca3af" 
                        fontSize={11} 
                        fontWeight="bold"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-xl border border-dashed border-white/10 animate-pulse">
                  <span className="text-[10px] uppercase font-bold text-gray-600">Calculating dimensions...</span>
                </div>
              )}
            </div>
          )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <DailyHabits />

            <div className="glass-card">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" /> Health Summary
              </h3>
              {profile ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">BMI</span>
                    <span className="font-bold text-cyan-400">{profile.bmi}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Smoking</span>
                    <span className="font-bold">{profile.lifestyle.smoking ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Last Update</span>
                    <span className="font-bold text-xs uppercase text-gray-500">{new Date().toLocaleDateString()}</span>
                  </div>
                  <Link href="/profile" className="text-cyan-400 text-xs font-bold block mt-4 hover:underline">
                    Edit Profile Details
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-4">Complete your profile for better insights.</p>
                  <Link href="/profile" className="text-cyan-400 text-sm font-bold">
                    Setup Profile
                  </Link>
                </div>
              )}
            </div>

            <div className="glass-card">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" /> Recent History
              </h3>
              <div className="space-y-3">
                {history.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className={`w-2 h-2 rounded-full ${
                      item.prediction.riskLevel === 'Low' ? 'bg-green-400' :
                      item.prediction.riskLevel === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate capitalize">{(item.symptoms || []).map((s:any)=>s.name).join(', ') || 'General'}</p>
                      <p className="text-[10px] text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {history.length === 0 && <p className="text-gray-500 text-xs italic">No items to show.</p>}
                {history.length > 3 && (
                  <Link href="/history" className="text-gray-400 text-xs font-bold block text-center mt-2 hover:text-white">
                    View All History
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

function DashboardMetric({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">{trend}</span>
      </div>
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black capitalize">{value}</p>
      </div>
    </div>
  );
}

function DailyHabits() {
  const [habits, setHabits] = useState([
    { id: 'water', label: 'Drink 2L Water', completed: false },
    { id: 'meds', label: 'Take Vitamins/Meds', completed: false },
    { id: 'walk', label: '30 Min Exercise', completed: false }
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
    <div className="glass-card flex flex-col">
      <h3 className="font-bold mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-400" /> Daily Wellness
        </div>
        <span className="text-sm font-bold text-cyan-400">{progress}%</span>
      </h3>
      
      {/* Progress Bar */}
      <div className="w-full bg-white/5 rounded-full h-2 mb-5 overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500 to-green-400 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="space-y-2">
        {habits.map(habit => (
          <div 
            key={habit.id} 
            onClick={() => toggleHabit(habit.id)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors group"
          >
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${habit.completed ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-cyan-400'}`}>
              {habit.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className={`text-sm font-medium transition-colors ${habit.completed ? 'text-cyan-400 opacity-70' : 'text-gray-200'}`}>
              {habit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
