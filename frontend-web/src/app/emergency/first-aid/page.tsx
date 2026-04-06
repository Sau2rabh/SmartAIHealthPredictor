"use client";

import { AlertCircle, ArrowLeft, Heart, HeartPulse, Info, ShieldAlert, Siren, Stethoscope, Wind } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const FIRST_AID_DATA = [
  {
    id: "cpr",
    title: "CPR (Adult)",
    icon: <HeartPulse className="w-8 h-8 text-red-500" />,
    description: "Cardiopulmonary Resuscitation for adults who are unresponsive and not breathing.",
    steps: [
      "Check the scene for safety. Tap person and shout to see if they respond.",
      "Call emergency services immediately.",
      "Place the heel of one hand in the center of their chest, and the other hand on top.",
      "Push hard and fast: 100-120 compressions per minute, at least 2 inches deep.",
      "Allow the chest to recoil completely between compressions.",
      "Continue until help arrives or an AED is available."
    ],
    color: "bg-red-500/10 border-red-500/20"
  },
  {
    id: "choking",
    title: "Choking (Heimlich)",
    icon: <Wind className="w-8 h-8 text-cyan-500" />,
    description: "For someone who is unable to cough, speak, or breathe due to an obstruction.",
    steps: [
      "Stand behind the person and wrap your arms around their waist.",
      "Make a fist with one hand and place the thumb side just above the navel.",
      "Grasp your fist with the other hand.",
      "Perform quick, upward, and inward thrusts.",
      "Continue until the object is forced out or the person becomes unconscious.",
      "If they become unconscious, immediately start CPR."
    ],
    color: "bg-cyan-500/10 border-cyan-500/20"
  },
  {
    id: "bleeding",
    title: "Severe Bleeding",
    icon: <AlertCircle className="w-8 h-8 text-orange-500" />,
    description: "Controlling major blood loss from wounds or injuries.",
    steps: [
      "Put on gloves if available to protect yourself.",
      "Apply direct pressure to the wound with a clean cloth or sterile bandage.",
      "Do not remove the cloth if it becomes soaked; add more layers on top.",
      "If bleeding doesn't stop with direct pressure, consider a tourniquet (for limbs).",
      "Keep the person calm and warm to prevent shock.",
      "Wait for emergency medical services."
    ],
    color: "bg-orange-500/10 border-orange-500/20"
  },
  {
    id: "burns",
    title: "Severe Burns",
    icon: <ShieldAlert className="w-8 h-8 text-yellow-500" />,
    description: "Immediate treatment for heat, chemical, or electrical burns.",
    steps: [
      "Stop the burning process: move away from the heat source.",
      "Run cool (not cold) water over the burn for at least 10-20 minutes.",
      "Remove restrictive items like rings or clothing if not stuck to the burn.",
      "Cover the area loosely with a sterile, non-stick bandage or plastic wrap.",
      "Do not apply ice, butter, or ointments to a severe burn.",
      "Seek medical attention for deep or large burns."
    ],
    color: "bg-yellow-500/10 border-yellow-500/20"
  }
];

export default function FirstAidGuide() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <main className="min-h-screen pt-8 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 font-medium text-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mb-10">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Siren className="text-red-500 w-8 h-8" /> 
              First Aid Quick Guide
            </h1>
            <p className="text-gray-400 mt-2">Essential lifesaving instructions for common medical emergencies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {FIRST_AID_DATA.map((item) => (
                <button 
                    key={item.id}
                    onClick={() => setSelected(item.id === selected ? null : item.id)}
                    className={`glass-card text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${item.color} ${selected === item.id ? 'ring-2 ring-white/20' : ''}`}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            {item.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>
                        </div>
                    </div>

                    {selected === item.id && (
                        <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Step-by-Step Instructions</h4>
                            <ul className="space-y-4">
                                {item.steps.map((step, idx) => (
                                    <li key={idx} className="flex gap-4 text-sm">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                                            {idx + 1}
                                        </span>
                                        <p className="text-gray-300 pt-0.5">{step}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </button>
            ))}
        </div>

        <div className="glass-card bg-cyan-500/5 border-cyan-500/20 p-8">
            <div className="flex items-start gap-4">
                <div className="bg-cyan-500/20 p-3 rounded-2xl">
                    <Info className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white mb-2">Important Disclaimer</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        This guide is for informational purposes only and is not a substitute for professional medical training or advice. Always call emergency services immediately (e.g., 911, 112, 108) when faced with a medical crisis.
                    </p>
                    <div className="flex gap-4 mt-6">
                        <button 
                          onClick={() => router.push('/emergency/nearby')}
                          className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/20"
                        >
                            Find Nearest Hospital
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}
