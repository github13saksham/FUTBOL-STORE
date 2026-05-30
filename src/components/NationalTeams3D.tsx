"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck, Trophy, Layers, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";

interface TeamCard {
  id: number;
  name: string;
  sub: string;
  price: string;
  color: string;
  badgeColor: string;
  accent: string;
  jerseyColor: string;
  stripes?: string;
  logo?: string;
  desc: string;
  link: string;
  stats: { title: string; val: string }[];
}

const teams: TeamCard[] = [
  {
    id: 1,
    name: "ARGENTINA",
    sub: "Rinascimento Edition",
    price: "₹999.00",
    link: "/product/bs-1",
    color: "from-[#0F1C3F] to-[#1E3066]",
    badgeColor: "bg-[#D2BBA0]",
    accent: "#D2BBA0",
    jerseyColor: "#0A142F",
    logo: "/NATIONAL_TEAM_LOGO/national_team1.jpeg",
    stripes: "linear-gradient(135deg, rgba(210,187,160,0.1) 0%, rgba(210,187,160,0) 70%)",
    desc: "A stunning celebration of Italian art and footballing pedigree, featuring complex Renaissance fabric engraving and fine gold stitchwork.",
    stats: [
      { title: "Fit", val: "Aero Tailored" },
      { title: "Fabric", val: "Knit Jaquard" },
      { title: "Crest", val: "Gold 3D TPU" }
    ]
  },
  {
    id: 2,
    name: "GERMANY",
    sub: "Ouro Eterno Edition",
    price: "₹949.00",
    link: "/product/bs-3",
    color: "from-[#E6B022] to-[#fd0d00ff]",
    badgeColor: "bg-[#0A5F38]",
    accent: "#0A5F38",
    jerseyColor: "#000000ff",
    logo: "/NATIONAL_TEAM_LOGO/national_team2.jpeg",
    stripes: "repeating-linear-gradient(90deg, rgba(10,95,56,0.03) 0px, rgba(10,95,56,0.03) 10px, transparent 10px, transparent 20px)",
    desc: "Capturing the golden essence of Jogo Bonito. Tailored with a luxury mock collar, hand-stitched detailing, and royal green cuff-ribbing.",
    stats: [
      { title: "Fit", val: "Slim Fit" },
      { title: "Fabric", val: "Breathe Knit" },
      { title: "Crest", val: "Premium Felt" }
    ]
  },
  {
    id: 3,
    name: "BRAZIL",
    sub: "Bleu Impérial Edition",
    price: "₹949.00",
    link: "/product/bs-5",
    color: "from-[#DDB014] to-[#0A5F38]",
    badgeColor: "bg-[#D2BBA0]",
    accent: "#0A5F38",
    jerseyColor: "#DDB014",
    logo: "/NATIONAL_TEAM_LOGO/national_team3.jpeg",
    stripes: "linear-gradient(to right, transparent, rgba(255,238,226,0.05), transparent)",
    desc: "Minimalist French haute-couture meets the pitch. Finished with a subtle tricolour button placket and metallic gold cockerel embroidery.",
    stats: [
      { title: "Fit", val: "Atelier Custom" },
      { title: "Fabric", val: "Fine Piqué" },
      { title: "Crest", val: "18ct Gold Thread" }
    ]
  },
  {
    id: 4,
    name: "SPAIN",
    sub: "La Roja Edition",
    price: "₹949.00",
    link: "/product/bs-2",
    color: "from-[#8B0000] to-[#E2001A]",
    badgeColor: "bg-[#F1BF00]",
    accent: "#F1BF00",
    jerseyColor: "#E2001A",
    logo: "/NATIONAL_TEAM_LOGO/national_team5.png",
    stripes: "linear-gradient(135deg, rgba(241,191,0,0.1) 0%, transparent 70%)",
    desc: "A passionate tribute to Spanish football heritage. Woven with intense crimson threads and adorned with gold crest detailing.",
    stats: [
      { title: "Fit", val: "Slim Fit" },
      { title: "Fabric", val: "Breathe Knit" },
      { title: "Crest", val: "Gold 3D TPU" }
    ]
  }
];

