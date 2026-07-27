"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheck, Trophy, Printer, Shirt, Truck, HeartHandshake, ArrowRight 
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AboutUsPage() {
  const router = useRouter();
  const focuses = [
    {
      icon: ShieldCheck,
      title: "Premium Quality Football Jerseys",
      desc: "We employ double-pitted premium knit mesh patterns and authentic luxury drapes inside Milanese fashion houses. Each jersey is structured to feel like an artisanal piece."
    },
    {
      icon: Trophy,
      title: "Latest Club & National Team Collections",
      desc: "From limited-time arrivals to the latest 2026 collections and retro historical alignments, we hold the absolute vault of historic Footballing campaigns."
    },
    {
      icon: Shirt,
      title: "Player Version & Fan Version Kits",
      desc: "Choose between Player Versions featuring aerodynamic athletic piqué cuts with heat-pressed emblems, or Fan Versions designed for loose drapes, regular comfort and lifestyle styling."
    },
    {
      icon: Printer,
      title: "Custom Name & Number Printing",
      desc: "Coordinate with our bespoke registry to print custom numbers and names using authorized team fonts, metallic details, and vintage-accurate heat locks."
    },
    {
      icon: Truck,
      title: "Pan India Secure Shipping",
      desc: "Delivering digital fashion statements safely across all union territories, cities, and regional pincodes in India within 5-10 business days."
    },
    {
      icon: HeartHandshake,
      title: "Reliable Customer Support",
      desc: "Our active support team coordinates through Instagram DM, WhatsApp concierge, or direct mail lines to resolve custom requests, sizing queries, and delivery status."
    }
  ];

  return (
    <div className="min-h-screen text-luxury-dark bg-[#FFEEE2] selection:bg-luxury-taupe selection:text-luxury-ivory">
      
      {/* 1. Immersive Editorial Header */}
      <section className="relative w-full pt-60 pb-3  md:pb-24 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        {/* Glow beams */}
        <div className="absolute right-[5%] top-[10%] w-[350px] h-[350px] bg-luxury-taupe/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute left-[5%] bottom-[10%] w-[300px] h-[300px] bg-luxury-sage/10 rounded-full blur-[70px] pointer-events-none" />

        <div className="text-center max-w-4xl mx-auto space-y-8 relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-sans md:text-[43px] uppercase tracking-widest md:tracking-[0.35em] text-black font-bold block"
          >
            OUR JOURNEY
          </motion.span>
          
          

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-base md:text-xl text-luxury-dark/80 leading-relaxed font-sans font-light max-w-4xl mx-auto text-justify"
          >
         
          </motion.p>
        </div>
      </section>

      {/* 2. Visual Storytelling / Parallax Splitting */}
      <section className="mt-[-2rem] md:mt-[-8rem] py-12 md:py-20 px-6 md:px-12 max-w-7xl mx-auto bg-transparent">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 md:gap-16 items-center">
          
          {/* Left Column: Asymmetrical Typography & Manifest */}
          <div className="lg:col-span-6  space-y-6">
            
            
            <p className="text-sm md:text-base leading-relaxed text-luxury-charcoal/80 mb-6 font-sans">
              Founded in September 2024 by Krish, THE FÚTBOL STORE started with a simple passion for Football and the dream of creating a place where fans could proudly wear the colors of the teams they love. For us, Football is more than just a game — it’s emotion, memories, loyalty, and unforgettable moments that connect millions of fans around the world.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-luxury-charcoal/80 font-sans">
              From iconic club kits to the latest international collections, we aim to provide premium-quality Football jerseys that help supporters feel closer to the game they live for. Whether you support or your national team, every jersey represents passion and identity. From iconic home kits to the latest 2026 collections, our goal is to deliver high-quality jerseys that let fans represent their favorite teams with pride and style. Whether you support iconic clubs, rising giants, your favorite players, or your national team, we aim to make every jersey feel special for every Football lover.
            </p>
            <div className="pt-4">
              <button 
                onClick={() => router.push('/clubs')}
                className="group flex items-center gap-3 px-8 py-3.5 bg-luxury-dark text-luxury-ivory hover:bg-luxury-taupe hover:text-luxury-dark rounded-full text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-md"
              >
                Acquire Your Jersey
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Right Column: Immersive Picture Block */}
          <div className="lg:col-span-6 relative w-full h-[300px] md:h-[480px] rounded-3xl overflow-hidden border border-luxury-taupe/15 bg-transparent md:bg-neutral-900 shadow-none md:shadow-2xl">
            <Image 
              src="/store-logo.jpeg" 
              alt="The Futbol Store Logo"
              fill
              className="object-cover object-center opacity-90 transform hover:scale-105 transition-transform duration-[2000ms] pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/70 via-transparent to-transparent pointer-events-none hidden md:block" />
                     
            </div>

        </div>
      </section>

      {/* 3. Core Focus Grid */}
      <section className="py-16 md:py-24 bg-luxury-dark text-luxury-ivory relative overflow-hidden">
        {/* Glow overlays */}
        <div className="absolute right-[-10%] top-[20%] w-[500px] h-[500px] bg-[#3B1F0F]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute left-[-5%] bottom-[-5%] w-[400px] h-[400px] bg-luxury-taupe/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-2xl mb-12 md:mb-16 space-y-4">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-luxury-sand font-bold">Brand Highlights</span>
            <h2 className="text-3xl md:text-6xl font-serif text-white tracking-wide font-light">
              Our Core <span className="italic font-medium text-luxury-sand">Focuses</span>
            </h2>
            <p className="text-[10px] md:text-sm text-luxury-ivory/60 font-sans leading-relaxed font-light">
              At THE FÚTBOL STORE, we focus on every micro-detail of Football fashion, ensuring that your apparel matches the historical intensity of your loyalty.
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {focuses.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.4 }}
                  className="p-4 md:p-8 rounded-2xl border border-luxury-sand/10 bg-[#141414] hover:bg-[#1a1a1a] space-y-3 md:space-y-5 transition-colors duration-300 flex flex-col items-start"
                >
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-luxury-sand/10 flex items-center justify-center text-luxury-sand shrink-0">
                    <Icon className="w-4 h-4 md:w-6 md:h-6 stroke-[1.5px]" />
                  </div>
                  <h3 className="text-sm md:text-lg font-serif font-bold text-white tracking-wide">{item.title}</h3>
                  <p className="text-[9px] md:text-xs text-luxury-ivory/60 leading-relaxed font-sans font-light">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. The Manifesto Banner */}
      <section className="py-16 md:py-32 px-6 md:px-12 bg-[#FFEEE2] relative overflow-hidden border-b border-luxury-taupe/15">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <span className="text-xs uppercase tracking-[0.3em] text-luxury-taupe font-bold block">The Manifesto</span>
          
          <h2 className="text-2xl md:text-4xl font-serif font-light text-luxury-dark leading-snug">
            "Football is more than just a game — it’s <span className="italic font-medium text-luxury-taupe">emotion</span>, culture, loyalty, and <span className="italic font-medium text-luxury-taupe">passion</span>. Our mission is to help fans wear that passion every day."
          </h2>

          <div className="h-[1px] bg-luxury-taupe/20 w-32 mx-auto my-6" />

          <p className="text-xs uppercase tracking-[0.25em] text-luxury-taupe font-bold">
            Thank you for being part of THE FÚTBOL STORE family. 
          </p>
        </div>
      </section>

    </div>
  );
}
