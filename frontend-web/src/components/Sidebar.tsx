"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, User, LogOut, History, PlusCircle, LayoutDashboard, 
  MapPin, ShieldAlert, Siren, QrCode, MessageSquare, FileText, 
  Pill, Sparkles, Users, MoreHorizontal, X, ChevronRight, Menu 
} from "lucide-react";

export default function Sidebar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-6rem)] fixed left-4 top-4 glass border border-white/10 z-50 rounded-[2.5rem] shadow-2xl shadow-black/50 overflow-hidden">
        <div className="p-6 mb-2">
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="relative">
              <div className="absolute -inset-1 bg-cyan-500/20 blur-md rounded-xl"></div>
              <Image 
                 src="/icon-512.png" 
                 alt="HealthAI Logo" 
                 width={38} 
                 height={38} 
                 className="relative rounded-xl group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-cyan-500/10"
              />
            </div>
            <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
              Health<span className="text-cyan-400">AI</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar pb-4">
          {loading ? (
            <div className="flex flex-col gap-4 animate-pulse">
               <div className="h-10 w-full bg-white/5 rounded-xl"></div>
               <div className="h-10 w-full bg-white/5 rounded-xl"></div>
               <div className="h-10 w-full bg-white/5 rounded-xl"></div>
            </div>
          ) : user ? (
            <>
              <SidebarLink href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active={pathname === '/dashboard'} />
              <SidebarLink href="/predict" icon={<PlusCircle className="w-5 h-5" />} label="Analyze" active={pathname === '/predict'} />
              <SidebarLink href="/history" icon={<History className="w-5 h-5" />} label="History" active={pathname === '/history'} />
              
              <div className="pt-4 pb-2 px-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/90 shadow-sm">Health Tools</p>
              </div>
              <SidebarLink href="/chat" icon={<MessageSquare className="w-5 h-5" />} label="AI MedGuide" active={pathname === '/chat'} />
              <SidebarLink href="/report-analyzer" icon={<FileText className="w-5 h-5" />} label="Report Analyzer" active={pathname === '/report-analyzer'} />
              <SidebarLink href="/medications" icon={<Pill className="w-5 h-5" />} label="Medications" active={pathname === '/medications'} />
              <SidebarLink href="/vitals" icon={<Activity className="w-5 h-5" />} label="Vitals Tracking" active={pathname === '/vitals'} />
              <SidebarLink href="/family" icon={<Users className="w-5 h-5" />} label="Family Circle" active={pathname === '/family'} />
              <SidebarLink href="/wellness-plan" icon={<Sparkles className="w-5 h-5" />} label="Wellness Plan" active={pathname === '/wellness-plan'} />

              <div className="pt-4 pb-2 px-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400/90 shadow-sm">Emergency</p>
              </div>
              <SidebarLink href="/emergency/nearby" icon={<MapPin className="w-5 h-5 text-red-400" />} label="Nearby Help" active={pathname === '/emergency/nearby'} />
              <SidebarLink href="/emergency/id" icon={<QrCode className="w-5 h-5 text-red-400" />} label="Medical ID" active={pathname === '/emergency/id'} />
              <SidebarLink href="/emergency/first-aid" icon={<Siren className="w-5 h-5 text-red-400" />} label="First Aid" active={pathname === '/emergency/first-aid'} />
            </>
          ) : (
            <div className="pt-4 flex flex-col gap-3 px-2">
              <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors py-2 text-center border border-white/5 rounded-lg hover:bg-white/5">
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary py-2.5 px-4 text-sm text-center">
                Get Started
              </Link>
            </div>
          )}
        </nav>

        {user && (
          <div className="p-3 mx-3 mb-3 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl shadow-lg relative z-10">
            <div className="flex flex-col gap-3">
              <Link href="/profile" className="flex items-center gap-2.5 group">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-cyan-500 to-blue-500 group-hover:rotate-12 transition-transform duration-500">
                    <div className="w-full h-full rounded-full bg-[#0a0f1e] p-[1.5px]">
                      <div className="w-full h-full rounded-full overflow-hidden border border-white/10 flex items-center justify-center">
                        {user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <User className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0f1e] rounded-full shadow-lg"></div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{user.name}</span>
                </div>
              </Link>
              
              <div className="flex items-center gap-2">
                <Link href="/profile" className="flex-1 text-[10px] uppercase font-black tracking-widest py-1.5 px-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-center transition-all">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 glass z-50 border-b border-white/5 flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <Image 
               src="/icon-512.png" 
               alt="HealthAI Logo" 
               width={28} 
               height={28} 
               className="rounded-lg shadow-lg"
            />
            <span className="font-bold text-lg tracking-tight">
              Health<span className="text-cyan-400">AI</span>
            </span>
          </Link>
          {user && (
            <div className="flex items-center gap-2">
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 rounded-full glass flex items-center justify-center overflow-hidden border border-white/5">
                 {user.avatar ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                 ) : (
                     <User className="w-4 h-4 text-cyan-400" />
                 )}
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`w-9 h-9 rounded-xl glass flex items-center justify-center transition-all border ${isMobileMenuOpen ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'border-white/5 text-gray-400 hover:text-white'}`}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          )}
          {!user && !loading && (
             <div className="flex items-center gap-2 px-2">
                <Link href="/login" className="text-sm text-gray-400 font-medium">Sign In</Link>
                <Link href="/signup" className="text-sm text-cyan-400 font-bold">Sign Up</Link>
             </div>
          )}
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-16 bg-[#0a0f1e]/95 backdrop-blur-2xl z-[100] overflow-y-auto px-6 py-6 custom-scrollbar"
          >
            <div className="space-y-8 pb-10">
              {/* Quick Navigation Section */}
              <section>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-2">Core Tools</p>
                <div className="grid grid-cols-2 gap-3">
                  <MobileMenuCard href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Home" onClick={() => setIsMobileMenuOpen(false)} active={pathname === '/dashboard'} color="cyan" />
                  <MobileMenuCard href="/predict" icon={<PlusCircle className="w-5 h-5" />} label="Analyze" onClick={() => setIsMobileMenuOpen(false)} active={pathname === '/predict'} color="cyan" />
                  <MobileMenuCard href="/history" icon={<History className="w-5 h-5" />} label="History" onClick={() => setIsMobileMenuOpen(false)} active={pathname === '/history'} color="cyan" />
                  <MobileMenuCard href="/emergency/nearby" icon={<MapPin className="w-5 h-5" />} label="Emergency" onClick={() => setIsMobileMenuOpen(false)} active={pathname === '/emergency/nearby'} color="red" />
                </div>
              </section>

              {/* Health Tools Section - Consolidating everything as requested */}
              <section>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/80 mb-4 px-2">Health Tools</p>
                <div className="space-y-2">
                  <MobileMenuListLink href="/chat" icon={<MessageSquare className="w-5 h-5" />} label="AI MedGuide" onClick={() => setIsMobileMenuOpen(false)} active={pathname === '/chat'} />
                  <MobileMenuListLink href="/report-analyzer" icon={<FileText className="w-5 h-5" />} label="Report Analyzer" onClick={() => setIsMobileMenuOpen(false)} active={pathname === '/report-analyzer'} />
                  <MobileMenuListLink href="/medications" icon={<Pill className="w-5 h-5" />} label="Medications" onClick={() => setIsMobileMenuOpen(false)} active={pathname === '/medications'} />
                  <MobileMenuListLink href="/vitals" icon={<Activity className="w-5 h-5" />} label="Vitals Tracking" onClick={() => setIsMobileMenuOpen(false)} active={pathname === '/vitals'} />
                  <MobileMenuListLink href="/family" icon={<Users className="w-5 h-5" />} label="Family Circle" onClick={() => setIsMobileMenuOpen(false)} active={pathname === '/family'} />
                  <MobileMenuListLink href="/wellness-plan" icon={<Sparkles className="w-5 h-5" />} label="Wellness Plan" onClick={() => setIsMobileMenuOpen(false)} active={pathname === '/wellness-plan'} />
                </div>
              </section>

              {/* Emergency Section */}
              <section>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/80 mb-4 px-2">Safety Circle</p>
                <div className="space-y-2">
                  <MobileMenuListLink href="/emergency/id" icon={<QrCode className="w-5 h-5 text-red-400" />} label="Medical ID" onClick={() => setIsMobileMenuOpen(false)} active={pathname === '/emergency/id'} />
                  <MobileMenuListLink href="/emergency/first-aid" icon={<Siren className="w-5 h-5 text-red-400" />} label="First Aid" onClick={() => setIsMobileMenuOpen(false)} active={pathname === '/emergency/first-aid'} />
                </div>
              </section>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-white/5 flex gap-4">
                <Link 
                  href="/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl glass border border-white/5 text-sm font-bold active:scale-95 transition-all"
                >
                  <User className="w-4 h-4 text-cyan-400" /> Profile
                </Link>
                <button 
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/10 text-red-400 text-sm font-bold active:scale-95 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 font-medium overflow-hidden ${
        active 
          ? 'bg-white/[0.04] text-cyan-400 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)]' 
          : 'text-gray-400 hover:bg-white/[0.03] hover:text-white border border-transparent'
      }`}
    >
      {/* Background Glow Layer for Active Item */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-50 blur-xl"></div>
      )}

      {/* Active Indicator Bar - More Fluid */}
      {active && (
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[2px_0_15px_rgba(6,182,212,0.8)] z-10 animate-pulse"></div>
      )}
      
      <div className={`relative z-10 transition-all duration-500 shrink-0 ${active ? 'scale-110 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]' : 'group-hover:scale-110 group-hover:text-white'}`}>
        {icon}
      </div>
      
      <span className={`relative z-10 tracking-wide text-sm transition-all duration-500 whitespace-nowrap ${active ? 'font-black text-white' : 'group-hover:translate-x-0.5'}`}>
        {label}
      </span>

      {/* Modern floating dot with ring for active item */}
      {active && (
        <div className="ml-auto relative flex items-center justify-center">
           <div className="absolute w-4 h-4 rounded-full border border-cyan-400/30 animate-ping"></div>
           <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,1)]"></div>
        </div>
      )}
    </Link>
  );
}

function MobileBottomLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${active ? 'text-cyan-400' : 'text-gray-500 active:scale-95'}`}
    >
      <div className={`relative mb-1 transition-all duration-300 ${active ? 'scale-110 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]' : ''}`}>
         {icon}
         {active && (
           <div className="absolute -top-1.5 -right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)]"></div>
         )}
      </div>
      <span className={`text-[10px] transition-all duration-300 ${active ? 'font-bold tracking-tight' : 'font-medium'}`}>{label}</span>
      {active && <div className="mt-1 w-4 h-0.5 rounded-t-full bg-cyan-400"></div>}
    </Link>
  );
}

function MobileMenuCard({ href, icon, label, onClick, active, color }: { href: string, icon: React.ReactNode, label: string, onClick: () => void, active: boolean, color: 'cyan' | 'red' }) {
  const colorClasses = color === 'cyan' ? 'text-cyan-400 bg-cyan-500/5 border-cyan-500/20' : 'text-red-400 bg-red-500/5 border-red-500/20';
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 ${active ? colorClasses : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
    >
      <div className="mb-2">{icon}</div>
      <span className="text-xs font-bold">{label}</span>
    </Link>
  );
}

function MobileMenuListLink({ href, icon, label, onClick, active }: { href: string, icon: React.ReactNode, label: string, onClick: () => void, active: boolean }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-2xl glass border transition-all active:scale-95 ${active ? 'text-cyan-400 border-cyan-500/30' : 'border-white/5 text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
      <div className={`p-2 rounded-xl ${active ? 'bg-cyan-500/10' : 'bg-white/5'}`}>{icon}</div>
      <span className="text-sm font-bold flex-1">{label}</span>
      <ChevronRight className="w-4 h-4 opacity-30" />
    </Link>
  );
}
