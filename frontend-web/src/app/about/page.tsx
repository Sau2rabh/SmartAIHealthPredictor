import { ShieldCheck, Cpu, Database, Activity, Map } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About HealthAI | How Our Medical AI Works",
  description: "Learn how HealthAI uses advanced machine learning to predict health risks, track symptoms, and provide early medical warnings while protecting your privacy.",
};

export default function About() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#000000]">

      <section className="relative pt-8 md:pt-12 pb-20 px-6">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border border-white/5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium tracking-wide uppercase text-cyan-400">Our Technology</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">
            The Science Behind <span className="text-gradient">HealthAI</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-3xl mb-10 leading-relaxed">
            HealthAI was built on the intersection of deep learning and medical science. Our mission is to democratize early health risk detection using state-of-the-art predictive models, empowering individuals to take proactive steps towards better health.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Feature 1 */}
            <div className="glass p-8 rounded-3xl border border-white/5">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Extensive Medical Datasets</h2>
              <p className="text-gray-400 leading-relaxed">
                Our AI models are trained on millions of anonymized data points from clinical studies and public health databases. This allows the system to recognize complex symptom patterns that might otherwise be missed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass p-8 rounded-3xl border border-white/5">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Uncompromising Privacy</h2>
              <p className="text-gray-400 leading-relaxed">
                Health data is incredibly sensitive. We use end-to-end encryption and strict data anonymization practices to ensure your health information is never compromised, sold, or exposed.
              </p>
            </div>

          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Not a Substitute for Doctors</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              While HealthAI provides highly accurate statistical predictions, it is designed to be an early warning system and a guide. It is not a diagnostic tool and does not replace professional medical advice. Always consult a certified healthcare professional for formal diagnosis.
            </p>
            <div className="flex gap-4 items-center justify-center">
                <Link href="/predict" className="btn-primary">
                    Try the Predictor
                </Link>
                <Link href="/guide" className="btn-secondary">
                    View Health Guide
                </Link>
            </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm">
          <p>© 2026 HealthAI Predictor. All rights reserved. For educational purposes only.</p>
      </footer>
    </main>
  );
}
