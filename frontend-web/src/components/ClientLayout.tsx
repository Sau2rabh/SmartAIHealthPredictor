"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import React from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const publicRoutes = ['/login', '/signup', '/', '/about', '/guide'];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return (
      <div className="flex min-h-screen flex-col relative z-10 w-full pb-0 pt-0">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative z-10 w-full">
      <Sidebar />
      <div className="flex-1 min-w-0 md:pl-64 pt-16 md:pt-0 pb-[68px] md:pb-0 flex flex-col">
        {children}
      </div>
    </div>
  );
}
