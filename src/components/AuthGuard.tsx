"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { LazyMotion, domMax, m } from "framer-motion";

const PROTECTED_ROUTES = [
  "/account",
  "/checkout"
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  useEffect(() => {
    if (!loading && mounted) {
      if (!user && isProtectedRoute) {
        router.push("/login");
      }
    }
  }, [user, loading, pathname, router, mounted, isProtectedRoute]);

  // Show the logo loading screen globally while the app is mounting or auth is loading
  // This provides a professional splash screen effect with upscale branding and sparkling line indicator.
  if (!mounted || loading) {
    return (
      <LazyMotion features={domMax}>
        <div className="min-h-screen bg-white flex flex-col items-center justify-center z-50 fixed inset-0 px-6">
          <m.div
            initial={{ opacity: 0.9, scale: 0.97 }}
            animate={{ 
              opacity: [0.9, 1, 0.9],
              scale: [0.97, 1.02, 0.97],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-56 h-36 sm:w-72 sm:h-44 md:w-80 md:h-48 drop-shadow-sm flex items-center justify-center"
          >
            <Image
              src="/logo.png"
              alt="The Futbol Store"
              fill
              style={{ objectFit: 'contain' }}
              priority
              quality={100}
            />
          </m.div>

          {/* Diwali Cracker Burning Fuse Indicator */}
          <div className="mt-8 flex flex-col items-center gap-3 w-64 sm:w-80">
            <div className="w-full cracker-fuse-track">
              <div className="cracker-fuse-burning">
                <span className="cracker-spark-flame" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-600 font-bold">
                Igniting Store
              </span>
              <span className="text-xs">💥</span>
            </div>
          </div>
        </div>
      </LazyMotion>
    );
  }

  // Prevent flash of protected content during redirect
  if (!user && isProtectedRoute) {
    return null;
  }

  return <>{children}</>;
}
