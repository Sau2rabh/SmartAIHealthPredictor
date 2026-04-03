"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, History, User } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Analyze", icon: PlusCircle, href: "/predict" },
    { label: "History", icon: History, href: "/history" },
    { label: "Profile", icon: User, href: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 px-4 pb-6 pt-3 sm:hidden border-t border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-200",
                isActive ? "text-cyan-400 scale-110" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-colors",
                isActive && "bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
