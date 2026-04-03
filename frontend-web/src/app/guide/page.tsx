import { BookOpen, AlertCircle, HeartPulse, Search } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import SymptomsList from "./SymptomsList";

export const metadata: Metadata = {
  title: "Health Symptoms Guide | HealthAI Library",
  description: "Browse our comprehensive AI-curated library of health symptoms, learn what they mean, and get insights into potential early warnings.",
  keywords: ["Health Symptoms", "Symptom Guide", "Medical Information", "AI Health Library", "Fever Causes", "Headache Meanings"]
};

const SYMPTOMS = [
  {
    title: "Persistent Fever",
    description: "A fever is a temporary increase in your body temperature, often due to an illness. While usually a sign that your body is fighting off an infection, a persistent fever (lasting more than 3 days) could indicate a more severe underlying issue requiring medical attention.",
    risk: "Medium",
    keywords: ["Temperature", "Infection", "Flu"]
  },
  {
    title: "Chronic Fatigue",
    description: "Feeling constantly exhausted despite getting enough sleep. This can be tied to lifestyle factors, stress, or medical conditions such as anemia, thyroid disorders, or chronic fatigue syndrome.",
    risk: "Medium",
    keywords: ["Tiredness", "Exhaustion", "Low Energy"]
  },
  {
    title: "Sharp Chest Pain",
    description: "Any new or unexplained chest pain warrants immediate medical evaluation. It can be caused by gastrointestinal issues, muscle strain, or critically, cardiovascular problems like a heart attack.",
    risk: "High",
    keywords: ["Heart", "Cardio", "Emergency"]
  },
  {
    title: "Shortness of Breath",
    description: "Difficulty taking in a full breath or feeling out of breath after minimal exertion. This can be linked to asthma, pneumonia, or heart conditions.",
    risk: "High",
    keywords: ["Lungs", "Breathing", "Asthma"]
  },
  {
    title: "Frequent Headaches",
    description: "While common tension headaches are normal, frequent, severe, or suddenly changing headaches could be a sign of migraines, high blood pressure, or underlying neurological issues.",
    risk: "Low to Medium",
    keywords: ["Migraine", "Stress", "Tension"]
  }
];

export default function Guide() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#000000]">

      <section className="relative pt-8 md:pt-12 pb-10 px-6 border-b border-white/5">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 blur-[130px] rounded-full -z-10"></div>
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 border border-white/5">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium tracking-wide uppercase text-cyan-400">Knowledge Base</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Health Symptoms <span className="text-gradient">Library</span>
          </h1>

          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Understand your body better. Browse our AI-curated index of common symptoms to learn about potential causes and when you should seek immediate help.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          
          <SymptomsList symptoms={SYMPTOMS} />

        </div>
      </section>

      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center glass p-10 rounded-3xl">
            <AlertCircle className="w-10 h-10 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Need a personalized analysis?</h2>
            <p className="text-gray-400 mb-8">
              Don't just guess. Create an account and use our advanced AI model to get personalized predictions based on your unique health profile and symptoms.
            </p>
            <Link href="/signup" className="btn-primary">
                Start Free Analysis
            </Link>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm">
          <p>© 2026 HealthAI Predictor. All rights reserved. For educational purposes only.</p>
      </footer>
    </main>
  );
}
