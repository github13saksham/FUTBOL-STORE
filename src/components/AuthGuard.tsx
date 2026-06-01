"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = [
  "/", 
  "/login", 
  "/about-us"
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      // Allow admin routes (they have their own middleware protection)
      if (pathname.startsWith("/admin")) {
        return;
      }

      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      
      // If user is not logged in and trying to access a protected route
      if (!user && !isPublicRoute) {
        router.push("/login");
      }
    }
  }, [user, loading, pathname, router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  if (!user && !isPublicRoute && !pathname.startsWith("/admin")) {
    // Prevent flash of protected content during redirect
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return <>{children}</>;
}
