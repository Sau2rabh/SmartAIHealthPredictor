"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Pill, Plus, Trash2, CheckCircle, Clock, Calendar, AlertCircle, RefreshCw, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  status: 'active' | 'completed' | 'paused';
  notes?: string;
}

export default function MedicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [meds, setMeds] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    frequency: "Daily",
    time: "",
    notes: ""
  });

  const frequencies = ["Daily", "Twice a day", "Thrice a day", "Weekly", "As needed"];

  const fetchMeds = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/medications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeds(response.data);
    } catch (err) {
      console.error("Fetch Meds Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("token");
    if (!authLoading && !user && !hasToken) {
      router.push("/login");
    } else if (user) {
      fetchMeds();
    }
  }, [user, authLoading, router]);

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/medications`, newMed, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAdding(false);
      setNewMed({ name: "", dosage: "", frequency: "Daily", time: "", notes: "" });
      fetchMeds();
    } catch (err) {
      console.error("Add Med Error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/medications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMeds();
    } catch (err) {
      console.error("Delete Med Error:", err);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const nextStatus = currentStatus === 'active' ? 'completed' : 'active';
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/medications/${id}`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMeds();
    } catch (err) {
      console.error("Update Med Error:", err);
    }
  };

  if (authLoading) return <div className="flex items-center justify-center min-h-screen text-cyan-500 animate-pulse font-black uppercase tracking-widest text-sm italic">Initializing Portal...</div>;

  return (
    <main className="min-h-screen pt-10 md:pt-16 pb-24 px-6 max-w-6xl mx-auto relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-500/5 blur-[120px] -z-10 rounded-full"></div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="flex items-center gap-5"
        >
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-600 to-cyan-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
            <div className="relative p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
              <Pill className="w-8 h-8 text-emerald-400 group-hover:rotate-12 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
              Medication <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Tracker</span>
            </h1>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 mt-1.5 flex items-center gap-2">
               <Sparkles className="w-3 h-3 text-cyan-500" /> Professional Dosage Intelligence
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
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-500 rounded-2xl blur-md opacity-50 group-hover/btn:opacity-100 transition duration-300"></div>
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 py-4 px-8 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-transform">
             <Plus className={`w-5 h-5 text-emerald-400 transition-transform duration-500 ${isAdding ? 'rotate-45' : ''}`} />
             <span className="text-sm font-black uppercase tracking-widest text-white">{isAdding ? 'Close Entry' : 'Add Medication'}</span>
          </div>
        </motion.button>
      </header>

      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.div 
            key="add-form"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass p-8 md:p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden group mb-12 shadow-2xl backdrop-blur-3xl z-40"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-3xl -z-10"></div>
            <h2 className="text-lg font-black uppercase tracking-widest text-emerald-400 mb-8 flex items-center gap-3">
               <Plus className="w-5 h-5" />
               New Prescription Entry
            </h2>
             <form onSubmit={handleAddMed} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">Medication Name</label>
                    <input 
                      type="text" 
                      required
                      value={newMed.name}
                      onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                      placeholder="e.g. Paracetamol"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">Dosage</label>
                    <input 
                      type="text" 
                      required
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                      placeholder="e.g. 500mg"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">Frequency</label>
                    
                    {/* Custom Rounded Glass Dropdown */}
                    <div 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm flex items-center justify-between cursor-pointer hover:border-emerald-500/30 transition-all group/dropdown"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className="text-white">{newMed.frequency}</span>
                      <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute left-0 right-0 top-[110%] bg-[#0d1117] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 p-2 z-50 overflow-hidden"
                        >
                          {frequencies.map((freq) => (
                            <div 
                              key={freq}
                              className={`px-4 py-3 text-sm rounded-2xl cursor-pointer transition-all ${
                                newMed.frequency === freq 
                                  ? 'bg-emerald-500/20 text-emerald-400 font-bold' 
                                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
                              }`}
                              onClick={() => {
                                setNewMed({...newMed, frequency: freq});
                                setIsDropdownOpen(false);
                              }}
                            >
                              {freq}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">Scheduled Time</label>
                    <input 
                      type="text" 
                      value={newMed.time}
                      onChange={(e) => setNewMed({...newMed, time: e.target.value})}
                      placeholder="e.g. 08:00 AM, 08:00 PM"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">Notes (Optional)</label>
                  <textarea 
                    value={newMed.notes}
                    onChange={(e) => setNewMed({...newMed, notes: e.target.value})}
                    placeholder="e.g. Take after food"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 min-h-[80px]"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                   <button type="submit" className="relative mt-8 overflow-hidden rounded-2xl group/btn py-4 px-10">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-500 group-hover/btn:rotate-180 transition-transform duration-700"></div>
                      <div className="relative m-[1px] bg-black/40 backdrop-blur-xl rounded-2xl py-3 px-8 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform">
                        <span className="text-sm font-black uppercase tracking-widest text-white">Save Prescription</span>
                      </div>
                   </button>
                </div>
             </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass h-48 animate-pulse bg-white/5 border-white/10 rounded-[2rem]"></div>
            ))}
          </motion.div>
        ) : meds.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass py-24 text-center space-y-8 bg-white/[0.02] border-white/5 rounded-[3rem] shadow-2xl backdrop-blur-3xl relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] -z-10"></div>
             <div className="relative mb-8">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-400/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-white/[0.03] rounded-[2rem] flex items-center justify-center border border-white/10 mx-auto group-hover:rotate-6 transition-transform duration-700">
                   <Pill className="w-10 h-10 text-emerald-500/30 group-hover:text-emerald-400 transition-colors" />
                </div>
                <Sparkles className="absolute top-0 right-[42%] w-6 h-6 text-emerald-400/40 animate-bounce" />
             </div>
             <div>
               <h3 className="text-3xl font-black tracking-tight text-white mb-4">No Active Prescriptions</h3>
               <p className="text-[10px] md:text-xs uppercase font-black tracking-[0.25em] text-gray-500 leading-relaxed max-w-sm mx-auto">
                  Add your first medicine to start receiving dosage reminders and maintain consistent health integrity.
               </p>
             </div>
             <button 
               onClick={() => setIsAdding(true)} 
               className="text-emerald-400 text-xs font-black uppercase tracking-widest hover:text-emerald-300 transition-all active:scale-95 bg-white/5 px-8 py-3.5 rounded-full border border-white/10 hover:bg-white/10"
             >
               Initialize First Medication &rarr;
             </button>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {meds.map((med) => (
              <motion.div 
                key={med._id} 
                layout
                className={`glass p-6 rounded-[2rem] group transition-all border-l-4 overflow-hidden relative ${
                  med.status === 'completed' ? 'border-l-gray-500 opacity-60' : 'border-l-emerald-500 shadow-xl'
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl -z-10"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/10">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                     <button 
                       onClick={() => toggleStatus(med._id, med.status)}
                       className="p-2.5 bg-white/5 hover:bg-emerald-500/20 rounded-xl text-gray-400 hover:text-emerald-400 transition-all border border-white/5 active:scale-90"
                       title="Mark as completed"
                     >
                       <CheckCircle className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => handleDelete(med._id)}
                       className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-gray-400 hover:text-red-400 transition-all border border-white/5 active:scale-90"
                       title="Delete"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                </div>
                
                <h3 className={`text-xl font-black tracking-tight ${med.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>{med.name}</h3>
                <p className="text-cyan-400 font-bold text-xs uppercase tracking-widest mt-1 mb-6">{med.dosage}</p>
                
                <div className="space-y-3 mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                     <RefreshCw className="w-4 h-4 text-emerald-400" />
                     <span>{med.frequency}</span>
                  </div>
                  {med.time && (
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>{med.time}</span>
                    </div>
                  )}
                  {med.notes && (
                    <div className="flex items-start gap-3 text-[10px] font-bold text-gray-500 mt-4 p-3 bg-black/40 rounded-xl border border-white/5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-emerald-500/40" />
                      <span className="leading-relaxed">{med.notes}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
