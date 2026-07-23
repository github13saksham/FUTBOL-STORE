"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { LazyMotion, domMax, m } from "framer-motion";

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
      <LazyMotion features={domMax}>
        <div className="min-h-screen bg-white flex items-center justify-center">
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

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  if (!user && !isPublicRoute && !pathname.startsWith("/admin")) {
    // Prevent flash of protected content during redirect
    return (
      <LazyMotion features={domMax}>
        <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
          <m.div
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-25 h-25 md:w-28 md:h-28"
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

  return <>{children}</>;
}
