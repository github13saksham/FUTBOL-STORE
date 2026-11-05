"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface FirecrackerProps {
  /** Optional delay before launch in milliseconds */
  delay?: number;
  /** Whether to repeat the bursts intermittently */
  loop?: boolean;
}

export default function DiwaliFirecrackers({ delay = 400, loop = true }: FirecrackerProps) {
  useEffect(() => {
    // Only run in client browser
    if (typeof window === "undefined") return;

    let timer: NodeJS.Timeout;
    let loopInterval: NodeJS.Timeout;

    const fireBurst = () => {
      // 1. Left cannon launch upward with festive Diwali colors (Gold, Saffron Orange, Ruby Red, Emerald Green)
      confetti({
        particleCount: 35,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.12 },
        colors: ["#ffd700", "#ff6b00", "#dc2626", "#16a34a", "#fffbeb"],
        shapes: ["circle", "star"],
        scalar: 0.85,
        ticks: 180,
        gravity: 0.8,
        disableForReducedMotion: true,
      });

      // 2. Right cannon launch upward
      confetti({
        particleCount: 35,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.12 },
        colors: ["#ffd700", "#ff6b00", "#f59e0b", "#b91c1c", "#fef08a"],
        shapes: ["circle", "star"],
        scalar: 0.85,
        ticks: 180,
        gravity: 0.8,
        disableForReducedMotion: true,
      });

      // 3. Center golden star sparkle shower
      setTimeout(() => {
        confetti({
          particleCount: 25,
          angle: 90,
          spread: 70,
          origin: { x: 0.5, y: 0.08 },
          colors: ["#fbbf24", "#fef08a", "#d97706"],
          shapes: ["star"],
          scalar: 0.9,
          ticks: 140,
          gravity: 0.7,
          disableForReducedMotion: true,
        });
      }, 250);
    };

    // Initial burst on load
    timer = setTimeout(fireBurst, delay);

    // Occasional gentle bursts every 18 seconds if user stays on page
    if (loop) {
      loopInterval = setInterval(fireBurst, 18000);
    }

    return () => {
      clearTimeout(timer);
      if (loopInterval) clearInterval(loopInterval);
    };
  }, [delay, loop]);

  return null;
}
