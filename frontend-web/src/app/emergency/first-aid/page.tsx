"use client";

import { AlertCircle, ArrowLeft, ChevronDown, HeartPulse, Info, ShieldAlert, Siren, Sparkles, Wind } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FIRST_AID_DATA = [
  {
    id: "cpr",
    title: "CPR (Adult)",
    icon: <HeartPulse className="w-7 h-7" />,
    description: "Cardiopulmonary Resuscitation for adults who are unresponsive and not breathing.",
    steps: [
      "Check the scene for safety. Tap person and shout to see if they respond.",
      "Call emergency services immediately.",
      "Place the heel of one hand in the center of their chest, and the other hand on top.",
      "Push hard and fast: 100-120 compressions per minute, at least 2 inches deep.",
      "Allow the chest to recoil completely between compressions.",
      "Continue until help arrives or an AED is available."
    ],
    accent: "from-red-500/20 to-transparent",
    border: "border-red-500/20 hover:border-red-500/40",
    iconBg: "bg-red-500/10 border-red-500/20 text-red-400",
    stepBg: "bg-red-500/20 border-red-500/30 text-red-400",
    tag: "text-red-400"
  },
  {
    id: "choking",
    title: "Choking (Heimlich)",
    icon: <Wind className="w-7 h-7" />,
    description: "For someone who is unable to cough, speak, or breathe due to an obstruction.",
    steps: [
      "Stand behind the person and wrap your arms around their waist.",
      "Make a fist with one hand and place the thumb side just above the navel.",
      "Grasp your fist with the other hand.",
      "Perform quick, upward, and inward thrusts.",
      "Continue until the object is forced out or the person becomes unconscious.",
      "If they become unconscious, immediately start CPR."
    ],
    accent: "from-cyan-500/20 to-transparent",
    border: "border-cyan-500/20 hover:border-cyan-500/40",
    iconBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    stepBg: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
    tag: "text-cyan-400"
  },
  {
    id: "bleeding",
    title: "Severe Bleeding",
    icon: <AlertCircle className="w-7 h-7" />,
    description: "Controlling major blood loss from wounds or injuries.",
    steps: [
      "Put on gloves if available to protect yourself.",
      "Apply direct pressure to the wound with a clean cloth or sterile bandage.",
      "Do not remove the cloth if it becomes soaked; add more layers on top.",
      "If bleeding doesn't stop with direct pressure, consider a tourniquet (for limbs).",
      "Keep the person calm and warm to prevent shock.",
      "Wait for emergency medical services."
    ],
    accent: "from-orange-500/20 to-transparent",
    border: "border-orange-500/20 hover:border-orange-500/40",
    iconBg: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    stepBg: "bg-orange-500/20 border-orange-500/30 text-orange-400",
    tag: "text-orange-400"
  },
  {
    id: "burns",
    title: "Severe Burns",
    icon: <ShieldAlert className="w-7 h-7" />,
    description: "Immediate treatment for heat, chemical, or electrical burns.",
    steps: [
      "Stop the burning process: move away from the heat source.",
      "Run cool (not cold) water over the burn for at least 10-20 minutes.",
      "Remove restrictive items like rings or clothing if not stuck to the burn.",
      "Cover the area loosely with a sterile, non-stick bandage or plastic wrap.",
      "Do not apply ice, butter, or ointments to a severe burn.",
      "Seek medical attention for deep or large burns."
    ],
    accent: "from-amber-500/20 to-transparent",
    border: "border-amber-500/20 hover:border-amber-500/40",
    iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    stepBg: "bg-amber-500/20 border-amber-500/30 text-amber-400",
    tag: "text-amber-400"
  }
];

export default function FirstAidGuide() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <main className="min-h-screen pt-8 pb-24 px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-500/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-orange-500/5 blur-[120px] -z-10 rounded-full"></div>

      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-10 font-black uppercase tracking-widest text-xs group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Header */}
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-5"
          >
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
              <div className="relative p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                <Siren className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
                First Aid <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">Quick Guide</span>
              </h1>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 mt-1.5 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-red-400" /> Essential Lifesaving Emergency Instructions
              </p>
            </div>
          </motion.div>
        </header>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {FIRST_AID_DATA.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelected(item.id === selected ? null : item.id)}
              className={`glass text-left transition-all duration-300 rounded-[2rem] border p-6 relative overflow-hidden shadow-xl backdrop-blur-3xl group ${item.border} ${selected === item.id ? 'ring-1 ring-white/20' : ''}`}
            >
              {/* Accent glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${item.accent} blur-2xl -z-10 rounded-full`}></div>

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl border ${item.iconBg} shrink-0 transition-transform duration-500 group-hover:scale-110`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-black tracking-tight text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.description}</p>
                </div>
                <ChevronDown className={`w-5 h-5 ${item.tag} shrink-0 transition-transform duration-300 ${selected === item.id ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {selected === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-5">
                        Step-by-Step Instructions
                      </h4>
                      <ul className="space-y-4">
                        {item.steps.map((step, idx) => (
                          <li key={idx} className="flex gap-4 text-sm items-start">
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full border ${item.stepBg} flex items-center justify-center font-black text-xs`}>
                              {idx + 1}
                            </span>
                            <p className="text-gray-300 leading-relaxed font-medium pt-0.5">{step}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Disclaimer Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-7 rounded-[2.5rem] border border-cyan-500/20 relative overflow-hidden shadow-2xl backdrop-blur-3xl"
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/5 blur-3xl -z-10 rounded-full"></div>
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Info className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-black uppercase tracking-widest text-cyan-400 mb-3">Important Disclaimer</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                This guide is for informational purposes only and is not a substitute for professional medical training or advice. 
                Always call emergency services immediately (e.g., 911, 112, 108) when faced with a medical crisis.
              </p>
              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/emergency/nearby')}
                  className="relative group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl blur-sm opacity-60 group-hover/btn:opacity-100 transition duration-300"></div>
                  <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 py-3 px-6 rounded-xl flex items-center gap-2 active:scale-[0.98] transition-transform">
                    <Siren className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">Find Nearest Hospital</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
