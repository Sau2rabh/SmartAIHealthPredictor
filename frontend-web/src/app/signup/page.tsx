"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/signup", { name, email, password });
      login(data.token, { _id: data._id, name: data.name, email: data.email });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-8 md:pt-12 px-6">
      <div className="max-w-md mx-auto">
        <div className="glass-card p-8 sm:p-10">
          <div className="text-center mb-10">
            <div className="inline-flex p-3 bg-cyan-500/10 rounded-2xl mb-4">
              <UserPlus className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold">Join HealthAI</h1>
            <p className="text-gray-400 mt-2">Start your personalized health journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Sign in now
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
