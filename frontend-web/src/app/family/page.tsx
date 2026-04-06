"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { Users, Plus, Trash2, ShieldCheck, Phone, Mail, UserPlus, Sparkles, ShieldAlert, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Contact {
  _id: string;
  name: string;
  relation: string;
  phoneNumber: string;
  email?: string;
  notifyOnHighRisk: boolean;
}

const RELATIONS = ["Parent", "Spouse", "Sibling", "Child", "Friend", "Other"];

export default function FamilyCirclePage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isRelationOpen, setIsRelationOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    relation: '',
    phoneNumber: '',
    email: '',
    notifyOnHighRisk: true
  });

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await api.get('/family');
        setContacts(res.data);
      } catch (err) {
        console.error("Error fetching family:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchContacts();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/family', formData);
      setContacts([...contacts, res.data]);
      setIsAdding(false);
      setFormData({ name: '', relation: '', phoneNumber: '', email: '', notifyOnHighRisk: true });
    } catch (err) {
      alert("Failed to add contact");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/family/${id}`);
      setContacts(contacts.filter(c => c._id !== id));
    } catch (err) {
      alert("Failed to delete contact");
    }
  };

  return (
    <main className="min-h-screen pt-10 md:pt-16 pb-24 px-6 max-w-5xl mx-auto relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-500/5 blur-[120px] -z-10 rounded-full"></div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-5"
        >
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-600 to-blue-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
            <div className="relative p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
              <Users className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
              Family <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">Safety Circle</span>
            </h1>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 mt-1.5 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-cyan-500" /> Emergency Notification Network
            </p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAdding(true)}
          className="relative group/btn"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-500 rounded-2xl blur-md opacity-50 group-hover/btn:opacity-100 transition duration-300"></div>
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 py-4 px-8 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-transform">
            <Plus className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-black uppercase tracking-widest text-white">Add Member</span>
          </div>
        </motion.button>
      </header>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <AnimatePresence>
          {contacts.map((contact, i) => (
            <motion.div
              key={contact._id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-6 rounded-[2rem] border border-white/10 relative overflow-hidden group hover:border-cyan-500/20 transition-all shadow-xl backdrop-blur-3xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-2xl -z-10 rounded-full"></div>

              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full"></div>
                    <div className="relative w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-2xl uppercase">
                      {contact.name[0]}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-white text-xl tracking-tight">{contact.name}</h3>
                    <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-500/20">
                      {contact.relation}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(contact._id)}
                  className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-gray-500 hover:text-red-400 transition-all border border-white/5 active:scale-90 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Phone className="w-4 h-4 text-cyan-500" />
                  {contact.phoneNumber}
                </div>
                {contact.email && (
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <Mail className="w-4 h-4 text-blue-400" />
                    {contact.email}
                  </div>
                )}
              </div>

              <div className={`flex items-center gap-2.5 pt-4 border-t border-white/5 ${contact.notifyOnHighRisk ? 'text-emerald-400' : 'text-gray-600'}`}>
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {contact.notifyOnHighRisk ? 'Auto-Notified on High Risk' : 'Silent Mode'}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {contacts.length === 0 && !loading && !isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full glass py-24 text-center space-y-8 bg-white/[0.02] border-white/5 rounded-[3rem] shadow-2xl backdrop-blur-3xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-cyan-500/5 blur-[100px] -z-10"></div>
            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-cyan-400/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-white/[0.03] rounded-[2rem] flex items-center justify-center border border-white/10 mx-auto">
                <UserPlus className="w-10 h-10 text-cyan-500/30" />
              </div>
              <Sparkles className="absolute top-0 right-[43%] w-6 h-6 text-cyan-400/40 animate-bounce" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white mb-4">Your Circle is Empty</h2>
              <p className="text-[10px] md:text-xs uppercase font-black tracking-[0.25em] text-gray-500 leading-relaxed max-w-sm mx-auto">
                Add family members to ensure they are alerted during health emergencies.
              </p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="text-cyan-400 text-xs font-black uppercase tracking-widest hover:text-cyan-300 transition-all active:scale-95 bg-white/5 px-8 py-3.5 rounded-full border border-white/10 hover:bg-white/10"
            >
              Add First Member &rarr;
            </button>
          </motion.div>
        )}
      </div>

      {/* How it works Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-r from-cyan-500/[0.06] to-blue-500/[0.04] border border-cyan-500/20 flex gap-5 items-start shadow-lg"
      >
        <div className="w-10 h-10 rounded-full bg-cyan-400/10 flex items-center justify-center shrink-0 border border-cyan-500/20 shadow-[inset_0_0_15px_rgba(34,211,238,0.08)]">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <p className="text-xs font-black uppercase text-cyan-400 tracking-[0.25em] mb-2">How It Works</p>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            When you perform a health check and the AI detects a{" "}
            <span className="text-red-400 font-black">High Risk</span>{" "}
            level, we will automatically send an alert to your enabled Family Circle members with your status and current location.
          </p>
        </div>
      </motion.div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setIsAdding(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass max-w-md w-full p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-3xl relative overflow-hidden"
            >
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-cyan-500/10 blur-3xl -z-10"></div>

              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black uppercase tracking-widest text-cyan-400 flex items-center gap-3">
                  <UserPlus className="w-5 h-5" />
                  New Member
                </h2>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-500 hover:text-white transition-all border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400/70 block mb-2">Full Name</label>
                  <input
                    required type="text" placeholder="e.g. Rajesh Kumar"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-gray-600"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400/70 block mb-2">Relation</label>
                  {/* Custom Rounded Glass Dropdown */}
                  <div
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm flex items-center justify-between cursor-pointer hover:border-cyan-500/30 transition-all"
                    onClick={() => setIsRelationOpen(!isRelationOpen)}
                  >
                    <span className={formData.relation ? 'text-white' : 'text-gray-600'}>
                      {formData.relation || 'Select Relation'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform duration-300 ${isRelationOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <AnimatePresence>
                    {isRelationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 right-0 top-[110%] bg-[#0d1117] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 p-2 z-50 overflow-hidden"
                      >
                        {RELATIONS.map(r => (
                          <div
                            key={r}
                            className={`px-4 py-3 text-sm rounded-2xl cursor-pointer transition-all ${
                              formData.relation === r
                                ? 'bg-cyan-500/20 text-cyan-400 font-bold'
                                : 'text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                            onClick={() => {
                              setFormData({ ...formData, relation: r });
                              setIsRelationOpen(false);
                            }}
                          >
                            {r}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400/70 block mb-2">Phone</label>
                    <input
                      required type="tel" placeholder="+91..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-gray-600"
                      value={formData.phoneNumber}
                      onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400/70 block mb-2">Email (Optional)</label>
                    <input
                      type="email" placeholder="email@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-gray-600"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group/check p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${formData.notifyOnHighRisk ? 'bg-cyan-500 border-cyan-500' : 'border-white/20 bg-transparent'}`}>
                    {formData.notifyOnHighRisk && <span className="text-white text-xs font-black">✓</span>}
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.notifyOnHighRisk} onChange={e => setFormData({ ...formData, notifyOnHighRisk: e.target.checked })} />
                  <span className="text-xs font-black uppercase tracking-widest text-gray-300">Notify on High Risk predictions</span>
                </label>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3.5 px-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 relative overflow-hidden rounded-2xl group/sbtn">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-500 group-hover/sbtn:brightness-110 transition-all duration-300"></div>
                    <div className="relative py-3.5 px-6 flex items-center justify-center active:scale-[0.98] transition-transform">
                      <span className="text-sm font-black uppercase tracking-widest text-white">Save Member</span>
                    </div>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
