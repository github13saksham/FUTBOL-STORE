"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useStore } from "@/context/StoreContext";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const {
    activePolicy,
    cartOpen,
    wishlistOpen,
    searchOpen,
    sizeGuideOpen,
    quickAddProduct,
  } = useStore();

  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Control Lenis scrolling based on active modal or drawer states
  useEffect(() => {
    const isAnyModalOpen = !!(
      activePolicy ||
      cartOpen ||
      wishlistOpen ||
      searchOpen ||
      sizeGuideOpen ||
      quickAddProduct
    );

    if (lenisRef.current) {
      if (isAnyModalOpen) {
        lenisRef.current.stop();
        document.body.style.overflow = "hidden";
      } else {
        lenisRef.current.start();
        document.body.style.overflow = "";
      }
    }
  }, [
    activePolicy,
    cartOpen,
    wishlistOpen,
    searchOpen,
    sizeGuideOpen,
    quickAddProduct,
  ]);

  return <>{children}</>;
}

