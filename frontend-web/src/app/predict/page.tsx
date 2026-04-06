"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { 
  Stethoscope, 
  Loader2, 
  AlertCircle,
  Activity,
  CheckCircle2,
  Send,
  User as UserIcon,
  Bot,
  Download,
  FileText,
  ArrowLeft,
  Pill,
  HeartPulse,
  Mic,
  MicOff,
  Siren,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Wind
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const AVAILABLE_SYMPTOMS = ["Fever", "Cough", "Shortness of Breath", "Fatigue", "Headache", "Nausea", "Chest Pain", "Taste/Smell Loss"];

type Message = {
  id: string;
  role: "ai" | "user";
  text?: string;
  type?: "text" | "loading" | "result" | "error";
  resultData?: any;
};

export default function PredictPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [profileExists, setProfileExists] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  // Chatbot State
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "ai", type: "text", text: "Hello! I am HealthAI. What symptoms are you experiencing today? Please select from the options below." }
  ]);
  
  const [step, setStep] = useState<"symptoms" | "severity" | "vitals" | "duration" | "finished">("symptoms");
  
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [severity, setSeverity] = useState<string>("mild");
  const [duration, setDuration] = useState<number>(1);
  const [vitals, setVitals] = useState({ spO2: 98, heartRate: 75, bpSystolic: 120 });
  const [isListening, setIsListening] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [familyContacts, setFamilyContacts] = useState<any[]>([]);

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const { data } = await api.get("/family");
        setFamilyContacts(data);
      } catch (err) {
        console.error("Error fetching family:", err);
      }
    };
    if (user) fetchFamily();
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const prefilled = params.get("symptom");
      if (prefilled) {
        setSelectedSymptoms(prev => prev.includes(prefilled) ? prev : [...prev, prefilled]);
      }
    }
  }, []);

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCustomSymptom(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("token");
    if (!authLoading && !user && !hasToken) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data } = await api.get("/health/profile");
        setProfileData(data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setProfileExists(false);
        }
      }
    };
    if (user) checkProfile();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, step]);

  const toggleSymptom = (smp: string) => {
    if (selectedSymptoms.includes(smp)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== smp));
    } else {
      setSelectedSymptoms([...selectedSymptoms, smp]);
    }
  };

  const handleNextStep = async () => {
    if (step === "symptoms") {
      if (selectedSymptoms.length === 0) return;
      
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), role: "user", type: "text", text: `I am experiencing: ${selectedSymptoms.join(", ")}.` },
        { id: (Date.now() + 1).toString(), role: "ai", type: "text", text: "Got it. How severe would you say these symptoms are overall?" }
      ]);
      setStep("severity");
    } 
    else if (step === "severity") {
      setMessages(prev => [
         ...prev,
         { id: Date.now().toString(), role: "user", type: "text", text: `They feel ${severity}.` },
         { id: (Date.now()+1).toString(), role: "ai", type: "text", text: "Please enter your vital signs (SpO2, Heart Rate, BP) for a more accurate report." }
      ]);
      setStep("vitals");
    }
    else if (step === "vitals") {
        setMessages(prev => [
           ...prev,
           { id: Date.now().toString(), role: "user", type: "text", text: `SpO2: ${vitals.spO2}%, HR: ${vitals.heartRate} bpm, BP: ${vitals.bpSystolic} mmHg.` },
           { id: (Date.now()+1).toString(), role: "ai", type: "text", text: "I see. And how many days have you been feeling this way?" }
        ]);
        setStep("duration");
    }
    else if (step === "duration") {
       setMessages(prev => [
         ...prev,
         { id: Date.now().toString(), role: "user", type: "text", text: `For about ${duration} day(s).` },
         { id: (Date.now()+1).toString(), role: "ai", type: "loading" }
       ]);
       setStep("finished");
       
       await submitPrediction();
    }
  };

  const submitPrediction = async () => {
    const formattedSymptoms = selectedSymptoms.map((name) => ({
      name: name.toLowerCase().replace(" ", "_"),
      severity
    }));

    try {
      const { data } = await api.post("/health/predict", {
        symptoms: formattedSymptoms,
        vitals: vitals,
        durationDays: duration
      });
      setMessages(prev => prev.map(m => m.type === "loading" ? { 
        id: m.id, 
        role: "ai", 
        type: "result", 
        resultData: data 
      } : m));

      if (data.prediction.riskLevel === 'High' && familyContacts.length > 0) {
        setShowFamilyModal(true);
      }
    } catch (err: any) {
      setMessages(prev => prev.map(m => m.type === "loading" ? {
        id: m.id,
        role: "ai",
        type: "error",
        text: err.response?.data?.message || "An error occurred during prediction."
      } : m));
    }
  };

  const resetChat = () => {
     setMessages([{ id: Date.now().toString(), role: "ai", type: "text", text: "Let's run another analysis. What are your symptoms?" }]);
     setSelectedSymptoms([]);
     setSeverity("mild");
     setDuration(1);
     setStep("symptoms");
  };

  const downloadReport = async () => {
    if (!reportRef.current) return;
    setDownloadingPdf(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#030712" });
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 210; 
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
      pdf.setFillColor(3, 7, 18);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`HealthAI_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-screen text-cyan-500 animate-pulse font-black uppercase tracking-widest text-[11px] italic">
      Syncing Medical Data...
    </div>
  );

  if (!profileExists) {
    return (
      <main className="min-h-screen pt-12 md:pt-20 px-6 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-500/10 blur-[150px] -z-10 rounded-full"></div>
        <div className="max-w-2xl mx-auto glass rounded-[3rem] border border-white/10 text-center p-16 shadow-2xl backdrop-blur-3xl">
          <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">Profile <span className="text-red-400">Required</span></h1>
          <p className="text-gray-400 font-medium mb-10 leading-relaxed">Please complete your health profile first so our AI can provide an accurate risk assessment based on your history.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/profile")} 
            className="px-10 py-4 bg-gradient-to-r from-red-600 to-rose-500 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20"
          >
            Complete Profile
          </motion.button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-6 md:pt-10 pb-20 px-6 relative overflow-hidden flex flex-col">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-500/5 blur-[120px] -z-10 rounded-full"></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-500/5 blur-[120px] -z-10 rounded-full"></div>

      {/* Emergency Modal */}
      <AnimatePresence>
          {showFamilyModal && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
                  <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="glass max-w-sm w-full p-10 text-center border-red-500/30 relative overflow-hidden rounded-[3rem] shadow-2xl"
                  >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-rose-500 animate-pulse"></div>
                      <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                          <Siren className="w-12 h-12 text-red-500 animate-bounce" />
                      </div>
                      <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter">Family Notified!</h2>
                      <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">
                          A High Health Risk was detected. Emergency alerts have been dispatched to your Safety Circle:
                      </p>
                      <div className="space-y-3 mb-10 text-left">
                          {familyContacts.filter(c => c.notifyOnHighRisk).map(c => (
                              <div key={c._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group transition-colors hover:bg-white/[0.08]">
                                  <span className="font-black text-xs text-gray-200 tracking-tight">{c.name}</span>
                                  <span className="text-[10px] uppercase font-black text-green-400 tracking-widest flex items-center gap-1.5 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                      <CheckCircle2 className="w-3 h-3" /> Sent
                                  </span>
                              </div>
                          ))}
                      </div>
                      <button 
                          onClick={() => setShowFamilyModal(false)}
                          className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-red-500/20"
                      >
                          Stay Safe
                      </button>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col pt-4 overflow-hidden">
        {/* Breadcrumb */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-8 font-black uppercase tracking-widest text-[10px] group w-fit shrink-0"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Header */}
        <header className="mb-10 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-600 to-blue-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
              <div className="relative p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                <Stethoscope className="w-7 md:w-8 h-7 md:h-8 text-cyan-400 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter text-white">
                Health <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">Assistant</span>
              </h1>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 mt-1.5 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-cyan-500/50" /> Interactive Symptom Analyst
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            {step === "finished" && (
               <motion.button 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                onClick={resetChat} 
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/10 transition-all active:scale-95"
               >
                 + New Analysis
               </motion.button>
            )}
          </div>
        </header>

        {/* Predictor Interface Container */}
        <div className="relative flex-1 flex flex-col glass rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl shadow-black/80 backdrop-blur-3xl bg-white/[0.01]">
           
           {/* Chat messages viewport */}
           <div className="flex-1 overflow-y-auto p-6 lg:p-8 xl:p-10 space-y-8 custom-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex gap-5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                     <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg transition-all duration-500 ${
                       msg.role === 'ai' 
                       ? 'bg-white/5 border-white/10 text-cyan-400' 
                       : 'bg-gradient-to-tr from-cyan-600 to-blue-600 border-white/20 text-white shadow-cyan-900/10'
                     }`}>
                       {msg.role === 'ai' ? <Bot className="w-5 h-5 shadow-inner" /> : <UserIcon className="w-5 h-5" />}
                     </div>
                     
                     <div className={`group relative p-4 md:p-6 rounded-[2rem] text-sm md:text-base font-medium leading-relaxed transition-all duration-300 shadow-2xl max-w-[90%] md:max-w-[75%] ${
                       msg.role === 'user' 
                       ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-none border border-white/10' 
                       : 'bg-white/[0.04] backdrop-blur-2xl border border-white/10 text-gray-200 rounded-tl-none hover:bg-white/[0.07] hover:border-cyan-500/20'
                     }`}>
                        {msg.type === "loading" && (
                           <div className="flex items-center gap-4 text-cyan-400 py-2">
                             <Loader2 className="w-6 h-6 animate-spin" />
                             <span className="font-black uppercase tracking-widest text-xs animate-pulse italic">Scanning Health Patterns...</span>
                           </div>
                        )}
                        
                        {msg.type === "text" && (
                           <p>{msg.text}</p>
                        )}
 
                        {msg.type === "error" && (
                           <div className="text-red-400 font-bold flex items-center gap-3">
                              <AlertCircle className="w-6 h-6" /> {msg.text}
                           </div>
                        )}
 
                        {msg.type === "result" && msg.resultData && (
                           <div className="space-y-10 pt-4 pb-4 px-2" ref={reportRef}>
                              {/* Medical ID PDF Header */}
                              <div className="border-b border-white/10 pb-8 mb-4">
                                <div className="flex items-center justify-between gap-4 mb-6">
                                  <div className="flex items-center gap-3">
                                    <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                                      <FileText className="w-6 h-6 text-cyan-400"/>
                                    </div>
                                    <div>
                                      <h3 className="text-2xl font-black text-white tracking-widest">HEALTHAI REPORT</h3>
                                      <p className="text-[8px] font-black uppercase text-gray-500 tracking-[0.4em] mt-1">Symptom Risk Assessment</p>
                                    </div>
                                  </div>
                                  <Stethoscope className="w-8 h-8 text-white/5 pr-2" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-[10px] text-gray-400 p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 font-black uppercase tracking-wider">
                                  <div className="flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-white/5 pb-2 sm:pb-0"><span className="text-gray-600">Patient:</span> <span className="text-gray-200 truncate">{user?.name}</span></div>
                                  <div className="flex flex-col gap-1 border-b sm:border-b-0 md:border-r border-white/5 pb-2 sm:pb-0 md:pr-2"><span className="text-gray-600">Date:</span> <span className="text-gray-200 whitespace-nowrap">{new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}</span></div>
                                  <div className="flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-white/5 pb-2 sm:pb-0"><span className="text-gray-600">Gender/Age:</span> <span className="text-gray-200">{profileData?.gender} / {profileData?.age}</span></div>
                                  <div className="flex flex-col gap-1"><span className="text-gray-600">BMI Index:</span> <span className="text-gray-200">{profileData?.bmi}</span></div>
                                </div>
                              </div>
 
                              {msg.resultData.prediction.isEmergency && (
                                <motion.div initial={{ scale: 0.95 }} animate={{ scale: [0.95, 1, 0.95] }} transition={{ repeat: Infinity, duration: 2 }} className="bg-gradient-to-br from-red-600/30 to-rose-500/10 border-2 border-red-500/50 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                                   <div className="flex items-center gap-5 mb-5">
                                      <div className="bg-red-500 p-3 rounded-2xl shadow-lg ring-4 ring-red-500/20">
                                         <ShieldAlert className="w-7 h-7 text-white" />
                                      </div>
                                      <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Emergency Protocol!</h3>
                                        <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">Immediate Medical Attention Required</p>
                                      </div>
                                   </div>
                                   <p className="text-red-200/80 text-sm font-medium leading-relaxed mb-8 border-l-2 border-red-500/30 pl-4 py-1 italic">
                                      Your reported symptoms correlate with high-risk clinical patterns. Do not ignore these signs. Seek professional intervention immediately.
                                   </p>
                                   <div className="flex flex-wrap gap-4">
                                      <button 
                                        onClick={() => router.push('/emergency/nearby')}
                                        className="bg-white text-red-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-90 transition-all shadow-xl active:scale-95"
                                      >
                                        Find Nearest Hospital
                                      </button>
                                      <a 
                                        href="tel:112"
                                        className="bg-red-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                                      >
                                        <Siren className="w-4 h-4" /> Dispatch 112
                                      </a>
                                   </div>
                                </motion.div>
                              )}
 
                              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <h3 className="font-black text-lg text-white tracking-widest uppercase italic">Diagnostic Summary</h3>
                                <div className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
                                  msg.resultData.prediction.riskLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/5' :
                                  msg.resultData.prediction.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-amber-500/5' : 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-red-500/5'
                                }`}>
                                  {msg.resultData.prediction.riskLevel} Risk Detected
                                </div>
                              </div>
 
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 relative group overflow-hidden">
                                 <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-[80px] -z-10 group-hover:bg-cyan-500/10 transition-all"></div>
                                 <div className="md:col-span-4 flex justify-center">
                                   <div className="w-20 h-20 relative flex items-center justify-center">
                                     <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle cx="40" cy="40" r="34" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                                        <motion.circle 
                                          initial={{ strokeDashoffset: 214 }}
                                          animate={{ strokeDashoffset: 214 - (214 * (Array.isArray(msg.resultData.prediction.probability) ? msg.resultData.prediction.probability[0] : msg.resultData.prediction.probability) / 100) }}
                                          transition={{ duration: 1.5, ease: "easeOut" }}
                                          cx="40" cy="40" r="34" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray={214} strokeLinecap="round" className="text-cyan-400" 
                                        />
                                     </svg>
                                     <span className="text-xl font-black italic tracking-tighter">{Math.round(Array.isArray(msg.resultData.prediction.probability) ? msg.resultData.prediction.probability[0] : msg.resultData.prediction.probability)}%</span>
                                   </div>
                                 </div>
                                 <div className="md:col-span-8">
                                    <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] font-black mb-1 flex items-center gap-2">Confidence Score <Sparkles className="w-3 h-3 text-cyan-500/50" /></p>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">This score represents our AI&apos;s statistical confidence based on 10,000+ clinical datasets.</p>
                                 </div>
                              </div>
 
                              <div className="space-y-6">
                                <h4 className="font-black text-xs uppercase tracking-[0.3em] text-cyan-400 mb-4 flex items-center gap-3 border-l-4 border-cyan-400/30 pl-4 py-1">
                                  Clinical Recommendations
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                  {msg.resultData.prediction.recommendations.map((rec: string, i: number) => (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i} className="text-sm text-gray-300 bg-white/[0.03] p-5 rounded-3xl border border-white/5 font-medium flex gap-4">
                                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                                      {rec}
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
 
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {msg.resultData.prediction.suggestedSpecialist && (
                                  <div className="glass p-6 rounded-[2.5rem] border border-blue-500/20 bg-blue-500/[0.02]">
                                    <h4 className="font-black text-[10px] uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                                      <Stethoscope className="w-4 h-4" /> Specialist Referral
                                    </h4>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Recommended Care</span>
                                      <span className="text-xl font-black text-blue-100 tracking-tight">{msg.resultData.prediction.suggestedSpecialist}</span>
                                    </div>
                                  </div>
                                )}
 
                                {msg.resultData.prediction.otcMedicines && msg.resultData.prediction.otcMedicines.length > 0 && (
                                  <div className="glass p-6 rounded-[2.5rem] border border-amber-500/20 bg-amber-500/[0.02]">
                                    <h4 className="font-black text-[10px] uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
                                      <Pill className="w-4 h-4" /> Relief Actions
                                    </h4>
                                    <div className="space-y-4">
                                      <div className="flex flex-wrap gap-2">
                                        {msg.resultData.prediction.otcMedicines.map((med: string, i: number) => (
                                          <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">{med}</span>
                                        ))}
                                      </div>
                                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 items-start">
                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-bold text-red-300 leading-normal uppercase">AI Advisory: Consult doctor before intake.</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
 
                              <div className="pt-10 border-t border-white/10 text-center space-y-8">
                                 <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] max-w-lg mx-auto leading-relaxed">This report is AI-generated for internal assessment. It is not an official medical diagonsis. For validation, share this report with your Physician.</p>
                                 
                                 <motion.button 
                                   whileHover={{ scale: 1.02 }}
                                   whileTap={{ scale: 0.98 }}
                                   data-html2canvas-ignore
                                   onClick={downloadReport} 
                                   disabled={downloadingPdf}
                                   className="group relative w-full overflow-hidden"
                                 >
                                   <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/30 to-blue-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                   <div className="relative bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all hover:border-cyan-500/50 hover:bg-white/[0.08]">
                                     {downloadingPdf ? <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> : <Download className="w-5 h-5 text-cyan-400" />}
                                     <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Generate Full Evidence Report</span>
                                     <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                                   </div>
                                 </motion.button>
                              </div>
                           </div>
                        )}
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
           </div>
 
           {/* Dynamic Controller Area based on Stage */}
           <div className="shrink-0 p-6 lg:p-8 xl:p-10 bg-gradient-to-b from-transparent via-black/30 to-black/80 border-t border-white/10 backdrop-blur-3xl">
              <AnimatePresence mode="wait">
                {step === "symptoms" && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="symptoms" className="space-y-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 flex items-center gap-3">
                          <Sparkles className="w-3 h-3 text-cyan-500/40" /> Recommended Selections
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          {AVAILABLE_SYMPTOMS.map(s => (
                             <button 
                               key={s} 
                               onClick={() => toggleSymptom(s)}
                               className={`px-5 py-3 rounded-2xl text-xs font-black transition-all border group relative overflow-hidden ${selectedSymptoms.includes(s) ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-white/10 shadow-lg shadow-cyan-500/20' : 'bg-white/[0.03] text-gray-500 border-white/10 hover:border-cyan-500/30 hover:text-cyan-400 active:scale-95'}`}
                             >
                               <span className="relative z-10">{s}</span>
                               {selectedSymptoms.includes(s) && <span className="absolute top-0 right-0 p-1"><CheckCircle2 className="w-2.5 h-2.5 text-white/50" /></span>}
                             </button>
                          ))}
                          {selectedSymptoms.filter(s => !AVAILABLE_SYMPTOMS.includes(s)).map(s => (
                             <button 
                               key={s} 
                               onClick={() => toggleSymptom(s)}
                               className="px-5 py-3 rounded-2xl text-xs font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 active:scale-95"
                             >
                               {s} <span className="ml-2 text-cyan-500/50">✕</span>
                             </button>
                          ))}
                        </div>
                      </div>
 
                      <div className="flex flex-col md:flex-row items-center gap-4">
                         <div className="relative group/input flex-1 w-full">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/30 to-blue-500/30 blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-700"></div>
                            <input 
                              type="text" 
                              value={customSymptom}
                              onChange={(e) => setCustomSymptom(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
                                    setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
                                    setCustomSymptom("");
                                  }
                                }
                              }}
                              placeholder="Type or speak symptoms manually..."
                              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 pl-6 pr-36 text-sm font-medium focus:border-cyan-500/50 focus:bg-white/[0.08] outline-none text-white placeholder:text-gray-600 transition-all backdrop-blur-xl relative z-10 italic"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 z-20">
                               <button
                                 onClick={startListening}
                                 className={`p-2.5 rounded-xl border transition-all ${
                                   isListening ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse' : 'bg-white/5 text-gray-500 border-white/5 hover:text-cyan-400 hover:border-white/20'
                                 }`}
                               >
                                 {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                               </button>
                               <button
                                 onClick={() => {
                                     if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
                                       setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
                                       setCustomSymptom("");
                                     }
                                 }}
                                 disabled={!customSymptom.trim()}
                                 className="px-4 py-2.5 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500 border border-white/5 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all disabled:opacity-30 active:scale-95 whitespace-nowrap"
                               >
                                 Add
                               </button>
                            </div>
                         </div>
                      </div>
 
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-white/5">
                         <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                               {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#09090b] bg-white/10 flex items-center justify-center"><UserIcon className="w-3 h-3 text-gray-500" /></div>)}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{selectedSymptoms.length} Indications Selected</span>
                         </div>
                         <motion.button 
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={handleNextStep} 
                           disabled={selectedSymptoms.length === 0} 
                           className="group relative overflow-hidden w-full sm:w-auto"
                         >
                           <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-500 blur-lg opacity-60 group-hover:opacity-100 transition-opacity"></div>
                           <div className="relative py-4 px-10 rounded-2xl flex items-center justify-center gap-3 bg-black/40 border border-white/10 backdrop-blur-xl group-disabled:brightness-50 group-disabled:cursor-not-allowed">
                             <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Next Stage</span>
                             <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                           </div>
                         </motion.button>
                      </div>
                   </motion.div>
                )}
 
                {step === "severity" && (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="severity" className="space-y-8 text-center sm:text-left">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center justify-center sm:justify-start gap-3">
                        Select Symptom Severity
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                           {["mild", "moderate", "severe"].map(sev => (
                              <button 
                                key={sev}
                                onClick={() => setSeverity(sev)}
                                className={`px-8 py-4 rounded-3xl text-xs font-black uppercase tracking-widest transition-all border-2 relative overflow-hidden ${severity === sev ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border-cyan-500/50 text-cyan-400' : 'bg-white/[0.02] text-gray-600 border-white/5 hover:border-white/20 hover:text-gray-400'}`}
                              >
                                {severity === sev && <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-500 rounded-bl-full"></div>}
                                {sev}
                              </button>
                           ))}
                        </div>
                        <motion.button onClick={handleNextStep} whileHover={{ scale: 1.05 }} className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-500 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-cyan-500/20 flex items-center gap-3">
                             Confirm <Send className="w-4 h-4"/>
                        </motion.button>
                      </div>
                   </motion.div>
                )}
 
                {step === "vitals" && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} key="vitals" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { label: "Oxygen (SpO2 %)", val: vitals.spO2, update: (v: number) => setVitals({...vitals, spO2: v}), icon: <Wind className="w-4 h-4 text-cyan-400" />, min: 70, max: 100 },
                        { label: "Heart Rate (BPM)", val: vitals.heartRate, update: (v: number) => setVitals({...vitals, heartRate: v}), icon: <HeartPulse className="w-4 h-4 text-rose-400" />, min: 40, max: 200 },
                        { label: "Systolic BP (mmHg)", val: vitals.bpSystolic, update: (v: number) => setVitals({...vitals, bpSystolic: v}), icon: <Activity className="w-4 h-4 text-emerald-400" />, min: 70, max: 250 }
                      ].map((v, i) => (
                        <div key={i} className="glass p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                          <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center justify-between mb-4">
                            {v.label}
                            {v.icon}
                          </label>
                          <input 
                            type="number" 
                            value={v.val} 
                            onChange={e => v.update(parseInt(e.target.value) || v.min)} 
                            className="w-full bg-transparent text-2xl font-black text-white focus:outline-none focus:text-cyan-400 transition-colors" 
                            min={v.min} max={v.max} 
                          />
                          <div className="mt-3 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${((v.val - v.min) / (v.max - v.min)) * 100}%` }} className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 group-hover:from-white group-hover:to-cyan-400 transition-colors"></motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <motion.button onClick={handleNextStep} whileHover={{ scale: 1.02 }} className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-[2rem] text-white font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all">
                        Sync Vital Parameters
                    </motion.button>
                  </motion.div>
                )}
 
                {step === "duration" && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="duration" className="space-y-10">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex-1 w-full space-y-6">
                          <div className="flex justify-between items-end">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Onset Duration</p>
                            <span className="text-4xl font-black italic text-cyan-400 tracking-tighter">{duration} <span className="text-xs uppercase text-gray-500 font-black tracking-widest not-italic ml-2">Days</span></span>
                          </div>
                          <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 flex items-center">
                            <input 
                               type="range" min="1" max="30" 
                               value={duration} 
                               onChange={e => setDuration(parseInt(e.target.value))}
                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <motion.div style={{ width: `${(duration / 30) * 100}%` }} className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.5)]"></motion.div>
                          </div>
                        </div>
                        <motion.button 
                          onClick={handleNextStep} 
                          whileHover={{ scale: 1.05 }} 
                          whileTap={{ scale: 0.95 }}
                          className="group relative overflow-hidden shrink-0"
                        >
                             <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 blur-xl opacity-80 animate-pulse"></div>
                             <div className="relative bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] px-12 py-5 rounded-3xl shadow-2xl flex items-center gap-4 transition-all hover:bg-black hover:text-white hover:border hover:border-white/10 group">
                               Run Intel <Stethoscope className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                             </div>
                        </motion.button>
                      </div>
                   </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </main>
  );
}


