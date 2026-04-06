"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Sparkles, Utensils, Dumbbell, Moon, Heart, Info, RefreshCw, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface WellnessPlan {
  diet: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
  exercise: {
    routine: string;
    duration: string;
    intensity: string;
  };
  vitals_goals: {
    steps: string;
    water: string;
    sleep: string;
  };
  tips: string[];
}

export default function WellnessPlanPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<WellnessPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const historyRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/health/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const latestPredict = historyRes.data[0];
      const aiInput = latestPredict ? {
        age: 30,
        gender: 1,
        bmi: 24.5,
        activity_level: 1,
        ...latestPredict.vitals,
        fever: 0, cough: 0, fatigue: 0
      } : {
        age: 25, gender: 1, bmi: 22.0, activity_level: 1,
        fever: 0, cough: 0, fatigue: 0, shortness_breath: 0, chest_pain: 0
      };
      const aiRes = await axios.post(`${process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'}/wellness-plan`, aiInput);
      setPlan(aiRes.data);
    } catch (err: any) {
      console.error("Wellness Plan Error:", err);
      setError("Unable to generate plan. Please complete a health analysis first.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("token");
    if (!authLoading && !user && !hasToken) {
      router.push("/login");
    } else if (user) {
      fetchPlan();
    }
  }, [user, authLoading, router]);

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-screen text-cyan-500 animate-pulse font-black uppercase tracking-widest text-sm italic">
      Generating Wellness Protocol...
    </div>
  );

  return (
    <main className="min-h-screen pt-10 md:pt-16 pb-24 px-6 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-purple-500/5 blur-[120px] -z-10 rounded-full"></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-500/5 blur-[120px] -z-10 rounded-full"></div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-5"
        >
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-600 to-purple-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
            <div className="relative p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
              <Sparkles className="w-8 h-8 text-cyan-400 group-hover:rotate-12 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
              Wellness <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">Dashboard</span>
            </h1>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 mt-1.5 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-purple-400" /> AI-Driven Lifestyle Intelligence
            </p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchPlan}
          disabled={isLoading}
          className="relative group/btn disabled:opacity-60"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-500 rounded-2xl blur-md opacity-50 group-hover/btn:opacity-100 transition duration-300"></div>
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 py-4 px-8 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-transform">
            <RefreshCw className={`w-5 h-5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-black uppercase tracking-widest text-white">
              {isLoading ? 'Generating...' : 'Regenerate Plan'}
            </span>
          </div>
        </motion.button>
      </header>

      {/* Content */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass py-24 text-center space-y-8 bg-white/[0.02] border-white/5 rounded-[3rem] shadow-2xl backdrop-blur-3xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-500/5 blur-[100px] -z-10"></div>
            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-red-400/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-white/[0.03] rounded-[2rem] flex items-center justify-center border border-white/10 mx-auto">
                <AlertCircle className="w-10 h-10 text-red-500/50" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-white mb-4">{error}</h3>
              <p className="text-[10px] md:text-xs uppercase font-black tracking-[0.25em] text-gray-500 leading-relaxed max-w-sm mx-auto">
                Go to the Analyze section to get your first risk prediction.
              </p>
            </div>
            <button
              onClick={() => router.push('/predict')}
              className="relative group/btn inline-flex"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-500 rounded-2xl blur-md opacity-50 group-hover/btn:opacity-100 transition duration-300"></div>
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 py-3.5 px-8 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-transform">
                <span className="text-sm font-black uppercase tracking-widest text-white">Start Analysis &rarr;</span>
              </div>
            </button>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8"
          >
            {[8, 8, 4, 4].map((cols, i) => (
              <div key={i} className={`lg:col-span-${cols} glass h-64 animate-pulse bg-white/5 border-white/10 rounded-[2.5rem]`}></div>
            ))}
          </motion.div>
        ) : plan && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: Diet & Exercise */}
            <div className="lg:col-span-8 space-y-8">

              {/* Diet Section */}
              <div className="glass p-8 md:p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-3xl">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/5 blur-[100px] -z-10 rounded-full"></div>
                <h2 className="text-xl font-black uppercase tracking-widest text-cyan-400 mb-8 flex items-center gap-3 border-b border-white/5 pb-6">
                  <Utensils className="w-6 h-6" />
                  Nutrition Strategy
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <DietItem title="Breakfast" content={plan.diet.breakfast} color="cyan" />
                  <DietItem title="Lunch" content={plan.diet.lunch} color="emerald" />
                  <DietItem title="Dinner" content={plan.diet.dinner} color="purple" />
                  <DietItem title="Snacks & Hydration" content={plan.diet.snacks} color="amber" />
                </div>
              </div>

              {/* Exercise Section */}
              <div className="glass p-8 md:p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-3xl">
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-rose-500/5 blur-[80px] -z-10 rounded-full"></div>
                <h2 className="text-xl font-black uppercase tracking-widest text-rose-400 mb-8 flex items-center gap-3 border-b border-white/5 pb-6">
                  <Heart className="w-6 h-6" />
                  Activity Routine
                </h2>
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-rose-400 mb-3 tracking-widest">Target Routine</p>
                      <p className="text-lg font-black text-white leading-snug">{plan.exercise.routine}</p>
                    </div>
                    <div className="w-px bg-white/5 hidden md:block"></div>
                    <div className="flex gap-10">
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Duration</p>
                        <p className="text-2xl font-black text-white">{plan.exercise.duration}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Intensity</p>
                        <p className="text-2xl font-black text-white">{plan.exercise.intensity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Goals & Tips */}
            <div className="lg:col-span-4 space-y-8">

              {/* Daily Goals */}
              <div className="glass p-6 md:p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-3xl">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/5 blur-3xl -z-10 rounded-full"></div>
                <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-6 border-b border-white/5 pb-4">
                  Today&apos;s Goals
                </h3>
                <div className="space-y-4">
                  <GoalRow icon={<RefreshCw className="w-5 h-5 text-cyan-400" />} label="Daily Steps" value={plan.vitals_goals.steps} color="cyan" />
                  <GoalRow icon={<Moon className="w-5 h-5 text-indigo-400" />} label="Sleep Target" value={plan.vitals_goals.sleep} color="indigo" />
                  <GoalRow icon={<Dumbbell className="w-5 h-5 text-blue-400" />} label="Water Intake" value={plan.vitals_goals.water} color="blue" />
                </div>
              </div>

              {/* AI Tips */}
              <div className="glass p-6 md:p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-3xl">
                <h3 className="text-lg font-black uppercase tracking-widest text-emerald-400 mb-6 border-b border-white/5 pb-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5" />
                  Medical Insights
                </h3>
                <div className="space-y-3">
                  {plan.tips.map((tip, i) => (
                    <div key={i} className="flex gap-3 items-start p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 transition-all group">
                      <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why it works */}
              <div className="p-6 rounded-[2rem] bg-gradient-to-r from-cyan-500/[0.05] to-purple-500/[0.05] border border-cyan-500/20 flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-cyan-400/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                  <Info className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.2em] mb-2">Why This Works</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                    This plan is generated using multi-modal AI that correlates your current symptoms, activity levels, and risk history to suggest the safest route to recovery.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

const colorMap: Record<string, string> = {
  cyan: "from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400",
  emerald: "from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400",
  purple: "from-purple-500/10 to-transparent border-purple-500/20 text-purple-400",
  amber: "from-amber-500/10 to-transparent border-amber-500/20 text-amber-400",
};

function DietItem({ title, content, color }: { title: string; content: string; color: string }) {
  const c = colorMap[color] || colorMap.cyan;
  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${c} border hover:border-opacity-50 transition-all group`}>
      <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${c.split(' ').at(-1)}`}>{title}</h4>
      <p className="text-sm font-bold text-gray-200 leading-snug group-hover:text-white transition-colors">{content}</p>
    </div>
  );
}

function GoalRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const bg: Record<string, string> = {
    cyan: "from-cyan-500/10", indigo: "from-indigo-500/10", blue: "from-blue-500/10"
  };
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r ${bg[color] || ''} to-transparent border border-white/5 hover:border-white/10 transition-all`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-xl border border-white/5">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
      </div>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}
