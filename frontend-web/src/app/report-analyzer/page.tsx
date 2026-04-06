"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  FileText, Upload, AlertCircle, FileSearch, 
  CheckCircle, Smartphone, Eye, Download, 
  Sparkles, ShieldCheck, Microscope 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import ReactMarkdown from 'react-markdown';

export default function ReportAnalyzerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("token");
    if (!authLoading && !user && !hasToken) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysis(null);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!preview) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'}/analyze-report`, {
        image_data: preview
      });

      setAnalysis(response.data.analysis);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError("Failed to analyze report. Please ensure the image is clear and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) return <div className="flex items-center justify-center min-h-screen text-cyan-500 animate-pulse font-black uppercase tracking-widest text-sm italic">Initializing Scanner...</div>;

  return (
    <main className="min-h-screen pt-4 md:pt-10 pb-24 px-4 md:px-8 max-w-6xl mx-auto overflow-hidden">
      <header className="mb-10 relative">
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-2"
        >
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
            <div className="relative p-3.5 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
              <Microscope className="w-8 h-8 text-purple-400 group-hover:rotate-12 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
              Smart Report <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Analyzer</span>
            </h1>
            <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-gray-500 mt-1">Deep Visual Health Intelligence</p>
          </div>
        </motion.div>
        
        {/* Background glow decoration */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-500/10 blur-[150px] -z-10 rounded-full"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Column (5 Cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5 space-y-6"
        >
          <div className="glass p-6 md:p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-3xl -z-10"></div>
            
            <h2 className="text-lg font-black uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-3">
               <Upload className="w-5 h-5 text-purple-400" />
               Upload Laboratory Report
            </h2>

            <motion.div 
              whileHover={{ scale: 0.99 }}
              whileTap={{ scale: 0.97 }}
              className={`group relative border-2 border-dashed rounded-[2rem] p-4 transition-all duration-500 text-center cursor-pointer overflow-hidden ${
                preview 
                  ? 'border-purple-500/50 bg-purple-500/10 shadow-[0_0_40px_rgba(168,85,247,0.1)]' 
                  : 'border-white/10 hover:border-purple-500/40 bg-white/[0.04] hover:bg-purple-500/5'
              }`}
              onClick={() => document.getElementById('report-upload')?.click()}
            >
              {preview ? (
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-2xl">
                   <img src={preview} alt="Report Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-center justify-end pb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest bg-purple-600 px-6 py-2.5 rounded-full border border-white/20 shadow-lg active:scale-95 transition-transform">Change Document</span>
                   </div>
                   {/* Scanning Glow Line if loading */}
                    {isLoading && (
                      <motion.div 
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="absolute left-0 w-full h-0.5 bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,1)] z-10"
                      ></motion.div>
                    )}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:border-purple-500/40 transition-colors duration-500">
                       <Upload className="w-10 h-10 text-gray-400 group-hover:text-purple-400 transition-colors" />
                    </div>
                  </div>
                  <div>
                     <p className="text-xl font-black tracking-tight text-white group-hover:text-purple-300 transition-colors">Select Medical Report</p>
                     <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500 mt-2">PDF • JPG • PNG (Max 5MB)</p>
                  </div>
                </div>
              )}
              <input 
                id="report-upload"
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </motion.div>

            <button
              onClick={handleUpload}
              disabled={!preview || isLoading}
              className="w-full relative mt-8 overflow-hidden rounded-2xl group/btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 group-hover/btn:rotate-180 transition-transform duration-700"></div>
              <div className="relative m-[1px] bg-black/40 backdrop-blur-xl rounded-2xl py-4 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform">
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    </motion.div>
                    <span className="text-sm font-black uppercase tracking-widest text-white">AI Analyzing...</span>
                  </>
                ) : (
                  <>
                    <FileSearch className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-black uppercase tracking-widest text-white">Start Deep Analysis</span>
                  </>
                )}
              </div>
            </button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-medium flex gap-3 shadow-inner"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Results Column (7 Cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-7"
        >
          <div className="glass p-6 md:p-10 rounded-[3rem] border border-white/10 relative min-h-[600px] flex flex-col shadow-2xl backdrop-blur-3xl group">
             <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 blur-[120px] -z-10 rounded-full"></div>
             
             <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                <h2 className="text-lg font-black uppercase tracking-widest text-cyan-400 flex items-center gap-3">
                   <Eye className="w-5 h-5" />
                   AI Insights Engine
                </h2>
                {analysis && (
                  <button className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95">
                    <Download className="w-4 h-4" />
                  </button>
                )}
             </div>

            <div className="flex-1 overflow-hidden">
               <AnimatePresence mode="wait">
                  {!analysis && !isLoading ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center px-10"
                    >
                       <div className="relative mb-8">
                          <div className="absolute inset-0 bg-cyan-400/10 blur-[40px] rounded-full scale-150 animate-pulse"></div>
                          <div className="relative w-24 h-24 bg-white/[0.03] rounded-[2rem] flex items-center justify-center border border-white/10 group-hover:rotate-6 transition-transform duration-700">
                             <FileText className="w-10 h-10 text-gray-700 group-hover:text-cyan-500/40 transition-colors" />
                          </div>
                          <Sparkles className="absolute top-1 -right-1 w-6 h-6 text-yellow-500/50 animate-bounce" />
                       </div>
                       <h3 className="text-2xl font-black tracking-tight text-white mb-3">Awaiting Documents</h3>
                       <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500 leading-relaxed max-w-xs">
                          Upload your laboratory certificate or medical report on the left panel to begin forensic AI analysis.
                       </p>
                    </motion.div>
                  ) : isLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-10 py-4"
                    >
                       <div className="space-y-4">
                          <div className="h-2 w-1/4 bg-gradient-to-r from-cyan-400/40 to-transparent rounded-full animate-pulse"></div>
                          <div className="h-8 w-3/4 bg-white/5 rounded-2xl animate-pulse"></div>
                       </div>
                       <div className="space-y-3">
                          <div className="h-4 w-full bg-white/5 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                          <div className="h-4 w-full bg-white/5 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                          <div className="h-4 w-2/3 bg-white/5 rounded-full animate-pulse [animation-delay:0.6s]"></div>
                       </div>
                       <div className="flex flex-col items-center justify-center py-10">
                          <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full animate-spin"></div>
                            <div className="absolute inset-2 bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 rounded-full flex items-center justify-center">
                              <Microscope className="w-6 h-6 text-cyan-400" />
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 animate-pulse">Deciphering Medical Data...</span>
                       </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="prose prose-invert prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white prose-p:text-gray-300 prose-strong:text-cyan-400 prose-ul:text-gray-400 max-w-none leading-relaxed overflow-y-auto max-h-[60vh] pr-6 custom-scrollbar"
                    >
                       <div className="bg-gradient-to-r from-cyan-500/10 to-transparent p-6 rounded-3xl mb-8 border border-cyan-500/20 flex gap-4 items-center">
                          <ShieldCheck className="w-8 h-8 text-cyan-400" />
                          <div>
                            <h4 className="text-sm font-black uppercase text-white m-0">Verified AI Analysis</h4>
                            <p className="text-[10px] font-medium text-cyan-400/60 m-0 uppercase tracking-widest mt-0.5">Scanned by SmartHealth Core 2.0</p>
                          </div>
                       </div>
                       <ReactMarkdown>{analysis!}</ReactMarkdown>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Disclaimer */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-12 p-6 rounded-[2rem] bg-gradient-to-r from-red-500/[0.03] to-purple-500/[0.03] border border-white/5 backdrop-blur-md shadow-lg flex gap-5 items-center max-w-4xl mx-auto"
      >
        <div className="w-12 h-12 rounded-full bg-red-400/10 flex items-center justify-center shrink-0 border border-red-500/10 shadow-[inset_0_0_15px_rgba(248,113,113,0.1)]">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-red-400 tracking-[0.25em] mb-1.5 flex items-center gap-2">
            Med-Intelligence Integrity Notice
          </p>
          <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
            AI findings are generated via neural-symbolic pattern recognition and are for informational purposes **ONLY**. Accuracy depends on document clarity. Cross-verify results with a licensed healthcare provider before taking any clinical action.
          </p>
        </div>
      </motion.div>
    </main>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
