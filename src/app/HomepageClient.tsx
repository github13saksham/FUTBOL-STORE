"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Heart, ChevronRight, HelpCircle, Truck, RefreshCw, 
  Shield, Check, Instagram, Send, Mail, User, FileText, Loader2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import NationalTeams3D from "@/components/NationalTeams3D";
import { useStore } from "@/context/StoreContext";
import { FAQS } from "@/data/mockData";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/backend/firebase/config";

export default function HomepageClient({ initialSettings }: { initialSettings: any }) {
  const bestSellersRef = useRef<HTMLDivElement>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [hoveredClubId, setHoveredClubId] = useState<string | null>(null);
  
  const { 
    products,
    isLoadingData,
    setQuickAddProduct, 
    wishlist, 
    toggleWishlist, 
    setSizeGuideOpen 
  } = useStore();

  const [homepageSettings, setHomepageSettings] = useState<any>(initialSettings);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'homepage');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setHomepageSettings(docSnap.data());
      }
    }, (error) => {
      console.error("Error listening to homepage settings:", error);
    });
    
    return () => unsubscribe();
  }, []);

  const bestSellers = useMemo(() => {
    const items = homepageSettings?.bestSellersItems || [
      { id: "bs-1", name: "SPAIN 2026 AWAY PLAYER", category: "PLAYER VERSION", club: "SPAIN", priceStr: "₹949.00", image: "/NATIONAL_TEAM_LOGO/national_team5.png" },
      { id: "bs-2", name: "PORTUGAL 2026 AWAY FAN", category: "FAN VERSION", club: "PORTUGAL", priceStr: "₹799.00", image: "/NATIONAL_TEAM_LOGO/national_team4.jpeg" },
      { id: "bs-3", name: "REAL MADRID 25/26 HOME PLAYER", category: "PLAYER VERSION", club: "REAL MADRID CF", priceStr: "₹999.00", image: "/images/25-26_club-jerseys/real_madrid25-26_HPV.jpeg" },
      { id: "bs-4", name: "ARGENTINA 2026 AWAY PLAYER", category: "PLAYER VERSION", club: "ARGENTINA", priceStr: "₹999.00", image: "/NATIONAL_TEAM_LOGO/national_team1.jpeg" },
      { id: "bs-5", name: "MANCHESTER CITY 25/26 AWAY PLAYER", category: "PLAYER VERSION", club: "MANCHESTER CITY", priceStr: "₹999.00", image: "/images/25-26_club-jerseys/MC25-26_HPV.jpeg" }
    ];

    return items.map((item: any) => {
      // Find a matching product in the real database
      const realProduct = products.find(p => 
        p.name.toUpperCase() === item.name.toUpperCase() || 
        p.name.toUpperCase().includes(item.name.toUpperCase()) ||
        item.name.toUpperCase().includes(p.name.toUpperCase())
      );
      
      return {
        ...item,
        realId: realProduct ? realProduct.id : item.id,
        realProduct: realProduct || null
      };
    });
  }, [homepageSettings, products]);

  return (
    <div className="min-h-screen selection:bg-luxury-taupe selection:text-white text-black bg-[#FFEEE2]">
      
      {/* Promo Banner */}
      {(homepageSettings?.banner?.enabled ?? true) && (
        <div className="w-full bg-black text-white overflow-hidden z-40 border-b border-white/10 mt-[100px] md:mt-[120px]">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 35s linear infinite;
            }
          `}</style>
          <div className="flex whitespace-nowrap py-2.5 md:py-3 w-full">
            <div className="animate-marquee flex w-max">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="flex items-center justify-center px-8 md:px-16 shrink-0 text-[10px] md:text-xs tracking-[0.2em] uppercase font-semibold">
                  <span className="text-luxury-taupe mr-3">✦</span>
                  {homepageSettings?.banner?.text || 'Get Flat ₹100 OFF on all orders above ₹999.'}
                  <span className="text-luxury-taupe ml-3">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Cinematic Hero Section */}
      <section className="relative w-full max-h-screen flex flex-col justify-center items-start overflow-hidden py-48 px-6 md:px-46 lg:px-44">
        
        {!homepageSettings ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <Loader2 className="w-12 h-12 animate-spin text-white/50" />
          </div>
        ) : (
          <>
            {/* Background Media */}
            {homepageSettings?.hero?.mediaType === 'video' ? (
              <>
                <video autoPlay loop muted playsInline className="hidden md:block absolute inset-0 w-full h-full object-cover object-top z-0">
                  <source src={homepageSettings.hero.desktopMediaUrl || "/images/Hero_Section_vid.MP4"} type="video/mp4" />
                </video>
                <video autoPlay loop muted playsInline className="block md:hidden absolute inset-0 w-full h-full object-cover object-top z-0">
                  <source src={homepageSettings.hero.mobileMediaUrl || homepageSettings.hero.desktopMediaUrl || "/images/Hero_Section_vid.MP4"} type="video/mp4" />
                </video>
              </>
            ) : (
              <>
                <div className="hidden md:block absolute inset-0 w-full h-full z-0">
                  <Image 
                    src={homepageSettings?.hero?.desktopMediaUrl || ""} 
                    alt="Hero Desktop" 
                    fill 
                    className="object-cover object-top"
                  />
                </div>
                <div className="block md:hidden absolute inset-0 w-full h-full z-0">
                  <Image 
                    src={homepageSettings?.hero?.mobileMediaUrl || homepageSettings?.hero?.desktopMediaUrl || ""} 
                    alt="Hero Mobile" 
                    fill 
                    className="object-cover object-top"
                  />
                </div>
              </>
            )}

            {/* Stadium lighting / Overlay opacity from settings */}
            <div 
              className="absolute inset-0 bg-black z-0 pointer-events-none" 
              style={{ opacity: (homepageSettings?.hero?.overlayOpacity ?? 40) / 100 }}
            />
            
            {/* Cinematic Background Spotlights */}
            <div className="absolute right-[10%] top-[15%] w-[500px] h-[500px] bg-luxury-taupe/15 rounded-full blur-[100px] z-0 animate-pulse-subtle" />
            <div className="absolute left-[-5%] bottom-[-5%] w-[400px] h-[400px] bg-luxury-sage/20 rounded-full blur-[80px] z-0" />

            {/* Hero content layout - Centered */}
            <div className="relative w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center z-10">
              
              {/* Text Block */}
              <div className="flex flex-col items-center mt-40 space-y-10">
                
                <motion.h1 
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
                  className="text-4xl sm:text-6xl md:text-8xl lg:text-[90px] font-serif text-white leading-[1.1] sm:leading-[0.9] italic tracking-tight font-light sm:whitespace-nowrap text-center px-4 drop-shadow-lg"
                >
                  "{homepageSettings?.hero?.title || 'Inspired By Greatness'}"
                </motion.h1>

                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  className="flex flex-row gap-3 sm:gap-4 w-full sm:w-auto pt-6 sm:pt-4 justify-center px-4 sm:px-0"
                >
                  <Link href={homepageSettings?.hero?.ctaLink || '/shop'} passHref>
                    <button 
                      className="group flex items-center justify-center gap-2 sm:gap-3 flex-1 sm:flex-none px-3 sm:px-12 py-3 sm:py-4 bg-luxury-dark text-white hover:bg-luxury-taupe hover:text-black rounded-full text-[9px] sm:text-[11px] uppercase tracking-widest font-semibold transition-all duration-300"
                    >
                      {homepageSettings?.hero?.ctaText || 'Shop Now'}
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </button>
                  </Link>
                  
                  <button 
                    onClick={() => {
                      const el = document.getElementById("clubs");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center justify-center flex-1 sm:flex-none px-3 sm:px-8 py-3 sm:py-4 border border-white text-white hover:bg-white hover:text-black rounded-full text-[9px] sm:text-[11px] uppercase tracking-widest font-semibold transition-all duration-300 backdrop-blur-sm"
                  >
                    Explore Clubs
                  </button>
                </motion.div>
              </div>

            </div>
          </>
        )}
      </section>

      {/* 2.5 Built for Football Culture Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto bg-transparent text-black">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Text */}
          <div className="space-y-6">
            <span className="text-[16px] md:text-[20px] uppercase tracking-[0.3em] font-semibold text-black flex items-center gap-3 pb-10 md:pb-20">
              <span className="w-8 h-[1px] bg-luxury-taupe"></span>
              LIMITED TIME ARRIVAL
            </span>
            
            <h2 className="text-5xl md:text-7xl font-serif text-black font-light leading-[1.05] tracking-tight">
              {homepageSettings?.hero?.subtitle?.split(' ').slice(0, 4).join(' ') || "The Road to Glory"} <br />
              <span className="italic font-medium text-black">{homepageSettings?.hero?.subtitle?.split(' ').slice(4).join(' ') || "Begins Now."}</span>
            </h2>
            
            <p className="text-lg text-black font-sans leading-relaxed max-w-md">
              Discover the FIFA World Cup 2026 Collection and wear the pride of your nation.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
              <button 
                onClick={() => {
                  window.location.href = "/national-teams";
                }}
                className="text-xs uppercase tracking-widest font-semibold text-black hover:text-black flex items-center gap-2 transition-colors duration-300"
              >
                Discover Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Card with Image */}
          <div className="relative flex justify-center md:justify-end">
            <div className="w-full max-w-[380px] bg-[#1a1c21] rounded-xl overflow-hidden h-[450px] md:h-[500px] relative shadow-2xl group flex flex-col justify-end">
              <Image 
                src="/NATIONAL_TEAM_LOGO/WORLDCUP_IMG.jpeg"
                alt="World Cup Trophy Scene"
                fill
                style={{ objectFit: "cover" }}
                className="opacity-80 group-hover:scale-105 transition-transform duration-[2000ms] ease-out pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              
              <div className="relative z-10 p-8">
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Split Premium Cards (Player Version vs Fan Version) */}
      <section className="py-12 bg-luxury-dark text-white relative overflow-hidden">
        {/* Dynamic Glowing Spotlights */}
        <div className="absolute right-[5%] top-[10%] w-[350px] h-[350px] bg-luxury-taupe/10 rounded-full blur-[80px]" />
        <div className="absolute left-[5%] bottom-[10%] w-[300px] h-[300px] bg-[#3B1F0F]/20 rounded-full blur-[70px]" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-white font-bold">The Breakdown</span>
            <h2 className="text-4xl md:text-6xl font-serif text-white tracking-wide font-light italic mt-3">
              Comparison
            </h2>
          </div>
          
          {/* VS Divider */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 items-center justify-center text-white font-serif italic text-3xl">
            VS
          </div>

          <div className="grid md:grid-cols-2 gap-12 relative">
            {/* Card 1: Player Version (Elite, Performance, Matchday) */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="group relative h-[480px] w-full max-w-[400px] rounded-3xl overflow-hidden border border-luxury-sand/15 bg-neutral-900/60 shadow-[0_0_40px_rgba(205,164,145,0.12)] hover:shadow-[0_0_50px_rgba(205,164,145,0.25)] transition-shadow duration-500 flex flex-col items-center justify-start mx-auto"
            >
              {/* Background Image overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />

              <div className="relative w-full h-[320px]">
                <Image 
                  src="/HEAT-PRESSED LOGOS.svg"
                  alt="Heat Pressed Logos"
                  fill
                  style={{ objectFit: "contain", objectPosition: "top" }}
                  className="opacity-90 transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                />
              </div>
              
              <div className="relative z-20 w-full flex flex-col items-center mt-auto px-6 pb-8">
                <h2 className="italic text-3xl md:text-4xl font-serif font-light text-white tracking-wide text-center  mt-[-8rem] mb-2">
                  Player <span className="italic font-normal text-white">Version</span>
                </h2>
                <p className="text-sm text-white font-light font-sans text-center">
                 
Built for elite performance, the Player Version Jersey features a slim athletic fit, lightweight breathable fabric, and heat-pressed details for an authentic on-pitch feel just like the jerseys worn by professionals.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Fan Version (Lifestyle, Streetwear) */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="group relative h-[480px] w-full max-w-[400px] rounded-3xl overflow-hidden border border-luxury-sand/15 bg-neutral-900/60 shadow-[0_0_40px_rgba(205,164,145,0.12)] hover:shadow-[0_0_50px_rgba(205,164,145,0.25)] transition-shadow duration-500 flex flex-col items-center justify-start mx-auto"
            >
              {/* Background Image overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />

              <div className="relative w-full h-[320px]">
                <Image 
                  src="/HEAT-PRESSED LOGOS (2).svg"
                  alt="Fan Lifestyle"
                  fill
                  style={{ objectFit: "contain", objectPosition: "top" }}
                  className="opacity-90 transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                />
              </div>
              
              <div className="relative z-20 w-full flex flex-col items-center mt-auto px-6 pb-8">
                <h2 className="italic text-3xl md:text-4xl font-serif font-light text-white tracking-wide text-center mt-[-8rem] mb-2">
                  Fan <span className="italic font-normal text-white">Version</span>
                </h2>
                <p className="text-sm text-white font-light font-sans text-center">
                Designed for everyday comfort, the Fan Version Jersey offers a relaxed fit with high-quality stitched details and breathable fabric perfect for matchdays and casual wear.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Best Sellers Section */}
      <section id="bestsellers" className="py-16 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
          
            <h2 className="text-4xl md:text-6xl font-serif text-black mt-2 font-light">
              Best <span className="italic font-medium text-black">Sellers</span>
            </h2>
          </div>
          <p className="max-w-m text-xs md:text-sm text-black font-light leading-relaxed font-sans">
           Discover the jerseys trusted and loved by football fans across India.
          </p>
        </div>

        {/* Horizontal Drag/Scroll Slider */}
        <motion.div 
          ref={bestSellersRef}
          className="relative w-full overflow-hidden pb-12 cursor-grab active:cursor-grabbing"
        >
          <motion.div 
            drag="x"
            dragConstraints={bestSellersRef}
            dragElastic={0.1}
            className="flex gap-8 w-max"
          >
            {bestSellers.map((product: any) => (
              <motion.div 
                key={product.id}
                whileHover={{ 
                  
                  
                  boxShadow: "0 35px 60px -15px rgba(0, 0, 0, 0.3)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ perspective: 1000, transformStyle: "preserve-3d" }}
                className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[350px] relative rounded-2xl border border-white/10 bg-luxury-dark hover:bg-black hover:z-20 flex flex-col justify-between transition-colors duration-500 overflow-hidden group/card"
              >
                {/* Image Container with zoom overlay */}
                <div 
                  className="relative w-full aspect-[35/32] md:aspect-auto md:h-[320px] bg-neutral-100 group"
                  style={{ transform: "translateZ(30px)" }}
                >
                  <Link href={`/product/${product.realId}`}>
                    <Image 
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain md:object-cover transition-transform duration-[1000ms] ease-out scale-105 "
                      priority
                    />
                    
                    {/* Overlay with subtle shadow */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </Link>

                  {/* Quick Add Button on Hover */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (product.realProduct) {
                        setQuickAddProduct(product.realProduct);
                      } else {
                        window.location.href = `/product/${product.realId}`;
                      }
                    }}
                    className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-luxury-dark text-white hover:bg-luxury-taupe hover:text-black text-[10px] tracking-widest uppercase font-semibold rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 backdrop-blur-md z-10"
                  >
                    Quick Add
                  </button>

                  {/* Wishlist Icon */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.realId);
                    }}
                    className="absolute top-3 right-3 md:top-4 md:right-4 p-2 md:p-2.5 bg-luxury-ivory/80 backdrop-blur-md rounded-full text-black hover:text-black transition-colors duration-300 shadow-sm z-10"
                    aria-label="Add to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${wishlist.includes(product.realId) ? "fill-luxury-taupe text-black" : ""}`} />
                  </button>
                </div>

                {/* Text specifications */}
                <div className="p-4 md:p-5 md:pt-4 space-y-2 flex-grow flex flex-col justify-between">
                  <div>
                    <Link href={`/product/${product.realId}`} className="block mt-2">
                      <h3 className="font-serif text-[13px] md:text-[15px] font-medium leading-tight text-white hover:text-luxury-taupe transition-colors md:whitespace-normal" style={{ transform: "translateZ(20px)" }}>
                        {product.realProduct?.name || product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex justify-between items-end pb-1 border-b border-white/20 pt-1 md:pt-0">
                    <span className="font-serif text-base md:text-lg text-white font-medium">
                      {product.realProduct?.priceStr || product.priceStr}
                    </span>
                    <Link
                      href={`/product/${product.realId}`}
                      className="flex text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-semibold text-white/80 hover:text-white items-center gap-1 transition-colors duration-300"
                    >
                      View Item <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* 5. Shop By Clubs Grid Section */}
      <section id="clubs" className="py-16 md:py-32 bg-luxury-dark text-white relative overflow-hidden">
        {/* Cinematic shadows & lighting */}
        <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-luxury-taupe/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute left-[10%] top-[10%] w-[400px] h-[400px] bg-luxury-sage/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-2xl mb-20 space-y-4">
    
            <h2 className="text-5xl md:text-7xl font-serif text-white tracking-wide">
              Shop By <span className="italic font-light text-white">Clubs</span>
            </h2>
            <p className="text-sm text-white font-sans leading-relaxed font-light">
              Discover premium club jerseys inspired by football’s most iconic teams
            </p>
          </div>

          {/* Premium layout Grid */}
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 bg-transparent overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory no-scrollbar">
            {(homepageSettings?.clubs || [
              { id: "club-ars", query: "ARSENAL", name: "ARSENAL FC", image: "/images/25-26_club-jerseys/Arsenal_25-26_Home_Player_Version.jpeg" },
              { id: "club-fcb", query: "BARCELONA", name: "FC BARCELONA", image: "/images/25-26_club-jerseys/FCB_25-26_HPV.jpeg" },
              { id: "club-mci", query: "MANCHESTER CITY", name: "MANCHESTER CITY", image: "/images/25-26_club-jerseys/MC25-26_HPV.jpeg" },
              { id: "club-rm", query: "MADRID", name: "REAL MADRID CF", image: "/images/25-26_club-jerseys/real_madrid25-26_HPV.jpeg" },
            ]).map((card: any) => {
              const href = `/clubs?club=${encodeURIComponent(card.query)}`;
              return (
              <Link key={card.name} href={href} className="w-[55%] sm:w-[45%] md:w-auto shrink-0 snap-start block">
                <div className="relative aspect-[4/5] md:aspect-auto md:h-[320px] md:max-w-[300px] mx-auto w-full rounded-2xl overflow-hidden shadow-sm md:shadow-lg border border-luxury-sand/10 group bg-[#282828] transition-all duration-300 md:hover:-translate-y-2 md:hover:shadow-[0_0_30px_rgba(205,164,145,0.15)]">
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    className="object-cover object-[top_center] opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 md:from-black/90 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 flex flex-col justify-end">
                    <h3 className="text-[13px] md:text-lg font-serif text-white tracking-wide truncate">{card.name}</h3>
                    <div className="flex mt-1 md:mt-2 text-[8px] md:text-[10px] uppercase tracking-widest text-white/80 items-center gap-1 md:gap-2 group-hover:text-white transition-colors duration-300">
                      Explore <ChevronRight className="w-2 h-2 md:w-3 md:h-3 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            )})}
          </div>
        </div>
      </section>

      {/* 6. Find Your National Team Jersey (Interactive 3D Carousel Component) */}
      <section className="bg-[#FFEEE2] relative overflow-hidden border-t border-luxury-taupe/15">
        <NationalTeams3D />
      </section>



      {/* 9. Minimalist Policies & Support Section */}
      <section className="bg-luxury-dark text-white border-t border-luxury-sand/10">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-12 md:py-24 space-y-12 md:space-y-24">

          {/* Interactive FAQs and Sizing Trigger */}
          <div className="hidden md:grid lg:grid-cols-12 gap-16 items-start">
            
            {/* Sizing & Contact Drawer Info */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs uppercase tracking-[0.25em] text-white font-bold">Tailoring Support</span>
              <h3 className="text-3xl md:text-4xl font-serif text-white tracking-wide font-light">
                Sizing Concerns or <br />
                <span className="italic text-white font-normal">Custom Inquiries?</span>
              </h3>
              <p className="text-xs md:text-sm text-white leading-relaxed font-sans font-light">
                Premium sports knit behaves differently. Make sure your matchday jersey matches your exact fit-contour preference. Open our size guide or talk to us directly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => setSizeGuideOpen(true)}
                  className="px-6 py-3 bg-luxury-sand text-black hover:bg-white hover:text-black rounded-full text-[10px] tracking-widest uppercase font-semibold transition-all duration-300"
                >
                  Open Size Guide
                </button>
                <a 
                  href="https://wa.me/1234567890" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-6 py-3 border border-luxury-sand/30 hover:border-white text-white hover:text-white rounded-full text-[10px] tracking-widest uppercase font-semibold text-center transition-all duration-300"
                >
                  Contact WhatsApp
                </a>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.25em] text-white font-bold mb-6">Frequently Answered Queries</h4>
              {FAQS.map((faq, index) => (
                <div key={index} className="border-b border-luxury-sand/10 pb-4">
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full flex justify-between items-center text-left py-2 font-serif text-base text-white hover:text-white transition-colors duration-300"
                  >
                    <span>{faq.q}</span>
                    <span className="text-lg text-white font-mono ml-4">
                      {activeFaq === index ? "—" : "+"}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 0.8 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs font-sans font-light text-white pt-2 leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
