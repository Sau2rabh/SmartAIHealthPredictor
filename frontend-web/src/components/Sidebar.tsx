"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Activity, User, LogOut, History, PlusCircle, LayoutDashboard, MapPin } from "lucide-react";

export default function Sidebar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass border-r border-white/5 z-50">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <Image 
               src="/icon-512.png" 
               alt="HealthAI Logo" 
               width={36} 
               height={36} 
               className="rounded-xl group-hover:scale-105 transition-transform"
            />
            <span className="font-bold text-2xl tracking-tight">
              Health<span className="text-cyan-400">AI</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
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
              <SidebarLink href="/care" icon={<MapPin className="w-5 h-5" />} label="Nearby Care" active={pathname === '/care'} />
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
          <div className="p-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center justify-between gap-3 p-2 rounded-xl">
              <Link href="/profile" className="flex items-center gap-3 group flex-1 overflow-hidden">
                <div className="w-10 h-10 rounded-full glass flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 transition-colors overflow-hidden border border-white/5">
                  {user.avatar ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                     <User className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-bold text-gray-200 truncate">{user.name}</span>
                  <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest truncate">View Profile</span>
                </div>
              </Link>
              <button
                onClick={logout}
                className="p-2.5 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 glass z-50 border-b border-white/5 flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image 
               src="/icon-512.png" 
               alt="HealthAI Logo" 
               width={28} 
               height={28} 
               className="rounded-lg"
            />
            <span className="font-bold text-lg tracking-tight">
              Health<span className="text-cyan-400">AI</span>
            </span>
          </Link>
          {user && (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="w-8 h-8 rounded-full glass flex items-center justify-center overflow-hidden border border-white/5">
                 {user.avatar ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                 ) : (
                     <User className="w-4 h-4 text-cyan-400" />
                 )}
              </Link>
            </div>
          )}
          {!user && !loading && (
             <Link href="/login" className="text-sm text-cyan-400 font-bold px-2">Log In</Link>
          )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-[68px] glass z-50 border-t border-white/5 flex items-center justify-around px-2 pb-1">
         {loading ? null : user ? (
            <>
              <MobileBottomLink href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Home" active={pathname === '/dashboard'} />
              <MobileBottomLink href="/predict" icon={<PlusCircle className="w-5 h-5" />} label="Analyze" active={pathname === '/predict'} />
              <MobileBottomLink href="/care" icon={<MapPin className="w-5 h-5" />} label="Care" active={pathname === '/care'} />
              <MobileBottomLink href="/history" icon={<History className="w-5 h-5" />} label="History" active={pathname === '/history'} />
              <button
                onClick={logout}
                className="flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-red-400"
              >
                <LogOut className="w-5 h-5 mb-1 mt-1" />
                <span className="text-[10px] font-medium">Logout</span>
              </button>
            </>
         ) : (
            <div className="flex w-full items-center justify-center gap-4 px-4 h-full">
               <Link href="/signup" className="btn-primary flex-1 py-2.5 text-center text-sm">Create Account</Link>
               <span className="text-xs text-gray-500">or</span>
               <Link href="/login" className="text-gray-300 text-sm font-medium flex-1 text-center py-2.5 glass rounded-lg">Sign In</Link>
            </div>
         )}
      </div>
    </>
  );
}

function SidebarLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
    >
      {icon}
      <span>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>}
    </Link>
  );
}

function MobileBottomLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${active ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
    >
      <div className={`mb-1 mt-1 ${active ? 'scale-110 transition-transform shadow-cyan-500/20 drop-shadow-lg' : ''}`}>
         {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
