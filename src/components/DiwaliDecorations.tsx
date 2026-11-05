"use client";

import React from "react";
import { motion } from "framer-motion";

interface DecorativeProps {
  variant?: "floating" | "banner" | "corner";
  className?: string;
}

/**
 * Animated Diya with realistic flicker flame and golden glow
 */
export function AnimatedDiya({ size = 38, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Animated Glow Aura */}
      <div 
        className="absolute rounded-full pointer-events-none diwali-diya-glow animate-pulse"
        style={{
          width: size * 1.5,
          height: size * 1.5,
          top: -size * 0.35,
          background: "radial-gradient(circle, rgba(251, 191, 36, 0.45) 0%, rgba(245, 158, 11, 0.15) 50%, transparent 75%)",
          filter: "blur(6px)"
        }}
      />

      {/* SVG Diya */}
      <svg
        width={size}
        height={size * 0.85}
        viewBox="0 0 64 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Animated Flame */}
        <g className="diwali-flame-anim">
          {/* Outer Orange Flame */}
          <path
            d="M32 2 C37 12 43 17 40 25 C37 32 27 32 24 25 C21 17 27 12 32 2 Z"
            fill="url(#flameOuter)"
          />
          {/* Inner Golden Flame */}
          <path
            d="M32 7 C35 14 38 18 36 23 C34 27 30 27 28 23 C26 18 29 14 32 7 Z"
            fill="url(#flameInner)"
          />
          {/* Core White Hot Spark */}
          <ellipse cx="32" cy="20" rx="2" ry="4" fill="#ffffff" opacity="0.9" />
        </g>

        {/* Diya Clay Base (Earthen Lamp) */}
        <path
          d="M6 31 C10 48 54 48 58 31 C52 35 12 35 6 31 Z"
          fill="url(#diyaClay)"
          stroke="#92400e"
          strokeWidth="1.5"
        />

        {/* Traditional Ornamental Rim Patterns */}
        <path
          d="M10 32 C18 37 46 37 54 32"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeDasharray="2 3"
        />

        {/* Diya Base Stand */}
        <ellipse cx="32" cy="46" rx="14" ry="3.5" fill="#78350f" opacity="0.8" />

        <defs>
          <linearGradient id="flameOuter" x1="32" y1="2" x2="32" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fef08a" />
            <stop offset="0.3" stopColor="#f59e0b" />
            <stop offset="0.8" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="flameInner" x1="32" y1="7" x2="32" y2="25" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="0.5" stopColor="#fef08a" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="diyaClay" x1="6" y1="31" x2="58" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#b45309" />
            <stop offset="0.5" stopColor="#d97706" />
            <stop offset="1" stopColor="#78350f" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Hanging Traditional Diwali Lantern (Kandil / Akash Kandil)
 */
export function HangingLantern({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative inline-flex flex-col items-center select-none diwali-lantern-float ${className}`}>
      {/* Lantern Thread */}
      <div className="w-[1px] h-6 bg-gradient-to-b from-amber-600/30 to-amber-500" />
      
      {/* Lantern Diamond Core */}
      <div 
        className="relative rounded-sm shadow-md flex items-center justify-center border border-amber-300"
        style={{
          width: size,
          height: size,
          transform: "rotate(45deg)",
          background: "linear-gradient(135deg, #dc2626, #b45309, #d97706)",
          boxShadow: "0 0 12px rgba(245, 158, 11, 0.5)"
        }}
      >
        {/* Inner Diamond Glow */}
        <div 
          className="rounded-sm bg-amber-100"
          style={{ width: size * 0.45, height: size * 0.45 }}
        />
      </div>

      {/* Hanging Ribbons */}
      <div className="flex gap-1 mt-1 -translate-y-1">
        <div className="w-[1.5px] h-4 bg-gradient-to-b from-amber-400 to-transparent" />
        <div className="w-[1.5px] h-6 bg-gradient-to-b from-red-500 to-transparent" />
        <div className="w-[1.5px] h-4 bg-gradient-to-b from-amber-400 to-transparent" />
      </div>
    </div>
  );
}

/**
 * Festive Banner Strip with Diyas, Sparkles, and Marigold accents
 */
export function DiwaliFestiveRibbon({ 
  title = "Warning: Your cart might get a little too festive.", 
  subtitle = "Unmissable Diwali deals on your favourite jerseys." 
}: { 
  title?: string; 
  subtitle?: string; 
}) {
  return (
    <div className="w-full my-6 rounded-2xl overflow-hidden border border-amber-300 bg-gradient-to-r from-[#7f1d1d] via-[#b45309] to-[#7f1d1d] p-4 text-white shadow-lg relative">
      {/* Background festive sparkles */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 px-2 md:px-6">
        <div className="flex items-center gap-4">
          <AnimatedDiya size={42} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] md:text-xs font-black tracking-[0.15em] text-amber-200 uppercase">
                ✦ {title} ✦
              </span>
            </div>
            <p className="text-xs md:text-sm font-serif italic text-amber-100/90 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="diwali-badge-glow text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow border border-amber-300/40">
            LIMITED TIME FESTIVE PRICING
          </span>
          <AnimatedDiya size={42} className="hidden sm:inline-flex" />
        </div>
      </div>
    </div>
  );
}

/**
 * Floating Ambient Festive Sparkles for Dark Backgrounds
 * Non-intrusive, interactive, elegant warm gold and ruby sparkles
 */
export function FestiveDarkBackgroundDecor() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft warm festive radial corner auras */}
      <div 
        className="absolute -top-12 -left-12 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(220, 38, 38, 0.05) 45%, transparent 70%)",
          filter: "blur(50px)"
        }}
      />
      <div 
        className="absolute top-1/2 -right-12 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(217, 119, 6, 0.10) 0%, rgba(185, 28, 28, 0.04) 50%, transparent 70%)",
          filter: "blur(60px)"
        }}
      />

      {/* Scattered twinkling embers / sparkles */}
      {[
        { top: "12%", left: "8%", size: 4, delay: "0s", duration: "4s" },
        { top: "25%", left: "88%", size: 6, delay: "1.2s", duration: "5s" },
        { top: "45%", left: "15%", size: 3, delay: "2.4s", duration: "4.2s" },
        { top: "68%", left: "92%", size: 5, delay: "0.8s", duration: "4.8s" },
        { top: "82%", left: "28%", size: 4, delay: "1.8s", duration: "5.2s" },
        { top: "35%", left: "52%", size: 3, delay: "3s", duration: "4.5s" },
        { top: "90%", left: "75%", size: 5, delay: "2.1s", duration: "4s" },
      ].map((dot, i) => (
        <span
          key={i}
          className="diwali-twinkle-sparkle"
          style={{
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            animationDelay: dot.delay,
            animationDuration: dot.duration,
            boxShadow: `0 0 ${dot.size * 2}px #fbbf24`,
          }}
        />
      ))}
    </div>
  );
}
