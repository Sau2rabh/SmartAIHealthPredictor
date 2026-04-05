"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Stethoscope, 
  Loader2, 
  AlertCircle,
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
  MicOff
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
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#09090b" });
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 210; // Standard A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Dynamic height to fit all content perfectly on a single continuous page
      const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
      
      // Fill the entire dynamically sized page with the dark background color
      pdf.setFillColor(9, 9, 11);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`HealthAI_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;

  if (!profileExists) {
    return (
      <main className="min-h-screen pt-8 md:pt-12 px-6">
        <div className="max-w-2xl mx-auto glass-card text-center p-12">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Profile Required</h1>
          <p className="text-gray-400 mb-8">Please complete your health profile first to get accurate AI risk predictions.</p>
          <button onClick={() => router.push("/profile")} className="btn-primary">
            Complete Profile
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-8 md:pt-12 pb-20 px-6 max-h-screen flex flex-col">
      
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col" style={{ maxHeight: 'calc(100vh - 150px)' }}>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 font-medium text-sm w-fit shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <header className="mb-6 shrink-0 flex items-center justify-between">
          <div>
             <h1 className="text-3xl font-bold flex items-center gap-3">
               <Stethoscope className="text-cyan-400" /> Health Assistant
             </h1>
             <p className="text-gray-400 mt-1 text-sm">Interactive AI Symptom Analyst</p>
          </div>
          {step === "finished" && (
             <button onClick={resetChat} className="text-sm font-bold text-cyan-400 hover:text-white transition-colors">
               + New Analysis
             </button>
          )}
        </header>

        {/* Chat Area */}
        <div className="glass-card flex-1 flex flex-col overflow-hidden border border-white/5 relative">
           
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'}`}>
                       {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                     </div>
                     
                     <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-purple-500/10 border border-purple-500/20 rounded-tr-sm' : 'bg-white/5 border border-white/5 rounded-tl-sm'}`}>
                        {msg.type === "loading" && (
                           <div className="flex items-center gap-3 text-cyan-400">
                             <Loader2 className="w-5 h-5 animate-spin" />
                             <span className="font-medium animate-pulse">Analyzing symptoms with AI...</span>
                           </div>
                        )}
                        
                        {msg.type === "text" && (
                           <p className="text-gray-200 leading-relaxed text-sm md:text-base">{msg.text}</p>
                        )}

                        {msg.type === "error" && (
                           <div className="text-red-400 flex items-center gap-2">
                              <AlertCircle className="w-5 h-5" /> {msg.text}
                           </div>
                        )}

                        {msg.type === "result" && msg.resultData && (
                           <div className="space-y-6 pt-4 pb-2 px-4 sm:px-6" ref={reportRef}>
                              {/* PDF HEADER (Hidden visually, but will render in PDF) */}
                              <div className="border-b border-white/10 pb-4 mb-4">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                  <FileText className="w-5 h-5 text-cyan-400"/> HealthAI Medical Report
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 p-3 bg-black/20 rounded-lg">
                                  <p><strong>Patient Name:</strong> {user?.name}</p>
                                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                                  <p><strong>Age/Gender:</strong> {profileData?.age} / <span className="capitalize">{profileData?.gender}</span></p>
                                  <p><strong>BMI:</strong> {profileData?.bmi}</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-white">Analysis Result</h3>
                                <div className={`inline-flex items-center justify-center h-6 px-3 rounded-full text-[11px] font-bold uppercase tracking-widest ${
                                  msg.resultData.prediction.riskLevel === 'Low' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                  msg.resultData.prediction.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                  <span className="leading-none pt-[1px]">{msg.resultData.prediction.riskLevel} Risk</span>
                                </div>
                              </div>

                              <div className="flex bg-black/20 p-4 rounded-xl items-center justify-center gap-6 border border-white/5">
                                 <div className="w-20 h-20 shrink-0 rounded-full flex items-center justify-center relative">
                                   <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full -rotate-90 overflow-visible">
                                      <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                                      <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray={226} strokeDashoffset={226 - (226 * (Array.isArray(msg.resultData.prediction.probability) ? msg.resultData.prediction.probability[0] : msg.resultData.prediction.probability) / 100)} strokeLinecap="round" className="text-cyan-400" />
                                   </svg>
                                   <span className="text-xl font-black">{Math.round(Array.isArray(msg.resultData.prediction.probability) ? msg.resultData.prediction.probability[0] : msg.resultData.prediction.probability)}%</span>
                                 </div>
                                 <div className="flex-1">
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Confidence Score</p>
                                    <p className="text-sm text-gray-300">The AI model&apos;s confidence in this risk assessment based on symptom severity and patterns.</p>
                                 </div>
                              </div>

                              <div>
                                <h4 className="font-bold text-sm uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" /> AI Recommendations
                                </h4>
                                <div className="space-y-2">
                                  {msg.resultData.prediction.recommendations.map((rec: string, i: number) => (
                                    <div key={i} className="text-sm text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5 italic">
                                      {rec}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {msg.resultData.prediction.suggestedSpecialist && (
                                <div className="bg-gradient-to-r from-blue-500/10 to-transparent p-4 rounded-xl border border-blue-500/20">
                                  <h4 className="font-bold text-sm uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-2">
                                    <HeartPulse className="w-4 h-4" /> Suggested Specialist
                                  </h4>
                                  <p className="text-sm text-gray-200">Based on your symptoms, we recommend consulting a: <strong className="text-blue-300 ml-1">{msg.resultData.prediction.suggestedSpecialist}</strong></p>
                                </div>
                              )}

                              {msg.resultData.prediction.otcMedicines && msg.resultData.prediction.otcMedicines.length > 0 && (
                                <div className="bg-gradient-to-r from-orange-500/10 to-transparent p-4 rounded-xl border border-orange-500/20">
                                  <h4 className="font-bold text-sm uppercase tracking-widest text-orange-400 mb-2 flex items-center gap-2">
                                    <Pill className="w-4 h-4" /> Relief Options & Actions
                                  </h4>
                                  <ul className="list-disc pl-5 space-y-1 mb-3">
                                    {msg.resultData.prediction.otcMedicines.map((med: string, i: number) => (
                                      <li key={i} className="text-sm text-gray-300">{med}</li>
                                    ))}
                                  </ul>
                                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-xs text-red-200 font-medium flex gap-2 items-start mt-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                                    <p><strong className="text-red-400">🚨 NOT A PRESCRIPTION.</strong> This is AI-generated advice. Consult a healthcare professional before taking any medication or if symptoms persist.</p>
                                  </div>
                                </div>
                              )}


                              <div className="pt-4 border-t border-white/10 text-center">
                                 <p className="text-[10px] text-gray-500 mb-4">Disclaimer: This is an AI prediction and NOT a definitive medical diagnosis. Please consult a doctor.</p>
                                 
                                 {/* Only show download button on screen, it shouldn't show inside the PDF capture itself since we use `data-html2canvas-ignore` */}
                                 <button 
                                   data-html2canvas-ignore
                                   onClick={downloadReport} 
                                   disabled={downloadingPdf}
                                   className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm"
                                 >
                                   {downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                   Download Full Medical Report (PDF)
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
           </div>

           {/* Input Area */}
           <div className="shrink-0 p-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
              {step === "symptoms" && (
                 <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Select Symptoms:</p>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_SYMPTOMS.map(s => (
                         <button 
                           key={s} 
                           onClick={() => toggleSymptom(s)}
                           className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${selectedSymptoms.includes(s) ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                         >
                           {s}
                         </button>
                      ))}
                      {selectedSymptoms.filter(s => !AVAILABLE_SYMPTOMS.includes(s)).map(s => (
                         <button 
                           key={s} 
                           onClick={() => toggleSymptom(s)}
                           className="px-4 py-2 rounded-full text-xs font-medium border transition-colors bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30"
                         >
                           {s} ✕
                         </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
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
                         placeholder="Type or speak symptoms..."
                         className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none text-white placeholder-gray-500 transition-all"
                       />
                       <button
                         onClick={startListening}
                         className={`p-2 rounded-xl border transition-colors ${
                           isListening ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-cyan-500/10 hover:text-cyan-400'
                         }`}
                         title="Start Voice Input"
                       >
                         {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                       </button>
                       <button
                         onClick={() => {
                             if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
                               setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
                               setCustomSymptom("");
                             }
                         }}
                         disabled={!customSymptom.trim()}
                         className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm font-bold border border-cyan-500/50 disabled:opacity-50 hover:bg-cyan-500/30 transition-colors"
                       >
                         Add
                       </button>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
                       <span className="text-xs font-medium text-gray-400">{selectedSymptoms.length} selected</span>
                       <button onClick={handleNextStep} disabled={selectedSymptoms.length === 0} className="btn-secondary py-2 px-6 flex items-center gap-2 disabled:opacity-50">
                         Next <Send className="w-4 h-4"/>
                       </button>
                    </div>
                 </div>
              )}

              {step === "severity" && (
                 <div className="space-y-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       {["mild", "moderate", "severe"].map(sev => (
                          <button 
                            key={sev}
                            onClick={() => setSeverity(sev)}
                            className={`px-6 py-2 rounded-full text-sm font-bold uppercase transition-colors border ${severity === sev ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                          >
                             {sev}
                          </button>
                       ))}
                    </div>
                    <button onClick={handleNextStep} className="btn-secondary py-2 px-6 flex items-center gap-2">
                         Send <Send className="w-4 h-4"/>
                    </button>
                 </div>
              )}

              {step === "vitals" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Oxygen (SpO2 %)</label>
                      <input type="number" value={vitals.spO2} onChange={e => setVitals({...vitals, spO2: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white" min="70" max="100" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Heart Rate (BPM)</label>
                      <input type="number" value={vitals.heartRate} onChange={e => setVitals({...vitals, heartRate: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white" min="40" max="200" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Systolic BP (mmHg)</label>
                        <input type="number" value={vitals.bpSystolic} onChange={e => setVitals({...vitals, bpSystolic: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white" min="70" max="250" />
                    </div>
                  </div>
                  <button onClick={handleNextStep} className="btn-secondary py-2 px-6 flex items-center gap-2 w-full justify-center">
                      Confirm Vitals <Send className="w-4 h-4"/>
                  </button>
                </div>
              )}

              {step === "duration" && (
                 <div className="space-y-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-2/3">
                      <input 
                         type="range" min="1" max="30" 
                         value={duration} 
                         onChange={e => setDuration(parseInt(e.target.value))}
                         className="flex-1 accent-cyan-500"
                      />
                      <span className="text-xl font-bold text-cyan-400 w-16">{duration} <span className="text-xs uppercase text-gray-500 font-normal">Days</span></span>
                    </div>
                    <button onClick={handleNextStep} className="btn-primary py-2 px-6 flex items-center gap-2 w-full md:w-auto overflow-hidden text-center justify-center">
                         Analyze Now <Stethoscope className="w-4 h-4"/>
                    </button>
                 </div>
              )}
           </div>
        </div>
      </div>
    </main>
  );
}
