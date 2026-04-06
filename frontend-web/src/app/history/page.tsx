"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { 
  History, 
  Calendar, 
  Loader2, 
  ChevronRight,
  Filter,
  Search,
  Activity,
  ArrowUpDown,
  ArrowLeft,
  User,
  Sparkles,
  ChevronDown,
  ArrowUpRight,
  Stethoscope
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc"); 
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("token");
    if (!authLoading && !user && !hasToken) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get("/health/history");
        setHistory(data);
      } catch (err) {
        console.error("Error fetching history", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHistory();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-cyan-500 animate-pulse font-black uppercase tracking-widest text-[11px] italic">
        Syncing Chronic Data...
      </div>
    );
  }

  const filteredHistory = [...history]
    .sort((a, b) => {
      const dA = new Date(a.date).getTime();
      const dB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dB - dA : dA - dB;
    })
    .filter(record => {
      const query = searchQuery.toLowerCase();
      const matchRisk = selectedRisk === 'All' || record.prediction.riskLevel === selectedRisk;
      const matchContent = 
        user?.name?.toLowerCase().includes(query) ||
        (record.symptoms || []).some((s: any) => s.name.toLowerCase().includes(query)) ||
        new Date(record.date).toLocaleDateString().includes(query);
      
      return matchRisk && matchContent;
    });

  return (
    <main className="min-h-screen pt-10 md:pt-16 pb-20 px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-500/5 blur-[120px] -z-10 rounded-full"></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-500/5 blur-[120px] -z-10 rounded-full"></div>

      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-8 font-black uppercase tracking-widest text-[10px] group w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-600 to-blue-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
              <div className="relative p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                <History className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
                Analysis <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">History</span>
              </h1>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 mt-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-cyan-500/50" /> Diagnostic Temporal Log
              </p>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-4 relative">
            <div className="group/input relative">
              <div className="absolute -inset-1 bg-cyan-500/20 blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity"></div>
              <div className="relative glass px-5 py-3 rounded-2xl flex items-center gap-4 text-sm text-gray-400 focus-within:border-cyan-400/50 transition-all border border-white/10 backdrop-blur-3xl">
                <Search className="w-4 h-4 group-focus-within/input:text-cyan-400 transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Patient or symptom..." 
                  className="bg-transparent border-none outline-none text-white w-32 md:w-56 font-medium placeholder-gray-600" 
                />
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`glass p-3 rounded-2xl transition-all border backdrop-blur-3xl ${isFilterMenuOpen ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'border-white/10 text-gray-400 hover:text-white'}`}
              >
                 <Filter className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {isFilterMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="absolute right-0 top-full mt-4 w-64 glass border border-white/20 rounded-[2rem] p-6 z-[60] shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-3xl overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-2xl rounded-full -z-10"></div>
                    
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-500 mb-4 px-2">Risk Magnitude</p>
                    <div className="grid grid-cols-2 gap-2 mb-8">
                      {['All', 'Low', 'Medium', 'High'].map((risk) => (
                        <button
                          key={risk}
                          onClick={() => { setSelectedRisk(risk); setIsFilterMenuOpen(false); }}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            selectedRisk === risk 
                              ? 'bg-cyan-600/20 text-cyan-400 border-cyan-600/30 shadow-lg' 
                              : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-500'
                          }`}
                        >
                          {risk}
                        </button>
                      ))}
                    </div>

                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-500 mb-4 px-2">Data Sequence</p>
                    <div className="flex flex-col gap-2">
                       {[
                         { id: 'desc', label: 'Chronological (Newest)' },
                         { id: 'asc', label: 'Chronological (Oldest)' }
                       ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => { setSortOrder(option.id); setIsFilterMenuOpen(false); }}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            sortOrder === option.id ? 'bg-white/10 text-cyan-400' : 'text-gray-500 hover:bg-white/5'
                          }`}
                        >
                          {option.label}
                          {sortOrder === option.id && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>}
                        </button>
                       ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {filteredHistory.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-[3rem] border border-white/5 text-center py-24 opacity-50 flex flex-col items-center">
            <div className="p-6 bg-white/5 rounded-full mb-6">
               <Activity className="w-16 h-16 text-cyan-500/40" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2 italic">Diagnostic Vault Empty</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 max-w-xs">No historical medical records match the present query parameters.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
             {/* Dynamic Table Header */}
             <div className="grid grid-cols-12 px-10 py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 gap-4 mb-2">
                <div 
                  className="col-span-3 md:col-span-2 flex items-center gap-2 cursor-pointer hover:text-white transition-all group w-fit"
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                >
                   Date <ArrowUpDown className={`w-3 h-3 transition-colors ${sortOrder !== 'desc' ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                </div>
                <div className="col-span-3 hidden md:block">Patient Matrix</div>
                <div className="col-span-4 md:col-span-3">Detected Indications</div>
                <div className="col-span-2 text-center md:text-left pl-2">Risk Level</div>
                <div className="col-span-3 md:col-span-2 text-center">Diagnostics</div>
             </div>

             <AnimatePresence initial={false}>
               {filteredHistory.map((record, i) => (
                <motion.div
                  key={record._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative glass rounded-[2.5rem] flex flex-col group cursor-pointer transition-all duration-500 border overflow-hidden p-0 backdrop-blur-3xl shadow-none hover:shadow-2xl hover:shadow-cyan-900/10 ${
                    expandedId === record._id ? 'border-cyan-500/40 bg-white/[0.04]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                  }`}
                  onClick={() => setExpandedId(expandedId === record._id ? null : record._id)}
                >
                  {/* Probability Glow Bar at bottom of card */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent transition-all group-hover:via-cyan-500/80" style={{ width: `${record.prediction.probability}%` }}></div>

                  <div className="grid grid-cols-12 items-center px-6 md:px-10 py-5 md:py-8 gap-4 relative">
                    <div className="col-span-3 md:col-span-2 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400/70 hidden md:block" />
                        <span className="font-black text-[11px] md:text-[13px] text-gray-200 italic tracking-tighter truncate">
                          {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: '2-digit' })}
                        </span>
                      </div>
                      <span className="md:hidden text-[9px] uppercase tracking-widest text-cyan-500 font-bold truncate opacity-60 italic">{user?.name?.split(' ')[0]}</span>
                    </div>
                    
                    <div className="col-span-3 hidden md:flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 group-hover:text-cyan-400 transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-white italic tracking-tight truncate w-full">{user?.name || "Patient"}</span>
                    </div>

                    <div className="col-span-4 md:col-span-3 flex shrink-0 min-w-0 pr-2">
                      <div className="flex flex-wrap gap-1.5 truncate">
                         {(record.symptoms || []).slice(0, 2).map((s: any, j: number) => (
                           <span key={j} className="text-[9px] md:text-[11px] font-black uppercase tracking-widest px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-gray-500 group-hover:text-cyan-300 group-hover:border-cyan-300/30 transition-all whitespace-nowrap italic truncate max-w-[80px] md:max-w-none">
                             {s.name}
                           </span>
                         ))}
                         {(record.symptoms?.length || 0) > 2 && (
                           <span className="text-[9px] font-black text-gray-700 self-center uppercase tracking-widest italic">+{record.symptoms.length - 2}</span>
                         )}
                      </div>
                    </div>

                    <div className="col-span-2 flex justify-center md:justify-start w-full">
                      <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap shadow-lg ${
                        record.prediction.riskLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        record.prediction.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-100 border border-red-500/40 shadow-red-500/10'
                      }`}>
                        {record.prediction.riskLevel}
                      </div>
                    </div>

                    <div className="col-span-3 md:col-span-2 flex items-center justify-end md:justify-center font-black text-lg md:text-2xl text-white/20 transition-all md:pr-12 relative">
                       <span className={`transition-all duration-700 ${expandedId === record._id ? 'opacity-100 text-cyan-400 scale-110 tracking-widest' : 'group-hover:opacity-100 opacity-60 group-hover:scale-105 group-hover:text-white'}`}>
                        {Math.round(record.prediction.probability)}%
                       </span>
                    </div>

                    <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 items-center justify-center">
                       <div className={`p-3 bg-white/5 rounded-2xl border transition-all ${expandedId === record._id ? 'border-cyan-500 text-cyan-400 rotate-90 scale-110' : 'border-white/5 text-gray-700 group-hover:text-cyan-300'}`}>
                          <ChevronRight className="w-5 h-5" />
                       </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === record._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-10 pb-10 overflow-hidden border-t border-white/5 bg-white/[0.01]"
                      >
                         <div className="pt-10 grid grid-cols-1 md:grid-cols-12 gap-10">
                            <div className="md:col-span-5 space-y-8">
                               <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400/70 mb-5 flex items-center gap-3">
                                    <Activity className="w-4 h-4"/> Full Symptom Matrix
                                  </h4>
                                  <div className="flex flex-wrap gap-2.5">
                                     {(record.symptoms || []).map((s:any, k:number) => (
                                        <div key={k} className="px-4 py-3 bg-white/5 rounded-2xl text-[11px] font-black italic tracking-tight border border-white/10 text-gray-300 flex items-center gap-3 group/chip">
                                           <span className="uppercase">{s.name}</span>
                                           <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded-lg tracking-widest border ${
                                              s.severity === 'severe' ? 'text-red-400 border-red-400/20 bg-red-400/5' : 
                                              s.severity === 'moderate' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' : 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5'
                                           }`}>{s.severity}</span>
                                        </div>
                                     ))}
                                  </div>
                               </div>

                               {record.prediction.suggestedSpecialist && (
                                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-[2rem] bg-cyan-500/[0.03] border border-cyan-500/20 relative overflow-hidden group/tile">
                                     <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-3xl -z-10 group-hover/tile:bg-cyan-500/10 transition-colors"></div>
                                     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/60 mb-4 flex items-center gap-2">
                                        <Stethoscope className="w-3.5 h-3.5" /> Specialist Referral
                                     </p>
                                     <div className="flex items-center justify-between">
                                        <span className="text-xl font-black text-white italic tracking-tight">{record.prediction.suggestedSpecialist}</span>
                                        <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover/tile:text-cyan-400 transition-colors">
                                          <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                     </div>
                                  </motion.div>
                               )}
                            </div>
                            
                            <div className="md:col-span-7 space-y-8">
                               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400/70 mb-5 flex items-center gap-3">
                                  <Sparkles className="w-4 h-4"/> AI Diagnostic Recommendations
                               </h4>
                               <div className="grid grid-cols-1 gap-3">
                                  {(record.prediction.recommendations || []).map((rec:string, r:number) => (
                                     <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + (r * 0.05) }} key={r} className="text-sm font-medium text-gray-400 flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-colors leading-relaxed">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)] mt-2 shrink-0"></div>
                                        {rec}
                                     </motion.div>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
               ))}
             </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
