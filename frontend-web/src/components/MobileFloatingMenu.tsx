"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Siren, Sparkles, X } from "lucide-react";

interface MobileFloatingMenuProps {
  onEmergency: () => void;
  onAnalyze: () => void;
}

export default function MobileFloatingMenu({ onEmergency, onAnalyze }: MobileFloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      label: "Emergency",
      icon: <Siren className="w-5 h-5 text-white" />,
      color: "bg-red-600 shadow-red-600/40",
      action: () => {
        onEmergency();
        setIsOpen(false);
      },
    },
    {
      label: "Analyze",
      icon: <Sparkles className="w-5 h-5 text-white" />,
      color: "bg-cyan-500 shadow-cyan-500/40",
      action: () => {
        onAnalyze();
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="md:hidden fixed bottom-4 right-4 z-[90] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center gap-3 group"
              >
                <span className="bg-[#0d1221]/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.label}
                </span>
                <button
                  onClick={item.action}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95 ${item.color}`}
                >
                  {item.icon}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleMenu}
        animate={{ 
          rotate: isOpen ? 135 : 0,
          boxShadow: isOpen 
            ? "0 0 20px rgba(6, 182, 212, 0.4)" 
            : "0 0 40px rgba(6, 182, 212, 0.2)"
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-12 h-12 rounded-[2rem] flex items-center justify-center transition-all duration-300 z-[100] ${
          isOpen 
            ? "bg-[#0d1221] border border-cyan-500/50 text-cyan-400" 
            : "bg-cyan-500 text-white shadow-xl shadow-cyan-500/20"
        }`}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
      
      {/* Backdrop for Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[-1]"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
