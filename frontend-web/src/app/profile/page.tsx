"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { 
  User, 
  Scale, 
  Ruler, 
  Cigarette, 
  Wine, 
  Activity, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Camera,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  HeartPulse,
  ChevronDown,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const { user, updateUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setError("Please select an image file.");
        return;
    }

    setAvatarUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const base64Avatar = canvas.toDataURL('image/jpeg', 0.8);
        
        setPendingAvatar(base64Avatar);
        setAvatarUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    weight: "",
    height: "",
    lifestyle: {
      smoking: false,
      alcohol: false,
      activityLevel: "moderate",
    },
    emergencyInfo: {
      bloodGroup: "",
      allergies: [] as string[],
      chronicConditions: [] as string[],
      medications: [] as string[],
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
      }
    }
  });

  const [emergencyFields, setEmergencyFields] = useState({
    allergy: "",
    chronic: "",
    med: ""
  });

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("token");
    if (!authLoading && !user && !hasToken) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setFetching(false);
        return;
      }
      
      setFetching(true);
      try {
        const { data } = await api.get("/health/profile");
        if (data) {
          setFormData({
            age: data.age?.toString() || "",
            gender: data.gender || "male",
            weight: data.weight?.toString() || "",
            height: data.height?.toString() || "",
            lifestyle: {
              smoking: data.lifestyle?.smoking || false,
              alcohol: data.lifestyle?.alcohol || false,
              activityLevel: data.lifestyle?.activityLevel || "moderate",
            },
            emergencyInfo: {
              bloodGroup: data.emergencyInfo?.bloodGroup || "",
              allergies: data.emergencyInfo?.allergies || [],
              chronicConditions: data.emergencyInfo?.chronicConditions || [],
              medications: data.emergencyInfo?.medications || [],
              emergencyContact: {
                name: data.emergencyInfo?.emergencyContact?.name || "",
                relationship: data.emergencyInfo?.emergencyContact?.relationship || "",
                phone: data.emergencyInfo?.emergencyContact?.phone || "",
              }
            }
          });
        }
      } catch (err) {
        console.log("No profile found or error fetching");
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (pendingAvatar) {
          await api.put('/auth/avatar', { avatar: pendingAvatar });
          if (user) {
            updateUser({ ...user, avatar: pendingAvatar });
          }
          setPendingAvatar(null);
      }

      await api.post("/health/profile", {
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-cyan-500 animate-pulse font-black uppercase tracking-widest text-[11px] italic">
        Syncing Biometric Data...
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-10 md:pt-16 pb-40 px-6 relative">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-500/5 blur-[120px] -z-10 rounded-full"></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-500/5 blur-[120px] -z-10 rounded-full"></div>

      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-8 font-black uppercase tracking-widest text-[10px] group w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
              Health <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">Profile</span>
            </h1>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 mt-3 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-cyan-500/50" /> Biological Matrix & Parameters
            </p>
          </motion.div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12 relative">
          <AnimatePresence>
            {fetching && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xl rounded-[3rem] flex items-center justify-center border border-white/5">
                 <div className="flex flex-col items-center gap-6">
                    <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
                    <p className="text-[10px] uppercase font-black tracking-widest text-cyan-500 animate-pulse">Syncing Diagnostic Patterns...</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {success && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 text-emerald-400 text-xs font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/10">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Biometric parameters successfully committed to vault.</span>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 text-xs font-black uppercase tracking-widest shadow-2xl shadow-red-500/10">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>Sync Failure: {error}</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            <div className="xl:col-span-2 space-y-10">
              {/* Physical Metrics Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 sm:p-10 lg:p-14 rounded-[3rem] border border-white/10 relative group">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-600/5 blur-[100px] pointer-events-none transition-all group-hover:bg-cyan-600/10"></div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10 mb-12">
                   <h2 className="text-2xl font-black italic text-white flex items-center gap-4 tracking-tight">
                     <div className="p-3 bg-white/5 rounded-2xl border border-white/10"><User className="w-6 h-6 text-cyan-400" /></div> Basic Information
                   </h2>
                   
                   {user && (
                    <div className="relative group/avatar shrink-0 self-center sm:self-auto">
                      <input type="file" accept="image/*" id="avatar-upload" className="hidden" onChange={handleAvatarChange} disabled={avatarUploading} />
                      <label htmlFor="avatar-upload" className="block w-28 h-28 rounded-full border-2 border-dashed border-cyan-500/20 overflow-hidden cursor-pointer relative bg-black/40 group-hover/avatar:border-cyan-400 transition-all duration-500 p-1">
                         <div className="w-full h-full rounded-full overflow-hidden relative shadow-2xl">
                           {(pendingAvatar || user.avatar) ? (
                               // eslint-disable-next-line @next/next/no-img-element
                               <img src={pendingAvatar || user.avatar} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center bg-white/5">
                                   <User className="w-10 h-10 text-cyan-500/30" />
                               </div>
                           )}
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                               {avatarUploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Camera className="w-8 h-8 text-white" />}
                           </div>
                         </div>
                         <div className="absolute -inset-2 rounded-full border border-cyan-500/0 group-hover/avatar:border-cyan-500/50 group-hover/avatar:animate-pulse transition-all"></div>
                      </label>
                    </div>
                   )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] pl-1">Biological Age</label>
                    <div className="group/field relative">
                      <div className="absolute -inset-1 bg-cyan-500/10 blur-lg opacity-0 group-focus-within/field:opacity-100 transition-opacity"></div>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="relative w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:border-cyan-500/50 outline-none transition-all text-white font-black italic tracking-tight"
                        placeholder="e.g. 25"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] pl-1">Gender Identification</label>
                    <CustomSelect
                      value={formData.gender}
                      onChange={(val) => setFormData({ ...formData, gender: val })}
                      options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" }
                      ]}
                      placeholder="Select Gender"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] pl-1 flex items-center gap-2">
                       <Scale className="w-3 h-3 text-cyan-400/50" /> Biological Mass (kg)
                    </label>
                    <div className="group/field relative">
                      <div className="absolute -inset-1 bg-cyan-500/10 blur-lg opacity-0 group-focus-within/field:opacity-100 transition-opacity"></div>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="relative w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:border-cyan-500/50 outline-none transition-all text-white font-black italic tracking-tight"
                        placeholder="70.5"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] pl-1 flex items-center gap-2">
                       <Ruler className="w-3 h-3 text-cyan-400/50" /> Vertical Stature (cm)
                    </label>
                    <div className="group/field relative">
                      <div className="absolute -inset-1 bg-cyan-500/10 blur-lg opacity-0 group-focus-within/field:opacity-100 transition-opacity"></div>
                      <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        className="relative w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:border-cyan-500/50 outline-none transition-all text-white font-black italic tracking-tight"
                        placeholder="175"
                        required
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Lifestyle Habits Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 sm:p-10 lg:p-14 rounded-[3rem] border border-white/10 relative group">
                <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/5 blur-[100px] pointer-events-none"></div>
                <h2 className="text-2xl font-black italic text-white flex items-center gap-4 tracking-tight mb-12">
                   <div className="p-3 bg-white/5 rounded-2xl border border-white/10"><Activity className="w-6 h-6 text-purple-400" /></div> Lifestyle Matrix
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                     <label className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 md:p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] cursor-pointer hover:bg-white/[0.06] transition-all group/item gap-4">
                       <div className="flex items-center gap-4 min-w-0">
                         <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover/item:border-purple-500/30 transition-all shrink-0"><Cigarette className="w-5 h-5 text-gray-500 group-hover/item:text-purple-400" /></div>
                         <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-300 truncate pr-2">Tobacco Usage</span>
                       </div>
                       <div className="relative">
                         <input type="checkbox" checked={formData.lifestyle.smoking} onChange={(e) => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, smoking: e.target.checked } })} className="sr-only" />
                         <div className={`w-12 h-6 flex items-center rounded-full px-1 transition-colors ${formData.lifestyle.smoking ? 'bg-purple-600' : 'bg-white/10 border border-white/10'}`}>
                           <div className={`w-4 h-4 rounded-full bg-white shadow-xl transition-transform ${formData.lifestyle.smoking ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </div>
                       </div>
                    </label>

                     <label className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 md:p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] cursor-pointer hover:bg-white/[0.06] transition-all group/item gap-4">
                       <div className="flex items-center gap-4 min-w-0">
                         <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover/item:border-cyan-500/30 transition-all shrink-0"><Wine className="w-5 h-5 text-gray-500 group-hover/item:text-cyan-400" /></div>
                         <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-300 truncate pr-2">Alcohol Consumption</span>
                       </div>
                       <div className="relative">
                         <input type="checkbox" checked={formData.lifestyle.alcohol} onChange={(e) => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, alcohol: e.target.checked } })} className="sr-only" />
                         <div className={`w-12 h-6 flex items-center rounded-full px-1 transition-colors ${formData.lifestyle.alcohol ? 'bg-cyan-600' : 'bg-white/10 border border-white/10'}`}>
                           <div className={`w-4 h-4 rounded-full bg-white shadow-xl transition-transform ${formData.lifestyle.alcohol ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </div>
                       </div>
                    </label>
                  </div>

                  <div className="space-y-4 pt-4">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] pl-1">Metabolic Activity Level</label>
                    <div className="grid grid-cols-3 gap-4">
                      {["low", "moderate", "high"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            lifestyle: { ...formData.lifestyle, activityLevel: level }
                          })}
                          className={`py-4 px-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-300 ${
                            formData.lifestyle.activityLevel === level
                              ? "bg-cyan-600/20 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                              : "bg-white/[0.03] border-white/10 text-gray-500 hover:border-white/20 hover:bg-white/[0.06]"
                          }`}
                        >
                          {level === 'moderate' ? 'Nominal' : level === 'high' ? 'Intense' : 'Sedentary'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="space-y-10">
              {/* Emergency Information Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-10 rounded-[3rem] border border-white/10 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl -z-10"></div>
                <h2 className="text-xl font-black italic text-white flex items-center gap-4 tracking-tight mb-10">
                   <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10"><AlertCircle className="w-5 h-5 text-red-400" /></div> Emergency Vault
                </h2>

                <div className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.3em] pl-1">Blood Serology</label>
                      <CustomSelect
                        value={formData.emergencyInfo.bloodGroup}
                        onChange={(val) => setFormData({ ...formData, emergencyInfo: { ...formData.emergencyInfo, bloodGroup: val } })}
                        options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => ({ value: bg, label: bg }))}
                        placeholder="Select Group"
                        accentColor="red"
                      />
                   </div>

                   <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.3em] pl-1 flex items-center gap-2"><ArrowUpRight className="w-3 h-3" /> Designated Contact</label>
                      <div className="space-y-4">
                          <input type="text" placeholder="Contact Identity" value={formData.emergencyInfo.emergencyContact.name} onChange={(e) => setFormData({ ...formData, emergencyInfo: { ...formData.emergencyInfo, emergencyContact: { ...formData.emergencyInfo.emergencyContact, name: e.target.value } } })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:border-red-500/20 outline-none transition-all text-[11px] font-bold text-gray-300 placeholder:text-gray-600" />
                          <input type="tel" placeholder="Cellular Endpoint" value={formData.emergencyInfo.emergencyContact.phone} onChange={(e) => setFormData({ ...formData, emergencyInfo: { ...formData.emergencyInfo, emergencyContact: { ...formData.emergencyInfo.emergencyContact, phone: e.target.value } } })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:border-red-500/20 outline-none transition-all text-[11px] font-bold text-gray-300 placeholder:text-gray-600" />
                      </div>
                   </div>

                   <div className="space-y-4">
                       <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.3em] pl-1">Allergenic Sensitivities</label>
                       <div className="flex flex-wrap gap-2">
                           {formData.emergencyInfo.allergies.map(a => (
                               <span key={a} className="px-3 py-1.5 bg-red-600/10 text-red-300 border border-red-600/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                                   {a}
                                   <button type="button" onClick={() => setFormData({ ...formData, emergencyInfo: { ...formData.emergencyInfo, allergies: formData.emergencyInfo.allergies.filter(x => x !== a) } })} className="hover:text-white transition-colors">&times;</button>
                               </span>
                           ))}
                       </div>
                       <div className="flex gap-2">
                            <input type="text" placeholder="Add Sensitivity..." value={emergencyFields.allergy} onChange={(e) => setEmergencyFields({...emergencyFields, allergy: e.target.value})} className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl py-3 px-5 focus:border-red-500/20 outline-none transition-all text-[11px] font-bold text-gray-400" />
                            <button type="button" onClick={() => { if (!emergencyFields.allergy) return; setFormData({ ...formData, emergencyInfo: { ...formData.emergencyInfo, allergies: [...formData.emergencyInfo.allergies, emergencyFields.allergy] } }); setEmergencyFields({...emergencyFields, allergy: ""}); }} className="bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-300 rounded-2xl px-5 text-[9px] font-black uppercase tracking-widest transition-all">Add</button>
                       </div>
                   </div>
                </div>
              </motion.div>

              <BMIGauge height={formData.height} weight={formData.weight} />
            </div>
          </div>

          <div className="flex justify-end pt-10">
             <motion.button
               whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(6,182,212,0.2)" }}
               whileTap={{ scale: 0.98 }}
               type="submit"
               disabled={loading}
               className="relative overflow-hidden group bg-gradient-to-r from-cyan-600 to-blue-600 px-14 py-5 rounded-[2rem] text-white font-black uppercase tracking-[0.4em] text-[11px] flex items-center gap-4 transition-all"
             >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span className="relative z-10">{loading ? "Committing Updates..." : "Save Biological Profile"}</span>
             </motion.button>
          </div>
        </form>
      </div>
    </main>
  );
}

function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  icon: Icon,
  accentColor = "cyan"
}: { 
  value: string, 
  onChange: (val: string) => void, 
  options: { value: string, label: string }[],
  placeholder: string,
  icon?: any,
  accentColor?: "cyan" | "red"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const dropdownId = `dropdown-${placeholder.replace(/\s+/g, '-')}`;

  const toggleDropdown = (e: React.MouseEvent) => {
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 180);
    }
    setIsOpen(!isOpen);
  };

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`relative ${isOpen ? 'z-[100]' : 'z-auto'}`} id={dropdownId}>
      <div className="absolute -inset-1 bg-white/5 blur-lg opacity-0 group-focus-within/field:opacity-100 transition-opacity"></div>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`relative w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2 px-6 outline-none transition-all text-white font-black italic tracking-tight flex items-center justify-between text-left ${isOpen ? (accentColor === 'red' ? 'border-red-500/50' : 'border-cyan-500/50') : 'hover:border-white/20'}`}
      >
        <span className={!selectedOption ? "text-gray-500" : "text-white text-xs"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: openUpwards ? 10 : -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: openUpwards ? 10 : -10, scale: 0.95 }}
              className={`absolute left-0 right-0 z-[70] bg-[#0b0c10] border border-white/10 rounded-xl overflow-hidden shadow-2xl p-1.5 max-h-36 overflow-y-auto custom-scrollbar ${openUpwards ? "bottom-full mb-3" : "top-full mt-2"}`}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all mb-0.5 last:mb-0 ${
                    value === option.value 
                      ? (accentColor === 'red' ? 'bg-red-600/20 text-red-400' : 'bg-cyan-600/20 text-cyan-400') 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function BMIGauge({ height, weight }: { height: string, weight: string }) {
  const h = parseFloat(height) / 100;
  const w = parseFloat(weight);
  
  let bmi = 0;
  if (h > 0 && w > 0) bmi = w / (h * h);
  
  const isCalculated = bmi > 0;
  
  let status = "Unknown";
  let colorClass = "text-gray-500";
  let bgClass = "bg-gray-500/20";
  let barColor = "bg-gray-500";
  let percentage = 0;

  if (isCalculated) {
    if (bmi < 18.5) {
      status = "Underweight";
      colorClass = "text-amber-400";
      bgClass = "bg-amber-500/10";
      barColor = "bg-amber-500";
      percentage = Math.min((bmi / 18.5) * 25, 25);
    } else if (bmi < 25) {
      status = "Normal Range";
      colorClass = "text-emerald-400";
      bgClass = "bg-emerald-500/10";
      barColor = "bg-emerald-500";
      percentage = 25 + Math.min(((bmi - 18.5) / 6.5) * 25, 25);
    } else if (bmi < 30) {
      status = "Overweight";
      colorClass = "text-orange-400";
      bgClass = "bg-orange-500/10";
      barColor = "bg-orange-500";
      percentage = 50 + Math.min(((bmi - 25) / 5) * 25, 25);
    } else {
      status = "Critical / Obese";
      colorClass = "text-red-400";
      bgClass = "bg-red-500/10";
      barColor = "bg-red-500";
      percentage = 75 + Math.min(((bmi - 30) / 10) * 25, 25);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass p-10 rounded-[3rem] border border-white/10 relative backdrop-blur-3xl xl:sticky xl:top-32">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -z-10"></div>
      <h2 className="text-xl font-black italic text-white flex items-center gap-4 tracking-tight mb-10">
         <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10"><TrendingUp className="w-5 h-5 text-cyan-400" /></div> BMI Analytics
      </h2>
      
      <div className="flex flex-col items-center justify-center py-10 border-b border-white/5 mb-8 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Calculated Index</span>
        {isCalculated ? (
          <div className="flex flex-col items-center gap-4">
            <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-7xl font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
               {bmi.toFixed(1)}
            </motion.span>
            <div className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic border ${colorClass} ${bgClass} border-current/20`}>
              {status}
            </div>
          </div>
        ) : (
          <span className="text-5xl font-black text-white/5 italic">--.-</span>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-[9px] text-gray-600 font-black uppercase tracking-widest pl-1 pr-1">
          <span>16</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>40+</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex relative border border-white/5 p-[1px]">
           <div className="h-full w-1/4 bg-amber-500/20"></div>
           <div className="h-full w-1/4 bg-emerald-500/20"></div>
           <div className="h-full w-1/4 bg-orange-500/20"></div>
           <div className="h-full w-1/4 bg-red-500/20"></div>
           
           {isCalculated && (
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${percentage}%` }}
               transition={{ duration: 1.5, ease: "easeOut" }}
               className="absolute top-0 bottom-0 left-0 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] border-r-2 border-cyan-400 z-10"
             >
                <div className={`absolute inset-0 ${barColor} opacity-40 shadow-inner`}></div>
             </motion.div>
           )}
        </div>
        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mt-3 opacity-40 italic px-1">
          <span className="text-amber-500 w-1/4 text-center">Low</span>
          <span className="text-emerald-500 w-1/4 text-center">Normal</span>
          <span className="text-orange-500 w-1/4 text-center">High</span>
          <span className="text-red-500 w-1/4 text-center">Severe</span>
        </div>
      </div>

      <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 group cursor-help transition-all hover:bg-white/[0.08]">
         <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:text-cyan-400 transition-colors"><HeartPulse className="w-4 h-4" /></div>
         <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 leading-relaxed">BMI is an estimation tool. For professional clinical assessment, consult your primary care specialist.</p>
      </div>
    </motion.div>
  );
}
