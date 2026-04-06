"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Activity, Plus, Trash2, Heart, Thermometer, Weight, History, Info, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';

interface Vital {
  _id: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  spO2?: number;
  bloodSugar?: number;
  weight?: number;
  temperature?: number;
  recordedAt: string;
}

export default function VitalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newVital, setNewVital] = useState({
    systolicBP: "",
    diastolicBP: "",
    heartRate: "",
    spO2: "",
    bloodSugar: "",
    weight: "",
    temperature: "",
    note: ""
  });

  const fetchVitals = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/vitals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVitals(response.data);
    } catch (err) {
      console.error("Fetch Vitals Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("token");
    if (!authLoading && !user && !hasToken) {
      router.push("/login");
    } else if (user) {
      fetchVitals();
    }
  }, [user, authLoading, router]);

  const handleAddVital = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const dataToSend = Object.fromEntries(
        Object.entries(newVital).map(([k, v]) => [k, v === "" ? undefined : (k === 'note' ? v : Number(v))])
      );
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/vitals`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAdding(false);
      setNewVital({ systolicBP: "", diastolicBP: "", heartRate: "", spO2: "", bloodSugar: "", weight: "", temperature: "", note: "" });
      fetchVitals();
    } catch (err) {
      console.error("Add Vital Error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/vitals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVitals();
    } catch (err) {
      console.error("Delete Vital Error:", err);
    }
  };

  const chartData = [...vitals].reverse().map(v => ({
    date: new Date(v.recordedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    bp: v.systolicBP,
    hr: v.heartRate,
    spO2: v.spO2,
    sugar: v.bloodSugar,
    fullDate: new Date(v.recordedAt).toLocaleString()
  }));

  const avgHR = vitals.filter(v => v.heartRate).length > 0
    ? Math.round(vitals.reduce((a, b) => a + (b.heartRate || 0), 0) / vitals.filter(v => v.heartRate).length)
    : null;
  const avgTemp = vitals.filter(v => v.temperature).length > 0
    ? (vitals.reduce((a, b) => a + (b.temperature || 0), 0) / vitals.filter(v => v.temperature).length).toFixed(1)
    : null;
  const lastWeight = vitals[0]?.weight ?? null;

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-screen text-rose-500 animate-pulse font-black uppercase tracking-widest text-sm italic">
      Initializing Vitals Engine...
    </div>
  );

  return (
    <main className="min-h-screen pt-10 md:pt-16 pb-24 px-6 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-500/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-pink-500/5 blur-[120px] -z-10 rounded-full"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-cyan-500/5 blur-[120px] -z-10 rounded-full"></div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-5"
        >
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-rose-600 to-pink-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
            <div className="relative p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
              <Activity className="w-8 h-8 text-rose-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
              Vitals <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-pink-400">Tracking</span>
            </h1>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 mt-1.5 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-rose-500" /> Real-Time Biometric Intelligence
            </p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAdding(!isAdding)}
          className="relative group/btn"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-500 rounded-2xl blur-md opacity-50 group-hover/btn:opacity-100 transition duration-300"></div>
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 py-4 px-8 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-transform">
            <Plus className={`w-5 h-5 text-rose-400 transition-transform duration-500 ${isAdding ? 'rotate-45' : ''}`} />
            <span className="text-sm font-black uppercase tracking-widest text-white">{isAdding ? 'Close Entry' : 'Log New Vitals'}</span>
          </div>
        </motion.button>
      </header>

      {/* Log Form */}
      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.div
            key="vitals-form"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass p-8 md:p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden mb-12 shadow-2xl backdrop-blur-3xl"
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-500/10 blur-3xl -z-10"></div>
            <h2 className="text-lg font-black uppercase tracking-widest text-rose-400 mb-8 flex items-center gap-3">
              <Activity className="w-5 h-5" />
              Log Current Vitals
            </h2>
            <form onSubmit={handleAddVital} className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { label: "Systolic BP", key: "systolicBP", placeholder: "120" },
                { label: "Diastolic BP", key: "diastolicBP", placeholder: "80" },
                { label: "Heart Rate", key: "heartRate", placeholder: "72 bpm" },
                { label: "SpO2 (%)", key: "spO2", placeholder: "98" },
                { label: "Blood Sugar", key: "bloodSugar", placeholder: "100 mg/dL" },
                { label: "Weight (kg)", key: "weight", placeholder: "70.5" },
                { label: "Temp (°C)", key: "temperature", placeholder: "36.6" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-rose-400/70 block mb-2">{label}</label>
                  <input
                    type="number"
                    step="any"
                    placeholder={placeholder}
                    value={(newVital as any)[key]}
                    onChange={e => setNewVital({ ...newVital, [key]: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500/50 placeholder:text-gray-600"
                  />
                </div>
              ))}
              <div className="col-span-2 md:col-span-4 flex justify-end mt-4">
                <button type="submit" className="relative overflow-hidden rounded-2xl group/sbtn">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-500 group-hover/sbtn:rotate-180 transition-transform duration-700"></div>
                  <div className="relative m-[1px] bg-black/40 backdrop-blur-xl rounded-2xl py-3 px-10 flex items-center gap-3 active:scale-[0.98] transition-transform">
                    <span className="text-sm font-black uppercase tracking-widest text-white">Save Entry</span>
                  </div>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Chart + Table Column */}
        <div className="xl:col-span-2 space-y-8">

          {/* Chart Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 md:p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-3xl min-h-[420px]"
          >
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/5 blur-3xl -z-10"></div>
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
              <h3 className="text-lg font-black uppercase tracking-widest text-rose-400 flex items-center gap-3">
                <Heart className="w-5 h-5" />
                Heart Rate &amp; BP Trends
              </h3>
              <div className="flex gap-5 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2 text-gray-400"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>HR (bpm)</span>
                <span className="flex items-center gap-2 text-gray-400"><div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>Systolic BP</span>
              </div>
            </div>

            <div className="h-[300px] w-full">
              {vitals.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="date" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #ffffff10', borderRadius: '16px', fontSize: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="hr" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHr)" dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="bp" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorBp)" dot={{ r: 4, fill: '#22d3ee', strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-rose-400/10 blur-2xl rounded-full scale-150 animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-white/[0.03] rounded-[1.5rem] flex items-center justify-center border border-white/5">
                      <History className="w-10 h-10 text-gray-700" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-black tracking-tight text-lg mb-2">No Trend Data Yet</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Log at least 2 entries to see your trends</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* History Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl backdrop-blur-3xl"
          >
            <div className="px-8 pt-8 pb-4 border-b border-white/5 flex items-center gap-3">
              <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 flex items-center gap-3">
                <History className="w-5 h-5 text-cyan-400" />
                Recent Records
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.03] text-[10px] uppercase tracking-widest text-gray-500 font-black">
                    <th className="px-8 py-4">Date &amp; Time</th>
                    <th className="px-6 py-4">BP (sys/dia)</th>
                    <th className="px-6 py-4">HR (bpm)</th>
                    <th className="px-6 py-4">SpO2 (%)</th>
                    <th className="px-6 py-4">Sugar</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {vitals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center text-gray-600 text-sm font-black uppercase tracking-widest">
                        No records logged yet
                      </td>
                    </tr>
                  ) : vitals.map((v) => (
                    <tr key={v._id} className="text-sm hover:bg-white/[0.03] transition-colors group/row">
                      <td className="px-8 py-5 text-gray-400 font-medium">
                        {new Date(v.recordedAt).toLocaleDateString()}
                        <br />
                        <span className="text-[10px] text-gray-600">{new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="px-6 py-5 font-black text-cyan-400">{v.systolicBP || '--'}/{v.diastolicBP || '--'}</td>
                      <td className="px-6 py-5 text-rose-400 font-black">{v.heartRate || '--'}</td>
                      <td className="px-6 py-5 text-emerald-400 font-black">{v.spO2 ? `${v.spO2}%` : '--'}</td>
                      <td className="px-6 py-5 text-amber-400 font-black">{v.bloodSugar || '--'}</td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-gray-500 hover:text-red-400 transition-all border border-white/5 active:scale-90 opacity-0 group-hover/row:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Health Summary Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-5"
        >
          <div className="glass p-6 md:p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-3xl">
            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-rose-500/5 blur-3xl -z-10"></div>
            <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-8 border-b border-white/5 pb-5">
              Health Summary
            </h3>
            <div className="space-y-4">
              {[
                { icon: <Heart className="w-5 h-5 text-rose-400" />, label: "Avg Heart Rate", value: avgHR ? `${avgHR} bpm` : "-- bpm", color: "from-rose-500/10 to-transparent" },
                { icon: <Thermometer className="w-5 h-5 text-amber-400" />, label: "Avg Temp", value: avgTemp ? `${avgTemp} °C` : "-- °C", color: "from-amber-500/10 to-transparent" },
                { icon: <Weight className="w-5 h-5 text-cyan-400" />, label: "Last Weight", value: lastWeight ? `${lastWeight} kg` : "-- kg", color: "from-cyan-500/10 to-transparent" },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-r ${color} border border-white/5 group hover:border-white/10 transition-all gap-3`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-xl border border-white/5 shrink-0">{icon}</div>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 truncate">{label}</span>
                  </div>
                  <span className="font-black text-white text-sm whitespace-nowrap">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex gap-3 items-start">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-300/70 leading-relaxed uppercase tracking-widest font-black">
                Frequent tracking helps AI provide 40% more accurate health risk predictions.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
