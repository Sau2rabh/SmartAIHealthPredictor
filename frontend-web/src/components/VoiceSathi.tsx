import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Mic, MicOff, Volume2, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export interface VoiceSathiRef {
  open: () => void;
}

const VoiceSathi = forwardRef<VoiceSathiRef, { hideButton?: boolean }>(({ hideButton = false }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true)
  }));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'hi-IN'; // Default to Hindi-IN but also understands English

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const result = event.results[current][0].transcript;
          setTranscript(result);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setAiResponse('');
      stopSpeaking();
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speak = (text: string) => {
    if (!text) return;
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Good for Hinglish
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendToAI = async () => {
    if (!transcript) return;
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'}/chat`,
        {
          message: transcript,
        },
      );
      const text = response.data.response;
      setAiResponse(text);
      speak(text);
    } catch (error) {
      console.error('Sathi Error:', error);
      setAiResponse(
        'Maaf kijiye, kuch galati ho gayi. Phir se koshish karein.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isListening && transcript && !isLoading && !aiResponse) {
      handleSendToAI();
    }
  }, [isListening, transcript]);

  return (
    <>
      {/* Toggle Button */}
      {!hideButton && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ 
            scale: 1,
            boxShadow: [
              "0 0 20px rgba(6, 182, 212, 0.2)",
              "0 0 35px rgba(6, 182, 212, 0.5)",
              "0 0 20px rgba(6, 182, 212, 0.2)"
            ]
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(6, 182, 212, 0.6)" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className='fixed bottom-24 md:bottom-8 left-4 z-[60] p-0.5 rounded-full bg-black/60 border border-cyan-500/50 shadow-2xl transition-all backdrop-blur-xl group'
          title='Health Sathi AI'
        >
          <div className='w-10 h-10 rounded-full overflow-hidden relative'>
            <img
              src='/sathi-logo.png'
              alt='Health Sathi'
              className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 shadow-inner'
            />
            {isSpeaking && (
              <div className='absolute inset-0 border-2 border-white rounded-full animate-ping opacity-50'></div>
            )}
            {isListening && (
              <div className='absolute inset-0 bg-red-500/20 animate-pulse'></div>
            )}
          </div>
        </motion.button>
      )}

      {/* Main Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className='fixed inset-0 z-[70] flex items-center justify-center md:left-[18rem] pointer-events-none p-4'>
            {/* Backdrop Blur - only covers content area, not sidebar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                stopSpeaking();
              }}
              className='absolute inset-0 bg-black/40 backdrop-blur-md pointer-events-auto'
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className='relative w-full max-w-lg glass-card p-8 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] pointer-events-auto'
            >
              <div className='flex items-center justify-between mb-8'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20'>
                    <MessageCircle className='w-7 h-7 text-cyan-400' />
                  </div>
                  <div>
                    <h3 className='text-xl font-black text-white tracking-tight'>
                      AI Health Sathi
                    </h3>
                    <p className='text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/70'>
                      Aapka Swasthya Mitra
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    stopSpeaking();
                  }}
                  className='p-2 hover:bg-white/10 rounded-full transition-colors group/close'
                >
                  <X className='w-6 h-6 text-gray-500 group-hover/close:text-white transition-colors' />
                </button>
              </div>

              <div className='space-y-8'>
                {/* Visualizer */}
                <div className='flex justify-center py-10'>
                  <div className='relative flex items-center justify-center'>
                    <motion.div
                      animate={
                        isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }
                      }
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className={`w-28 h-28 rounded-full flex items-center justify-center transition-colors duration-500 ${isListening ? 'bg-cyan-500/20' : 'bg-white/5'}`}
                    >
                      <button
                        onClick={toggleListening}
                        className={`p-7 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${isListening ? 'bg-red-500 shadow-red-500/40' : 'bg-cyan-500 shadow-cyan-500/40'}`}
                      >
                        {isListening ? (
                          <MicOff className='w-10 h-10 text-white' />
                        ) : (
                          <Mic className='w-10 h-10 text-white' />
                        )}
                      </button>
                    </motion.div>
                    {isListening && (
                      <div className='absolute -inset-6 border-2 border-cyan-500/20 rounded-full animate-ping'></div>
                    )}
                  </div>
                </div>

                <div className='min-h-[120px] text-center space-y-6'>
                  {transcript && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className='text-base text-gray-400 italic font-medium'
                    >
                      "{transcript}..."
                    </motion.p>
                  )}
                  {isLoading ? (
                    <div className='flex justify-center gap-2'>
                      <span className='w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce'></span>
                      <span className='w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]'></span>
                      <span className='w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]'></span>
                    </div>
                  ) : (
                    <AnimatePresence mode='wait'>
                      {aiResponse ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className='p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] text-base text-white text-left leading-relaxed relative group/msg'
                        >
                          <Volume2
                            className={`w-5 h-5 absolute top-4 right-4 ${isSpeaking ? 'text-cyan-400 animate-pulse' : 'text-gray-600'}`}
                          />
                          {aiResponse}
                        </motion.div>
                      ) : (
                        <p className='text-gray-500 font-bold uppercase tracking-widest text-[10px]'>
                          {isListening
                            ? 'Listening...'
                            : "Tap the mic and say 'Hello'"}
                        </p>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              </div>

              <div className='mt-10 pt-6 border-t border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-center opacity-50'>
                Hinglish Interface Active
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
});

VoiceSathi.displayName = 'VoiceSathi';
export default VoiceSathi;
