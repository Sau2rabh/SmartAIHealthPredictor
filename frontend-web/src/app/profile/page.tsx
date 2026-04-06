"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { User, Scale, Ruler, Cigarette, Wine, Activity, Save, Loader2, CheckCircle, AlertCircle, ArrowLeft, Camera } from "lucide-react";

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
    
    // Client-side compression
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-8 md:pt-12 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 font-medium text-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Health Profile</h1>
            <p className="text-gray-400 mt-2">Update your physical metrics and lifestyle habits for accurate AI analysis.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative">
          {fetching && (
            <div className="absolute inset-0 z-50 bg-gray-950/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
               <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                  <p className="text-cyan-500 font-medium animate-pulse">Loading profile...</p>
               </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400 text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Physical Metrics */}
              <div className="glass-card space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-cyan-400" /> Basic Information
                  </h2>
                  
                  {user && (
                    <div className="relative group shrink-0">
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="avatar-upload"
                        className="hidden" 
                        onChange={handleAvatarChange}
                        disabled={avatarUploading}
                      />
                      <label 
                        htmlFor="avatar-upload" 
                        className="block w-20 h-20 rounded-full border-2 border-cyan-500/30 overflow-hidden cursor-pointer relative bg-black/40 group-hover:border-cyan-400 transition-colors"
                      >
                         {(pendingAvatar || user.avatar) ? (
                             // eslint-disable-next-line @next/next/no-img-element
                             <img src={pendingAvatar || user.avatar} alt="Profile" className="w-full h-full object-cover" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                 <User className="w-8 h-8 text-cyan-500/50" />
                             </div>
                         )}
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             {avatarUploading ? (
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                             ) : (
                                <Camera className="w-6 h-6 text-white" />
                             )}
                         </div>
                      </label>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-cyan-500/50 outline-none transition-all"
                    placeholder="e.g. 25"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-cyan-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="male" className="bg-gray-900">Male</option>
                    <option value="female" className="bg-gray-900">Female</option>
                    <option value="other" className="bg-gray-900">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Scale className="w-4 h-4" /> Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-cyan-500/50 outline-none transition-all"
                      placeholder="70.5"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Ruler className="w-4 h-4" /> Height (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-cyan-500/50 outline-none transition-all"
                      placeholder="175"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Lifestyle Habits */}
              <div className="glass-card space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-cyan-400" /> Lifestyle Habits
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <Cigarette className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">Do you smoke?</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.lifestyle.smoking}
                      onChange={(e) => setFormData({
                        ...formData,
                        lifestyle: { ...formData.lifestyle, smoking: e.target.checked }
                      })}
                      className="w-5 h-5 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <Wine className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">Consume alcohol?</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.lifestyle.alcohol}
                      onChange={(e) => setFormData({
                        ...formData,
                        lifestyle: { ...formData.lifestyle, alcohol: e.target.checked }
                      })}
                      className="w-5 h-5 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500"
                    />
                  </label>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Activity Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["low", "moderate", "high"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            lifestyle: { ...formData.lifestyle, activityLevel: level }
                          })}
                          className={`py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                            formData.lifestyle.activityLevel === level
                              ? "bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                              : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="glass-card space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
                   <AlertCircle className="w-5 h-5 text-red-400" /> Emergency Information
                </h2>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Blood Group</label>
                      <select
                        value={formData.emergencyInfo.bloodGroup}
                        onChange={(e) => setFormData({ 
                            ...formData, 
                            emergencyInfo: { ...formData.emergencyInfo, bloodGroup: e.target.value } 
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-red-500/50 outline-none transition-all appearance-none"
                      >
                        <option value="" className="bg-gray-900">Select Blood Group</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                            <option key={bg} value={bg} className="bg-gray-900">{bg}</option>
                        ))}
                      </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Emergency Contact</label>
                      <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            placeholder="Contact Name"
                            value={formData.emergencyInfo.emergencyContact.name}
                            onChange={(e) => setFormData({ 
                                ...formData, 
                                emergencyInfo: { 
                                    ...formData.emergencyInfo, 
                                    emergencyContact: { ...formData.emergencyInfo.emergencyContact, name: e.target.value } 
                                } 
                            })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-red-500/50 outline-none transition-all"
                          />
                          <input
                            type="text"
                            placeholder="Relationship (e.g. Spouse, Parent)"
                            value={formData.emergencyInfo.emergencyContact.relationship}
                            onChange={(e) => setFormData({ 
                                ...formData, 
                                emergencyInfo: { 
                                    ...formData.emergencyInfo, 
                                    emergencyContact: { ...formData.emergencyInfo.emergencyContact, relationship: e.target.value } 
                                } 
                            })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-red-500/50 outline-none transition-all"
                          />
                          <input
                            type="tel"
                            placeholder="Phone Number (e.g. +91...)"
                            value={formData.emergencyInfo.emergencyContact.phone}
                            onChange={(e) => setFormData({ 
                                ...formData, 
                                emergencyInfo: { 
                                    ...formData.emergencyInfo, 
                                    emergencyContact: { ...formData.emergencyInfo.emergencyContact, phone: e.target.value } 
                                } 
                            })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-red-500/50 outline-none transition-all"
                          />
                      </div>
                   </div>

                   <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-400">Allergies</label>
                       <div className="flex flex-wrap gap-2 mb-2">
                           {formData.emergencyInfo.allergies.map(a => (
                               <span key={a} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-bold flex items-center gap-2">
                                   {a}
                                   <button type="button" onClick={() => setFormData({
                                       ...formData,
                                       emergencyInfo: {
                                           ...formData.emergencyInfo,
                                           allergies: formData.emergencyInfo.allergies.filter(x => x !== a)
                                       }
                                   })}>&times;</button>
                               </span>
                           ))}
                       </div>
                       <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add allergy"
                                value={emergencyFields.allergy}
                                onChange={(e) => setEmergencyFields({...emergencyFields, allergy: e.target.value})}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:border-red-500/50 outline-none transition-all text-sm"
                            />
                            <button 
                                type="button"
                                onClick={() => {
                                    if (!emergencyFields.allergy) return;
                                    setFormData({
                                        ...formData,
                                        emergencyInfo: {
                                            ...formData.emergencyInfo,
                                            allergies: [...formData.emergencyInfo.allergies, emergencyFields.allergy]
                                        }
                                    });
                                    setEmergencyFields({...emergencyFields, allergy: ""});
                                }}
                                className="bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-xl px-4 text-xs font-bold"
                            >
                                Add
                            </button>
                       </div>
                   </div>

                   <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-400">Chronic Conditions</label>
                       <div className="flex flex-wrap gap-2 mb-2">
                           {formData.emergencyInfo.chronicConditions.map(c => (
                               <span key={c} className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-bold flex items-center gap-2">
                                   {c}
                                   <button type="button" onClick={() => setFormData({
                                       ...formData,
                                       emergencyInfo: {
                                           ...formData.emergencyInfo,
                                           chronicConditions: formData.emergencyInfo.chronicConditions.filter(x => x !== c)
                                       }
                                   })}>&times;</button>
                               </span>
                           ))}
                       </div>
                       <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g. Diabetes, Asthma"
                                value={emergencyFields.chronic}
                                onChange={(e) => setEmergencyFields({...emergencyFields, chronic: e.target.value})}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:border-red-500/50 outline-none transition-all text-sm"
                            />
                            <button 
                                type="button"
                                onClick={() => {
                                    if (!emergencyFields.chronic) return;
                                    setFormData({
                                        ...formData,
                                        emergencyInfo: {
                                            ...formData.emergencyInfo,
                                            chronicConditions: [...formData.emergencyInfo.chronicConditions, emergencyFields.chronic]
                                        }
                                    });
                                    setEmergencyFields({...emergencyFields, chronic: ""});
                                }}
                                className="bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-xl px-4 text-xs font-bold"
                            >
                                Add
                            </button>
                       </div>
                   </div>

                   <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-400">Current Medications</label>
                       <div className="flex flex-wrap gap-2 mb-2">
                           {formData.emergencyInfo.medications.map(m => (
                               <span key={m} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-bold flex items-center gap-2">
                                   {m}
                                   <button type="button" onClick={() => setFormData({
                                       ...formData,
                                       emergencyInfo: {
                                           ...formData.emergencyInfo,
                                           medications: formData.emergencyInfo.medications.filter(x => x !== m)
                                       }
                                   })}>&times;</button>
                               </span>
                           ))}
                       </div>
                       <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g. Insulin, Aspirin"
                                value={emergencyFields.med}
                                onChange={(e) => setEmergencyFields({...emergencyFields, med: e.target.value})}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:border-red-500/50 outline-none transition-all text-sm"
                            />
                            <button 
                                type="button"
                                onClick={() => {
                                    if (!emergencyFields.med) return;
                                    setFormData({
                                        ...formData,
                                        emergencyInfo: {
                                            ...formData.emergencyInfo,
                                            medications: [...formData.emergencyInfo.medications, emergencyFields.med]
                                        }
                                    });
                                    setEmergencyFields({...emergencyFields, med: ""});
                                }}
                                className="bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-xl px-4 text-xs font-bold"
                            >
                                Add
                            </button>
                       </div>
                   </div>
                </div>
              </div>

              <BMIGauge height={formData.height} weight={formData.weight} />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 px-10"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
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
      colorClass = "text-yellow-400";
      bgClass = "bg-yellow-500/20";
      barColor = "bg-yellow-500";
      percentage = Math.min((bmi / 18.5) * 25, 25);
    } else if (bmi < 25) {
      status = "Normal";
      colorClass = "text-green-400";
      bgClass = "bg-green-500/20";
      barColor = "bg-green-500";
      percentage = 25 + Math.min(((bmi - 18.5) / 6.5) * 25, 25);
    } else if (bmi < 30) {
      status = "Overweight";
      colorClass = "text-orange-400";
      bgClass = "bg-orange-500/20";
      barColor = "bg-orange-500";
      percentage = 50 + Math.min(((bmi - 25) / 5) * 25, 25);
    } else {
      status = "Obese";
      colorClass = "text-red-400";
      bgClass = "bg-red-500/20";
      barColor = "bg-red-500";
      percentage = 75 + Math.min(((bmi - 30) / 10) * 25, 25);
    }
  }

  return (
    <div className="glass-card sticky top-32">
      <h3 className="font-bold mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-cyan-400" /> BMI Calculator
      </h3>
      
      <div className="flex flex-col items-center justify-center py-6 border-b border-white/5 mb-6">
        <span className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-2">Your BMI</span>
        {isCalculated ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl font-black">{bmi.toFixed(1)}</span>
            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colorClass} ${bgClass} border border-current`}>
              {status}
            </span>
          </div>
        ) : (
          <span className="text-3xl font-black text-gray-600">--.-</span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>16.0</span>
          <span>18.5</span>
          <span>25.0</span>
          <span>30.0</span>
          <span>40.0+</span>
        </div>
        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex relative">
           <div className="h-full w-1/4 bg-yellow-500/30"></div>
           <div className="h-full w-1/4 bg-green-500/30"></div>
           <div className="h-full w-1/4 bg-orange-500/30"></div>
           <div className="h-full w-1/4 bg-red-500/30"></div>
           
           {isCalculated && (
             <div 
               className="absolute top-0 bottom-0 left-0 bg-white/90 border-r-2 border-black transition-all duration-500 ease-out"
               style={{ width: `${percentage}%` }}
             >
                <div className={`absolute right-0 top-0 bottom-0 w-full h-full ${barColor} opacity-50`}></div>
             </div>
           )}
        </div>
        <div className="flex justify-between text-[10px] uppercase font-bold mt-2">
          <span className="text-yellow-500/70 w-1/4 text-center">Under</span>
          <span className="text-green-500/70 w-1/4 text-center">Normal</span>
          <span className="text-orange-500/70 w-1/4 text-center">Over</span>
          <span className="text-red-500/70 w-1/4 text-center">Obese</span>
        </div>
      </div>
    </div>
  );
}
