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
    // Disable Lenis on touch devices / mobile to prevent Android GPU tearing issues
    // JS-based smooth scrolling often causes severe rendering artifacts on Android WebViews and Chrome
    const isTouchDevice = 
      (typeof window !== "undefined" && "ontouchstart" in window) || 
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
      (typeof window !== "undefined" && window.innerWidth <= 768);

    if (isTouchDevice) {
      return;
    }

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

