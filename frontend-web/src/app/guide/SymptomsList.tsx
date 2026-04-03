"use client";

import { useState } from "react";
import { Search, ChevronRight, Activity } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type Symptom = {
  title: string;
  description: string;
  risk: string;
  keywords: string[];
};

export default function SymptomsList({ symptoms }: { symptoms: Symptom[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "High Risk", "Medium Risk", "Low to Medium Risk"];

  const filtered = symptoms.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === "All" || item.risk === activeCategory.replace(" Risk", "");
    
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
         <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
               <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                     activeCategory === cat ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
               >
                  {cat}
               </button>
            ))}
         </div>

         <div className="flex gap-2 items-center bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 text-white w-full md:w-64 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search library..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-500"
            />
         </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass text-center py-16 rounded-3xl opacity-50 flex flex-col items-center">
            <Activity className="w-12 h-12 mb-4 text-cyan-400" />
            <h3 className="text-xl font-bold">No symptoms found</h3>
            <p className="text-sm">Try using different keywords or selecting "All" categories.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={idx} 
              className="glass p-6 md:p-8 rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${item.risk === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : item.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                  {item.risk} Risk Indicator
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">{item.description}</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-2">
                  {item.keywords.map((kw, kidx) => (
                    <span key={kidx} className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-500 border border-white/5">#{kw}</span>
                  ))}
                </div>
                <Link href={`/predict?symptom=${encodeURIComponent(item.title)}`} className="btn-secondary py-1.5 px-4 text-xs group-hover:bg-cyan-500/20 group-hover:text-cyan-400 group-hover:border-cyan-500/50 transition-all flex items-center gap-2 whitespace-nowrap">
                  Analyze This Now <ChevronRight className="w-3 h-3"/>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
