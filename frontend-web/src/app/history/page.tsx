"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { 
  History, 
  Calendar, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  Filter,
  Search,
  Activity,
  ArrowUpDown,
  ArrowLeft,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-8 md:pt-12 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 font-medium text-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <History className="text-cyan-400" /> Analysis History
            </h1>
            <p className="text-gray-400 mt-2">Track your past AI risk assessments and health trends over time.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 text-sm text-gray-400">
               <Search className="w-4 h-4" />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search name or symptom..." 
                 className="bg-transparent border-none outline-none text-white w-32 md:w-48 placeholder-gray-600 transition-all focus:w-48 md:focus:w-64" 
               />
            </div>
            <button className="glass p-2 rounded-xl hover:text-cyan-400 transition-colors">
               <Filter className="w-5 h-5" />
            </button>
          </div>
        </header>

        {history.length === 0 ? (
          <div className="glass-card text-center py-20 opacity-50 flex flex-col items-center">
            <Activity className="w-16 h-16 mb-4 text-cyan-400" />
            <h3 className="text-xl font-bold">No Records Found</h3>
            <p className="text-sm">You haven&apos;t performed any health analysis yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="grid grid-cols-12 px-6 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 gap-2">
                <div className="col-span-3 md:col-span-2 flex items-center gap-2 cursor-pointer hover:text-white transition-all">
                   Date
                </div>
                <div className="col-span-3 hidden md:block">Patient Name</div>
                <div className="col-span-4 md:col-span-3">Symptoms</div>
                <div className="col-span-2 text-center md:text-left">Risk</div>
                <div className="col-span-3 md:col-span-2 text-center">Probability</div>
             </div>

             {history.filter(record => {
               const query = searchQuery.toLowerCase();
               const matchName = user?.name?.toLowerCase().includes(query);
               const matchSymptom = (record.symptoms || []).some((s:any) => s.name.toLowerCase().includes(query));
               const matchDate = new Date(record.date).toLocaleDateString().includes(query);
               return matchName || matchSymptom || matchDate;
             }).map((record, i) => (
                <motion.div
                  key={record._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card flex flex-col group cursor-pointer hover:border-cyan-500/30 transition-all border border-white/5 shadow-none relative overflow-hidden p-0"
                  onClick={() => setExpandedId(expandedId === record._id ? null : record._id)}
                >
                  <div className="grid grid-cols-12 items-center px-4 md:px-6 py-4 md:py-5 gap-2 relative">
                    <div className="col-span-3 md:col-span-2 flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-400 hidden md:block" />
                        <span className="font-bold text-[10px] md:text-sm text-gray-300">{new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}</span>
                      </div>
                      <span className="md:hidden text-[9px] uppercase tracking-widest text-cyan-500/70 font-bold truncate">{user?.name}</span>
                    </div>
                    
                    <div className="col-span-3 hidden md:flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-bold text-gray-300 truncate w-full">{user?.name || "Patient"}</span>
                    </div>

                    <div className="col-span-4 md:col-span-3 flex shrink-0 min-w-0 pr-2">
                      <div className="flex flex-wrap gap-1 md:gap-2 truncate">
                         {(record.symptoms || []).slice(0, 2).map((s: any, j: number) => (
                           <span key={j} className="text-[8px] md:text-[10px] uppercase font-bold tracking-widest px-1.5 md:px-2 py-0.5 md:py-1 bg-white/5 rounded-full text-gray-400 group-hover:text-cyan-400 transition-colors whitespace-nowrap">
                             {s.name}
                           </span>
                         ))}
                         {(record.symptoms?.length || 0) > 2 && (
                           <span className="text-[8px] md:text-[10px] font-bold text-gray-500 self-center">+{record.symptoms.length - 2}</span>
                         )}
                      </div>
                    </div>

                    <div className="col-span-2 flex justify-center md:justify-start w-full">
                      <div className={`px-2 md:px-4 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                        record.prediction.riskLevel === 'Low' ? 'bg-green-500/20 text-green-400' :
                        record.prediction.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {record.prediction.riskLevel}
                      </div>
                    </div>

                    <div className="col-span-3 md:col-span-2 flex items-center justify-center font-black text-sm md:text-lg text-white/50 group-hover:text-white transition-all pl-2">
                      {Math.round(record.prediction.probability)}%
                    </div>

                    <button className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 transition-all text-gray-500 group-hover:text-cyan-400 bg-white/5 hover:bg-black/50 p-2 rounded-full z-10">
                      <ChevronRight className={`w-5 h-5 transition-transform ${expandedId === record._id ? 'rotate-90 text-cyan-400' : ''}`} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {expandedId === record._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 md:px-6 pb-6 overflow-hidden border-t border-white/5 bg-black/20"
                      >
                         <div className="pt-4">
                           <h4 className="text-cyan-400 font-bold mb-4 flex items-center gap-2"><Activity className="w-4 h-4"/> Full Assessment Report</h4>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">All Symptoms Logged</p>
                                 <div className="flex flex-wrap gap-2">
                                    {(record.symptoms || []).map((s:any, k:number) => (
                                       <span key={k} className="px-2 py-1 bg-white/5 rounded-full text-[10px] md:text-xs font-medium border border-white/10 text-gray-300">
                                          {s.name} <span className="text-gray-500 ml-1">({s.severity})</span>
                                       </span>
                                    ))}
                                 </div>
                                 
                                 {record.prediction.suggestedSpecialist && (
                                    <div className="mt-6">
                                       <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Recommended Specialist</p>
                                       <p className="text-sm font-medium text-white p-3 rounded-xl bg-white/5 border border-white/10 inline-block">{record.prediction.suggestedSpecialist}</p>
                                    </div>
                                 )}
                              </div>
                              
                              <div>
                                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Advice & Recommendations</p>
                                 <ul className="space-y-2">
                                    {(record.prediction.recommendations || []).map((rec:string, r:number) => (
                                       <li key={r} className="text-sm text-gray-300 flex items-start gap-2 bg-white/5 p-2 rounded-lg">
                                          <span className="text-cyan-400 mt-1 flex-shrink-0">•</span> 
                                          <span>{rec}</span>
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
             ))}
          </div>
        )}
      </div>
    </main>
  );
}
