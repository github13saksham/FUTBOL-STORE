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
  // This provides a professional splash screen effect.
  if (!mounted || loading) {
    return (
      <LazyMotion features={domMax}>
        <div className="min-h-screen bg-white flex items-center justify-center z-50 fixed inset-0">
          <m.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: [1, 0.3, 1], scale: [1, 0.95, 1] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-20 h-20 md:w-28 md:h-28"
          >
            <Image
              src="/logo.png"
              alt="Loading..."
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </m.div>
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