export default function NationalTeams3D() {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(1); // Middle default
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { products } = useStore();
  
  // Custom drag physics using Framer Motion
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 25 });
  
  // Calculate carousel angle based on drag x offset
  const angleStep = 360 / teams.length;
  const rotationY = useTransform(springX, (value) => value * 0.4);

  useEffect(() => {
    setMounted(true);
    // Align starting rotation to center
    x.set(0);
  }, [x]);

  const rotateTo = (index: number) => {
    // Determine the shortest path to rotate
    const currentAngle = x.get() * 0.4;
    const targetAngle = (1 - index) * angleStep;
    
    // Find absolute difference
    const diff = targetAngle - (currentAngle % 360);
    // Adjust diff to be within -180 to 180 degrees
    let adjustedDiff = diff;
    if (adjustedDiff > 180) adjustedDiff -= 360;
    if (adjustedDiff < -180) adjustedDiff += 360;
    
    const newAngle = currentAngle + adjustedDiff;
    x.set(newAngle / 0.4);
    setActiveIndex(index);
  };

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % teams.length;
    rotateTo(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + teams.length) % teams.length;
    rotateTo(prevIndex);
  };

  // Drag handlers
  const handleDragEnd = (e: any, info: any) => {
    // If it was just a tap (minimal drag distance), don't snap/rotate
    if (Math.abs(info.offset.x) < 5) return;

    // Snap to the closest step
    const currentAngle = x.get() * 0.4;
    const rawIndex = 1 - (currentAngle / angleStep);
    let snappedIndex = Math.round(rawIndex);
    // Wrap index safely
    snappedIndex = ((snappedIndex % teams.length) + teams.length) % teams.length;
    
    rotateTo(snappedIndex);
  };

  if (!mounted) return null;

  return (
    <div className="relative w-full max-w-7xl mx-auto py-16 px-4 overflow-hidden">
      {/* Background glow beams */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 light-beam opacity-50 z-0" />
      
      <div className="relative text-center mb-4 md:mb-10 z-10">
        <span className="text-xs uppercase tracking-[0.25em] text-black font-medium">Global Teams</span>
        <h2 className="text-4xl md:text-6xl font-serif text-black mt-2">
          Find Your National Team
        </h2>
        <p className="max-w-xl mx-auto text-sm text-black/70 mt-4 leading-relaxed font-sans font-light hidden md:block">
          An immersive journey through the world's most elegant colors. Experience custom tailoring and historical pride in perfect 3D fidelity.
        </p>
      </div>

      {/* 3D Carousel container */}
      <div className="relative w-full h-[400px] md:h-[450px] flex items-center justify-center z-10">
        
        {/* Left/Right Buttons */}
        <button 
          onClick={handlePrev}
          className="absolute left-4 md:left-12 p-4 rounded-full border border-luxury-taupe/20 bg-luxury-ivory/60 hover:bg-luxury-taupe hover:text-luxury-ivory backdrop-blur-md transition-all duration-300 z-30"
          aria-label="Previous Team"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button 
          onClick={handleNext}
          className="absolute right-4 md:right-12 p-4 rounded-full border border-luxury-taupe/20 bg-luxury-ivory/60 hover:bg-luxury-taupe hover:text-luxury-ivory backdrop-blur-md transition-all duration-300 z-30"
          aria-label="Next Team"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Outer Perspective Wrapper */}
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
        >
          {/* Inner Cylinder */}
          <motion.div
            ref={carouselRef}
            onPan={(e, info) => {
              x.set(x.get() + info.delta.x);
            }}
            onPanEnd={handleDragEnd}
            style={{ 
              width: "220px", 
              height: "220px", 
              transformStyle: "preserve-3d",
              rotateY: rotationY,
            }}
            className="relative cursor-grab active:cursor-grabbing flex items-center justify-center touch-none"
          >
            {teams.map((team, index) => {
              // Point to the catalog page pre-filtered for this national team
              const resolvedLink = `/national-teams?team=${team.name}`;

              // Calculate static Y rotation for this item in the cylinder
              const itemAngle = index * angleStep;
              // Radius of the circle (determines spacing/depth of the 3D ring)
              const radius = 260; // pixels

              return (
                <div
                  key={team.id}
                  className="absolute w-[200px] h-[300px]"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                    backfaceVisibility: "visible",
                  }}
                >
                  <motion.div
                    onClick={() => {
                      if (activeIndex !== index) {
                        rotateTo(index);
                      } else {
                        router.push(resolvedLink);
                      }
                    }}
                    className={`relative w-full h-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl transition-shadow duration-500 bg-gradient-to-b ${team.color} border border-white/20 cursor-pointer`}
                    whileHover={{ y: -8 }}
                  >
                    {/* Subtle jersey stripes / textures rendered with pure CSS */}
                  <div 
                    className="absolute inset-0 opacity-15 pointer-events-none" 
                    style={{ background: team.stripes || "none" }}
                  />

                  {/* Shading/Depth mask based on whether it is active */}
                  <div 
                    className={`absolute inset-0 bg-luxury-dark/40 transition-opacity duration-500 pointer-events-none ${
                      activeIndex === index ? "opacity-0" : "opacity-40"
                    }`}
                  />
                  
                  {/* Glowing Spotlight Effect */}
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-luxury-cream/10 rounded-full blur-3xl" />

                  {/* Content inside 3D Card */}
                  <div className="flex justify-between items-start z-10">
                    <div>
                      
                      <h3 className="text-xl mr-3 font-serif text-luxury-ivory mt-1 tracking-wide">{team.name}</h3>
                    </div>
                    {/* Glowing National Shield Graphic */}
                    
                  </div>

                  {/* Interactive floating logo in 3D card */}
                  <div className="relative w-full h-28 flex items-center justify-center z-10 mt-4 group">
                    {/* Shadow overlay */}
                    <div className="absolute bottom-0 w-24 h-3 bg-luxury-dark/30 rounded-full blur-md group-hover:scale-110 transition-transform duration-500" />
                    
                    <Link href={resolvedLink} className="z-20 cursor-pointer" onClick={(e) => {
                      e.stopPropagation();
                    }}>
                      <motion.div 
                        className="relative w-20 h-20 rounded-full overflow-hidden shadow-2xl border-2 border-luxury-ivory/20"
                        animate={{ 
                          y: activeIndex === index ? [0, -10, 0] : 0 
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 4, 
                          ease: "easeInOut" 
                        }}
                      >
                        <Image 
                          src={team.logo!} 
                          alt={`${team.name} Logo`} 
                          fill 
                          style={{ objectFit: 'cover' }} 
                          className="pointer-events-none"
                        />
                      </motion.div>
                    </Link>
                  </div>

                  {/* Card bottom details */}
                  <div className="flex justify-center items-end mt-4 z-10">
                  </div>
                  
                  {/* Floating Action Button */}
                  <div className="absolute -bottom-16 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 group-hover:bottom-0 transition-all duration-300 z-30 flex justify-center">
                    <Link href={resolvedLink} className="flex items-center gap-2 bg-white text-luxury-dark px-6 py-2 rounded-full text-xs font-bold shadow-xl hover:scale-105 transition-transform" onClick={(e) => e.stopPropagation()}>
                      View Edition <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

    </div>
  );
}
