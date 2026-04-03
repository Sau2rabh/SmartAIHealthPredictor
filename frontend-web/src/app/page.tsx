"use client";

import { ArrowRight, ShieldCheck, HeartPulse, BrainCircuit, Activity, Download, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "HealthAI Predictor",
    "description": "Predict Your Health Risks With Precision AI. Next-generation medical analysis and symptom tracker.",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
      }
    } else {
      setShowFallback(true);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 glass border-b border-white/5 py-4 px-6 md:px-12 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image 
               src="/icon-512.png" 
               alt="HealthAI Logo" 
               width={40} 
               height={40} 
               className="rounded-xl group-hover:scale-105 transition-transform"
            />
            <span className="font-extrabold text-2xl tracking-tight text-white hidden md:block">
              Health<span className="text-cyan-400">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {!isStandalone && (
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-2 text-sm font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-2 rounded-xl border border-cyan-500/30 transition-all"
              >
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">Install App</span>
              </button>
            )}
            <Link href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hidden sm:flex text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 px-5 py-2.5 rounded-xl transition-all">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium tracking-wide uppercase text-cyan-400">Next-Gen Health Analysis</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
          >
            Predict Your Health Risks <br />
            With <span className="text-gradient">Precision AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed"
          >
            Leverage advanced machine learning to analyze symptoms, assess risk factors, and receive personalized medical recommendations specialized for your profile.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/signup" className="btn-primary group">
              Get Started Free <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/about" className="btn-secondary">
              How it Works
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8 text-cyan-400" />}
            title="Privacy First"
            description="Your health data is encrypted and stored securely. We prioritize your privacy above all else."
          />
          <FeatureCard
            icon={<BrainCircuit className="w-8 h-8 text-cyan-400" />}
            title="AI Powered"
            description="Our models are trained on extensive health datasets to provide high-accuracy risk predictions."
          />
          <FeatureCard
            icon={<HeartPulse className="w-8 h-8 text-cyan-400" />}
            title="Early Warnings"
            description="Identify potential health issues before they become serious with our early warning system."
          />
        </div>
      </section>

      {/* Interactive Section */}
      <section className="py-20 px-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[100px] rounded-full -z-10 animate-pulse"></div>
          <div className="max-w-4xl mx-auto glass-card text-center p-12">
              <h2 className="text-3xl font-bold mb-6">Ready to take control of your health?</h2>
              <p className="text-gray-400 mb-10">Join thousands of users who trust HealthAI for their daily health monitoring and risk assessment.</p>
              <Link href="/signup" className="btn-primary">
                  Create Your Account Now
              </Link>
          </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm">
          <p>© 2026 HealthAI Predictor. All rights reserved. For educational purposes only.</p>
      </footer>

      {showFallback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowFallback(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-400" /> Install HealthAI
            </h3>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              Your browser doesn't support direct installation, or the app is not yet ready to be installed. You can still install it manually:
            </p>
            <ul className="text-gray-400 text-sm space-y-3 list-disc pl-5 mb-6">
              <li><strong>iOS Safari:</strong> Tap the <span className="text-cyan-400">Share</span> icon at the bottom, then select &quot;Add to Home Screen&quot;.</li>
              <li><strong>Android Chrome:</strong> Tap the <span className="text-cyan-400">3-dot menu</span> at the top right and select &quot;Install app&quot; or &quot;Add to Home screen&quot;.</li>
              <li><strong>Desktop:</strong> Look for the install icon in the right side of your browser's address bar.</li>
            </ul>
            <button 
              onClick={() => setShowFallback(false)}
              className="w-full btn-primary py-2"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="glass-card flex flex-col items-start"
    >
      <div className="p-3 bg-cyan-500/10 rounded-xl mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
    </motion.div>
  );
}
