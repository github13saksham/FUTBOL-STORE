"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { LazyMotion, domMax, m, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Heart, ChevronRight, HelpCircle, Truck, RefreshCw,
  Shield, Check, Instagram, Send, Mail, User, FileText, Loader2, Star,
  Volume2, VolumeX
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
const NationalTeams3D = dynamic(() => import("@/components/NationalTeams3D"), { ssr: false });
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { useStore } from "@/context/StoreContext";
import { FAQS } from "@/data/mockData";
import { useRouter } from "next/navigation";

export default function HomepageClient({ initialSettings, isPreview = false }: { initialSettings: any, isPreview?: boolean }) {
  const bestSellersRef = useRef<HTMLDivElement>(null);
  const clubsRef = useRef<HTMLDivElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [hoveredClubId, setHoveredClubId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const router = useRouter();

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
    // Check if we are in preview mode
    const isPreviewFrame = typeof window !== 'undefined' && (window.self !== window.top || window.location.search.includes('preview=true') || isPreview);
    
    if (isPreviewFrame) {
      // Load initial preview settings from sessionStorage
      const previewData = sessionStorage.getItem('homepage_preview_settings');
      if (previewData) {
        try {
          setHomepageSettings(JSON.parse(previewData));
        } catch (e) {}
      } else if (initialSettings) {
        setHomepageSettings(initialSettings);
      }

      // Listen to postMessage for real-time live preview typing
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'UPDATE_HOMEPAGE_SETTINGS') {
          setHomepageSettings(event.data.settings);
        }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }

    let unsubscribe: (() => void) | undefined;
    import("firebase/firestore").then(({ doc, onSnapshot }) => {
      import("@/backend/firebase/config").then(({ db }) => {
        const docRef = doc(db, 'settings', 'homepage');
        unsubscribe = onSnapshot(docRef, (docSnap: any) => {
          if (docSnap.exists()) {
            setHomepageSettings(docSnap.data());
          }
        }, (error: any) => {
          console.error("Error listening to homepage settings:", error);
        });
      });
    });

    return () => unsubscribe?.();
  }, [isPreview, initialSettings]);

  // Apply dynamic text scaling via a <style> block so we can use media queries
  // instead of inline styles on the document element
  useEffect(() => {
    const desktopSize = homepageSettings?.styling?.desktopTextSize ?? homepageSettings?.styling?.textSize ?? 100;
    const mobileSize = homepageSettings?.styling?.mobileTextSize ?? homepageSettings?.styling?.textSize ?? 100;
    
    const styleId = 'homepage-dynamic-text-scaling';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    styleEl.innerHTML = `
      html { font-size: ${mobileSize}%; }
      :root, body, .responsive-pad {
        --pad-scale: var(--pad-scale-mobile, 1);
      }
      @media (min-width: 768px) {
        html { font-size: ${desktopSize}%; }
        :root, body, .responsive-pad {
          --pad-scale: var(--pad-scale-desktop, 1);
        }
      }
    `;

    return () => {
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    };
  }, [
    homepageSettings?.styling?.desktopTextSize, 
    homepageSettings?.styling?.mobileTextSize, 
    homepageSettings?.styling?.textSize
  ]);

  // Sync mute state when settings load
  useEffect(() => {
    if (homepageSettings?.hero?.mediaVolume !== undefined) {
      setIsMuted(Number(homepageSettings.hero.mediaVolume) === 0);
    }
  }, [homepageSettings?.hero?.mediaVolume]);

  // Apply video volume
  useEffect(() => {
    const vol = isMuted ? 0 : (Number(homepageSettings?.hero?.mediaVolume) ?? 0) / 100;
    if (desktopVideoRef.current) {
      desktopVideoRef.current.volume = vol;
    }
    if (mobileVideoRef.current) {
      mobileVideoRef.current.volume = vol;
    }
  }, [homepageSettings?.hero?.mediaVolume, homepageSettings?.hero?.mediaType, isMuted]);

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
    <LazyMotion features={domMax}>
      <div
        className="min-h-screen selection:bg-luxury-taupe selection:text-white text-black bg-[#FFEEE2] responsive-pad"
        style={{ 
          '--pad-scale-desktop': (homepageSettings?.styling?.desktopSectionPadding ?? homepageSettings?.styling?.sectionPadding ?? 100) / 100,
          '--pad-scale-mobile': (homepageSettings?.styling?.mobileSectionPadding ?? homepageSettings?.styling?.sectionPadding ?? 100) / 100,
        } as React.CSSProperties}
      >

        {/* Promo Banner */}
        {(homepageSettings?.banner?.enabled ?? true) && (
          <div className="w-full bg-black text-white overflow-hidden z-40 border-b border-white/10 mt-[100px] md:mt-[120px]">

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
        <section className={`relative w-full flex flex-col justify-center items-start overflow-hidden py-[calc(var(--pad-scale,1)*6rem)] md:py-[calc(var(--pad-scale,1)*8rem)] px-6 md:px-12 lg:px-24 ${isPreview ? 'h-[720px] md:h-[900px]' : 'min-h-[100svh]'}`}>

          {!homepageSettings ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
              <m.div
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: [1, 0.6, 1], scale: [1, 0.95, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-36 h-36 md:w-48 md:h-48"
              >
                <Image
                  src="/FUTBOL STORE IT'S ALL ABOUT THE QUALITY (1).svg"
                  alt="Loading..."
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </m.div>
            </div>
          ) : (
            <>
              {/* Background Media */}
              {homepageSettings?.hero?.mediaType === 'video' ? (
                <>
                  <video 
                    ref={desktopVideoRef} 
                    autoPlay 
                    loop 
                    muted={isMuted} 
                    playsInline 
                    preload="auto" 
                    className="hidden md:block absolute inset-0 w-full h-full z-0" 
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: homepageSettings?.hero?.mediaFit || 'cover', 
                      objectPosition: homepageSettings?.hero?.mediaPosition === 'custom' ? `${homepageSettings?.hero?.mediaPositionCustomX ?? 50}% ${homepageSettings?.hero?.mediaPositionCustomY ?? 50}%` : (homepageSettings?.hero?.mediaPosition || 'top'), 
                      transform: `scale(${(homepageSettings?.hero?.mediaZoom ?? 100) / 100})` 
                    }}
                  >
                    <source src={homepageSettings.hero.desktopMediaUrl || "/images/Hero_Section_vid.MP4"} />
                  </video>
                  <video 
                    ref={mobileVideoRef} 
                    autoPlay 
                    loop 
                    muted={isMuted} 
                    playsInline 
                    preload="auto" 
                    className="block md:hidden absolute inset-0 w-full h-full z-0" 
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: homepageSettings?.hero?.mobileMediaFit || homepageSettings?.hero?.mediaFit || 'cover', 
                      objectPosition: (homepageSettings?.hero?.mobileMediaPosition || homepageSettings?.hero?.mediaPosition) === 'custom' ? `${homepageSettings?.hero?.mobileMediaPositionCustomX ?? homepageSettings?.hero?.mediaPositionCustomX ?? 50}% ${homepageSettings?.hero?.mobileMediaPositionCustomY ?? homepageSettings?.hero?.mediaPositionCustomY ?? 50}%` : (homepageSettings?.hero?.mobileMediaPosition || homepageSettings?.hero?.mediaPosition || 'top'), 
                      transform: `scale(${(homepageSettings?.hero?.mobileMediaZoom ?? homepageSettings?.hero?.mediaZoom ?? 100) / 100})` 
                    }}
                  >
                    <source src={homepageSettings.hero.mobileMediaUrl || homepageSettings.hero.desktopMediaUrl || "/images/Hero_Section_vid.MP4"} />
                  </video>
                </>
              ) : (
                <>
                  <div className="hidden md:block absolute inset-0 w-full h-full z-0">
                    <Image
                      src={homepageSettings?.hero?.desktopMediaUrl || ""}
                      alt="Hero Desktop"
                      fill
                      priority
                      style={{ objectFit: homepageSettings?.hero?.mediaFit || 'cover', objectPosition: homepageSettings?.hero?.mediaPosition === 'custom' ? `${homepageSettings?.hero?.mediaPositionCustomX ?? 50}% ${homepageSettings?.hero?.mediaPositionCustomY ?? 50}%` : (homepageSettings?.hero?.mediaPosition || 'top'), transform: `scale(${(homepageSettings?.hero?.mediaZoom ?? 100) / 100})` }}
                    />
                  </div>
                  <div className="block md:hidden absolute inset-0 w-full h-full z-0">
                    <Image
                      src={homepageSettings?.hero?.mobileMediaUrl || homepageSettings?.hero?.desktopMediaUrl || ""}
                      alt="Hero Mobile"
                      fill
                      priority
                      style={{ objectFit: homepageSettings?.hero?.mobileMediaFit || homepageSettings?.hero?.mediaFit || 'cover', objectPosition: (homepageSettings?.hero?.mobileMediaPosition || homepageSettings?.hero?.mediaPosition) === 'custom' ? `${homepageSettings?.hero?.mobileMediaPositionCustomX ?? homepageSettings?.hero?.mediaPositionCustomX ?? 50}% ${homepageSettings?.hero?.mobileMediaPositionCustomY ?? homepageSettings?.hero?.mediaPositionCustomY ?? 50}%` : (homepageSettings?.hero?.mobileMediaPosition || homepageSettings?.hero?.mediaPosition || 'top'), transform: `scale(${(homepageSettings?.hero?.mobileMediaZoom ?? homepageSettings?.hero?.mediaZoom ?? 100) / 100})` }}
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

              {/* Mute Toggle Button */}
              {homepageSettings?.hero?.mediaType === 'video' && Number(homepageSettings?.hero?.mediaVolume) !== 0 && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-8 right-6 md:bottom-12 md:right-12 z-20 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all duration-300 shadow-lg border border-white/20 hover:scale-105"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                  {isMuted ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
                </button>
              )}

              {/* Hero content layout - Centered */}
              <div className="relative w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center z-10">

                {/* Text Block */}
                <div className="flex flex-col items-center mt-40 space-y-10">

                  <h1
                    className="text-4xl sm:text-6xl md:text-8xl lg:text-[90px] font-serif text-white leading-[1.1] sm:leading-[0.9] italic tracking-tight font-light sm:whitespace-nowrap text-center px-4 drop-shadow-lg animate-hero-fade-in"
                  >
                    "{homepageSettings?.hero?.title || 'Inspired By Greatness'}"
                  </h1>

                  <div
                    className="flex flex-row gap-3 sm:gap-4 w-full sm:w-auto pt-6 sm:pt-4 justify-center px-4 sm:px-0 animate-hero-fade-in-delayed"
                  >
                    <Link
                      href={homepageSettings?.hero?.ctaLink || '/shop'}
                      className="group flex items-center justify-center gap-2 sm:gap-3 flex-1 sm:flex-none sm:w-[240px] px-3 py-3 sm:py-4 bg-luxury-dark text-white hover:bg-luxury-taupe hover:text-black rounded-full text-[9px] sm:text-[11px] uppercase tracking-widest font-semibold transition-all duration-300"
                    >
                      {homepageSettings?.hero?.ctaText || 'Shop Now'}
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Link>

                    <button
                      onClick={() => {
                        const el = document.getElementById("clubs");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex items-center justify-center flex-1 sm:flex-none sm:w-[240px] px-3 py-3 sm:py-4 border border-white text-white hover:bg-white hover:text-black rounded-full text-[9px] sm:text-[11px] uppercase tracking-widest font-semibold transition-all duration-300 backdrop-blur-sm"
                    >
                      Explore Clubs
                    </button>
                  </div>
                </div>

              </div>
            </>
          )}
        </section>

        {/* 2.5 Built for Football Culture Section */}
        <section className="py-[calc(var(--pad-scale,1)*2.5rem)] md:py-[calc(var(--pad-scale,1)*3rem)] px-5 md:px-12 max-w-7xl mx-auto bg-transparent text-black">
          <div className="grid grid-cols-[3fr_2fr] md:grid-cols-2 gap-5 md:gap-16 items-center">

            {/* Left Column: Text */}
            <div className="space-y-3 md:space-y-6 flex flex-col justify-center">
              <span className="text-[10px] md:text-[20px] uppercase tracking-[0.15em] md:tracking-[0.3em] font-semibold text-black flex items-center gap-2 md:gap-3 pb-0 md:pb-20">
                <span className="w-5 md:w-8 h-[1px] bg-luxury-taupe flex-shrink-0"></span>
                <span className="leading-tight">{homepageSettings?.collectionPromo?.eyebrow || 'LIMITED TIME ARRIVAL'}</span>
              </span>

              <h2 className="text-2xl md:text-7xl font-serif text-black font-light leading-[1.1] tracking-tight">
                {homepageSettings?.collectionPromo?.heading1 || "The Road to Glory"} <br />
                <span className="italic font-medium text-black">{homepageSettings?.collectionPromo?.heading2Italic || "Begins Now."}</span>
              </h2>

              <p className="text-xs md:text-lg text-black font-sans leading-relaxed max-w-md">
                {homepageSettings?.collectionPromo?.description || "Discover the FIFA World Cup 2026 Collection and wear the pride of your nation."}
              </p>

              <div className="flex items-center pt-1 md:pt-4">
                <button
                  onClick={() => {
                    router.push(homepageSettings?.collectionPromo?.ctaLink || "/national-teams");
                  }}
                  className="text-[10px] md:text-xs uppercase tracking-widest font-semibold text-black hover:text-black flex items-center gap-1.5 md:gap-2 transition-colors duration-300"
                >
                  {homepageSettings?.collectionPromo?.ctaText || "Discover Now"} <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Card with Image */}
            <div className="relative flex justify-center md:justify-end">
              <div className="w-full max-w-[380px] bg-[#1a1c21] rounded-xl overflow-hidden h-[260px] md:h-[500px] relative shadow-2xl group flex flex-col justify-end">
                {/* Desktop Image */}
                <Image
                  src={homepageSettings?.collectionPromo?.desktopImageUrl || homepageSettings?.collectionPromo?.imageUrl || "/NATIONAL_TEAM_LOGO/WORLDCUP_IMG.jpeg"}
                  alt="Promo Collection"
                  fill
                  style={{ objectFit: "cover" }}
                  className="hidden md:block opacity-80 group-hover:scale-105 transition-transform duration-[2000ms] ease-out pointer-events-none"
                />
                {/* Mobile Image */}
                <Image
                  src={homepageSettings?.collectionPromo?.mobileImageUrl || homepageSettings?.collectionPromo?.imageUrl || "/NATIONAL_TEAM_LOGO/WORLDCUP_IMG.jpeg"}
                  alt="Promo Collection Mobile"
                  fill
                  style={{ objectFit: "cover" }}
                  className="block md:hidden opacity-80 group-hover:scale-105 transition-transform duration-[2000ms] ease-out pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                <div className="relative z-10 p-8">
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3. Split Premium Cards (Player Version vs Fan Version) */}
        <section className="py-[calc(var(--pad-scale,1)*3rem)] bg-luxury-dark text-white relative overflow-hidden">
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
            {/* VS Divider Mobile */}


            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 no-scrollbar md:grid md:grid-cols-2 md:gap-12 relative max-w-none mx-auto w-full items-stretch">
              {/* Card 1: Player Version */}
              <m.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="group relative w-[85vw] max-w-[400px] md:w-full rounded-2xl md:rounded-3xl overflow-hidden border border-luxury-sand/15 bg-neutral-900/60 shadow-[0_0_40px_rgba(205,164,145,0.12)] hover:shadow-[0_0_50px_rgba(205,164,145,0.25)] transition-shadow duration-500 flex flex-col mx-auto md:h-[480px] md:items-center md:justify-start shrink-0 snap-center"
              >
                {/* Background Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />

                {/* Image */}
                <div className="relative w-full h-[240px] md:h-[320px] flex-shrink-0">
                  <Image
                    src="/HEAT-PRESSED LOGOS.svg"
                    alt="Heat Pressed Logos"
                    fill
                    style={{ objectFit: "contain", objectPosition: "top" }}
                    className="opacity-90 transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                  />
                </div>

                {/* Text — mobile: natural flow, desktop: overlay with negative margin */}
                <div className="relative z-20 w-full flex flex-col items-center px-3 pb-4 pt-2 md:mt-auto md:px-6 md:pb-8 md:pt-0">
                  <h2 className="italic text-sm md:text-4xl font-serif font-light text-white tracking-wide text-center mb-1 md:mb-2 md:mt-[-8rem]">
                    Player <span className="italic font-normal text-white">Version</span>
                  </h2>
                  <p className="text-[9px] leading-[1.4] md:text-sm text-white/80 font-light font-sans text-center">
                    Built for elite performance, the Player Version Jersey features a slim athletic fit, lightweight breathable fabric, and heat-pressed details for an authentic on-pitch feel.
                  </p>
                </div>
              </m.div>

              {/* Card 2: Fan Version */}
              <m.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="group relative w-[85vw] max-w-[400px] md:w-full rounded-2xl md:rounded-3xl overflow-hidden border border-luxury-sand/15 bg-neutral-900/60 shadow-[0_0_40px_rgba(205,164,145,0.12)] hover:shadow-[0_0_50px_rgba(205,164,145,0.25)] transition-shadow duration-500 flex flex-col mx-auto md:h-[480px] md:items-center md:justify-start shrink-0 snap-center"
              >
                {/* Background Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />

                {/* Image */}
                <div className="relative w-full h-[240px] md:h-[320px] flex-shrink-0">
                  <Image
                    src="/HEAT-PRESSED LOGOS (2).svg"
                    alt="Fan Lifestyle"
                    fill
                    style={{ objectFit: "contain", objectPosition: "top" }}
                    className="opacity-90 transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                  />
                </div>

                {/* Text */}
                <div className="relative z-20 w-full flex flex-col items-center px-3 pb-4 pt-2 md:mt-auto md:px-6 md:pb-8 md:pt-0">
                  <h2 className="italic text-sm md:text-4xl font-serif font-light text-white tracking-wide text-center mb-1 md:mb-2 md:mt-[-8rem]">
                    Fan <span className="italic font-normal text-white">Version</span>
                  </h2>
                  <p className="text-[9px] leading-[1.4] md:text-sm text-white/80 font-light font-sans text-center">
                    Designed for everyday comfort, the Fan Version Jersey offers a relaxed fit with high-quality stitched details and breathable fabric perfect for matchdays and casual wear.
                  </p>
                </div>
              </m.div>
            </div>
          </div>
        </section>

        {/* 4. Best Sellers Section */}
        <section id="bestsellers" className="py-[calc(var(--pad-scale,1)*2rem)] md:py-[calc(var(--pad-scale,1)*4rem)] w-full overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-16 gap-2 md:gap-6">
            <div>

              <h2 className="text-3xl md:text-6xl font-serif text-black mt-2 font-light">
                Best <span className="italic font-medium text-black">Sellers</span>
              </h2>
            </div>
            <p className="max-w-m text-xs md:text-sm text-black font-light leading-relaxed font-sans">
              Discover the jerseys trusted and loved by football fans across India.
            </p>
          </div>

          {/* Horizontal Drag/Scroll Slider */}
          <div className="w-full overflow-hidden pl-6 md:pl-12 xl:pl-[calc((100vw-80rem)/2+3rem)]">
            <m.div
              ref={bestSellersRef}
              className="relative w-full pb-12 cursor-grab active:cursor-grabbing"
            >
              <m.div
              key={(homepageSettings?.bestSellersItems || []).length}
              drag="x"
              dragConstraints={bestSellersRef}
              dragElastic={0.05}
              className="flex gap-8 w-max min-w-full pr-6 md:pr-12"
            >
              {isLoadingData ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[350px]">
                    <ProductCardSkeleton />
                  </div>
                ))
              ) : (
                bestSellers.map((product: any) => (
                  <m.div
                    key={product.id}
                  whileHover={{


                    boxShadow: "0 35px 60px -15px rgba(0, 0, 0, 0.3)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ perspective: 1000, transformStyle: "preserve-3d" }}
                  className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[350px] relative rounded-2xl border border-white/10 bg-luxury-dark hover:bg-black hover:z-20 flex flex-col transition-colors duration-500 overflow-hidden group/card transform-gpu"
                >
                  {/* Image Container with zoom overlay */}
                  <div
                    className="relative w-full aspect-[35/32] md:aspect-auto md:h-[320px] bg-neutral-100 group"
                    style={{ transform: "translateZ(30px)" }}
                  >
                    <Link href={product.link || `/product/${product.realId}`}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-[1000ms] ease-out scale-105 "
                        loading="lazy"
                      />

                      {/* Overlay with subtle shadow */}
                      <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/5 transition-colors duration-300 hidden md:block" />
                    </Link>

                    {/* Tags Container */}
                    <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-1 z-20 pointer-events-none">
                      {(product.realProduct?.visibility?.newArrival || product.visibility?.newArrival) && (
                        <div className="bg-white text-black text-[8px] md:text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded shadow-sm w-max">
                          New Arrival
                        </div>
                      )}
                      {(product.realProduct?.visibility?.bestSeller || product.visibility?.bestSeller) && (
                        <div className="bg-luxury-taupe text-white text-[8px] md:text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded shadow-sm w-max">
                          Best Seller
                        </div>
                      )}
                      {(product.realProduct?.visibility?.featured || product.visibility?.featured) && (
                        <div className="bg-black text-white text-[8px] md:text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded shadow-sm border border-white/20 w-max">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Quick Add Button on Hover */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (product.realProduct) {
                          setQuickAddProduct(product.realProduct);
                        } else {
                          router.push(product.link || `/product/${product.realId}`);
                        }
                      }}
                      className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-luxury-dark text-white hover:bg-luxury-taupe hover:text-black text-[10px] tracking-widest uppercase font-semibold rounded-full shadow-lg opacity-0 md:group-hover:opacity-100 translate-y-3 md:group-hover:translate-y-0 transition-all duration-300 backdrop-blur-md z-10"
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
                  <div className="p-3 md:p-5 md:pt-4 flex-grow flex flex-col justify-between space-y-1.5 md:space-y-2">
                    <div>

                      <Link href={product.link || `/product/${product.realId}`} className="block mt-0.5">
                        <h3 className="font-serif text-[12px] md:text-[15px] font-medium leading-tight text-white hover:text-luxury-taupe transition-colors md:whitespace-normal" style={{ transform: "translateZ(20px)" }}>
                          {product.realProduct?.name || product.name}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex justify-between items-end pb-1 border-b border-white/20 pt-1 md:pt-0 gap-1">
                      <div className="flex flex-col min-w-0">
                        <div className="h-5 md:h-6 flex items-center">
                          {(() => {
                            const compPrice = product.realProduct?.comparePrice || product.comparePrice || 0;
                            const currentPrice = product.realProduct?.price || product.price || 0;
                            if (compPrice > currentPrice) {
                              const percentOff = Math.round(((compPrice - currentPrice) / compPrice) * 100);
                              return (
                                <div className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap shrink-0">
                                  <span className="font-sans text-[10px] md:text-sm text-white/50 line-through">
                                    ₹{compPrice}
                                  </span>
                                  <span className="font-sans text-[8px] md:text-xs text-luxury-taupe font-bold tracking-wider">
                                    {percentOff}% OFF
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <span className="font-serif text-sm md:text-lg text-white font-medium leading-none mt-1 whitespace-nowrap">
                          {product.realProduct?.priceStr || product.priceStr}
                        </span>
                      </div>
                      <Link
                        href={product.link || `/product/${product.realId}`}
                        className="flex text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-semibold text-white/80 hover:text-white items-center gap-1 transition-colors duration-300 whitespace-nowrap shrink-0 mb-0.5"
                      >
                        <span className="hidden md:inline">View Item</span> <ChevronRight className="w-3 h-3 shrink-0" />
                      </Link>
                    </div>
                  </div>
                </m.div>
              )))}
            </m.div>
          </m.div>
        </div>
        </section>

        {/* 5. Shop By Clubs Grid Section */}
        <section id="clubs" className="py-[calc(var(--pad-scale,1)*2rem)] md:py-[calc(var(--pad-scale,1)*4rem)] bg-luxury-dark text-white relative overflow-hidden">
          {/* Cinematic shadows & lighting */}
          <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-luxury-taupe/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute left-[10%] top-[10%] w-[400px] h-[400px] bg-luxury-sage/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="w-full relative z-10">
            <div className="max-w-7xl mx-auto px-5 md:px-12 mb-6 md:mb-20 space-y-2 md:space-y-4">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-7xl font-serif text-white tracking-wide">
                  Shop By <span className="italic font-light text-white">Clubs</span>
                </h2>
                <p className="text-xs md:text-sm text-white font-sans leading-relaxed font-light mt-2 md:mt-4">
                  Discover premium club jerseys inspired by football's most iconic teams
                </p>
              </div>
            </div>

            {/* Premium layout Grid */}
            <div className="w-full overflow-hidden pl-5 md:pl-12 xl:pl-[calc((100vw-80rem)/2+3rem)]">
              <m.div
                ref={clubsRef}
                className="relative w-full pb-4 md:pb-8 cursor-grab active:cursor-grabbing"
              >
                <m.div
                key={(homepageSettings?.clubs || []).length}
                drag="x"
                dragConstraints={clubsRef}
                dragElastic={0.05}
                className="flex gap-4 md:gap-8 w-max min-w-full pr-5 md:pr-12"
              >
                {(homepageSettings?.clubs || [
                  { id: "club-ars", query: "ARSENAL", name: "ARSENAL FC", image: "/images/25-26_club-jerseys/Arsenal_25-26_Home_Player_Version.jpeg" },
                  { id: "club-fcb", query: "BARCELONA", name: "FC BARCELONA", image: "/images/25-26_club-jerseys/FCB_25-26_HPV.jpeg" },
                  { id: "club-mci", query: "MANCHESTER CITY", name: "MANCHESTER CITY", image: "/images/25-26_club-jerseys/MC25-26_HPV.jpeg" },
                  { id: "club-rm", query: "MADRID", name: "REAL MADRID CF", image: "/images/25-26_club-jerseys/real_madrid25-26_HPV.jpeg" },
                ]).map((card: any) => {
                  const href = `/clubs?club=${encodeURIComponent(card.query)}`;
                  return (
                    <Link key={card.name} href={href} className="w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] shrink-0 block drag-none" draggable={false}>
                      <div className="relative aspect-[4/5] mx-auto w-full rounded-2xl overflow-hidden shadow-sm md:shadow-lg border border-luxury-sand/10 group bg-[#282828] transition-all duration-300 md:hover:-translate-y-2 md:hover:shadow-[0_0_30px_rgba(205,164,145,0.15)] pointer-events-auto">
                        <Image
                          src={card.image}
                          alt={card.name}
                          fill
                          draggable={false}
                          className="object-cover object-[top_center] opacity-90 pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 md:from-black/90 via-black/20 to-transparent pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 flex flex-col justify-end pointer-events-none">
                          <h3 className="text-[13px] md:text-lg font-serif text-white tracking-wide truncate">{card.name}</h3>
                          <div className="flex mt-1 md:mt-2 text-[8px] md:text-[10px] uppercase tracking-widest text-white/80 items-center gap-1 md:gap-2 group-hover:text-white transition-colors duration-300">
                            Explore <ChevronRight className="w-2 h-2 md:w-3 md:h-3 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </m.div>
            </m.div>
          </div>
          </div>
        </section>

        {/* 5.5 Collection Promo Section */}
        {homepageSettings?.collectionPromo?.enabled && (
          <section className="bg-[#FDF5EC] py-[calc(var(--pad-scale,1)*4rem)] md:py-[calc(var(--pad-scale,1)*6rem)] border-t border-luxury-taupe/15">
            <div className="max-w-7xl mx-auto px-4 md:px-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24">
                <div className="flex-1 space-y-6 md:space-y-8 max-w-lg z-10">
                  <div className="flex items-center gap-4 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-black">
                    <div className="w-8 h-[1px] bg-black/20"></div>
                    {homepageSettings.collectionPromo.eyebrow || 'LIMITED TIME ARRIVAL'}
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl font-serif text-black leading-[1.1]">
                    {homepageSettings.collectionPromo.heading1 || 'The Road to Glory'} <br className="hidden md:block" />
                    <span className="italic">{homepageSettings.collectionPromo.heading2Italic || 'Begins Now.'}</span>
                  </h2>
                  
                  <p className="text-sm md:text-base text-black/70 leading-relaxed font-sans font-light">
                    {homepageSettings.collectionPromo.description || 'Discover the FIFA World Cup 2026 Collection and wear the pride of your nation.'}
                  </p>
                  
                  <div className="pt-4">
                    <Link href={homepageSettings.collectionPromo.ctaLink || '/national-teams'} className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-widest uppercase text-black border-b border-black/20 pb-1 hover:border-black transition-colors group">
                      {homepageSettings.collectionPromo.ctaText || 'DISCOVER NOW'} 
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
                
                <div className="w-full md:w-auto flex-shrink-0 z-0">
                  <div className="relative w-full max-w-[320px] md:w-[400px] aspect-[3/4] mx-auto rounded-sm shadow-2xl overflow-hidden bg-white p-2">
                    {/* Desktop Image */}
                    <div className="hidden md:block relative w-full h-full">
                      {(homepageSettings.collectionPromo.desktopImageUrl || homepageSettings.collectionPromo.imageUrl) ? (
                        <Image 
                          src={homepageSettings.collectionPromo.desktopImageUrl || homepageSettings.collectionPromo.imageUrl} 
                          alt="Promo Collection Desktop" 
                          fill 
                          className="object-cover rounded-sm"
                        />
                      ) : (
                        <div className="w-full h-full bg-black/5 flex items-center justify-center text-xs text-gray-400 font-bold border border-black/10 rounded-sm">POSTER IMAGE</div>
                      )}
                    </div>
                    {/* Mobile Image */}
                    <div className="block md:hidden relative w-full h-full">
                      {(homepageSettings.collectionPromo.mobileImageUrl || homepageSettings.collectionPromo.imageUrl) ? (
                        <Image 
                          src={homepageSettings.collectionPromo.mobileImageUrl || homepageSettings.collectionPromo.imageUrl} 
                          alt="Promo Collection Mobile" 
                          fill 
                          className="object-cover rounded-sm"
                        />
                      ) : (
                        <div className="w-full h-full bg-black/5 flex items-center justify-center text-xs text-gray-400 font-bold border border-black/10 rounded-sm">POSTER IMAGE</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 6. Find Your National Team Jersey (Interactive 3D Carousel Component) */}
        <section className="bg-[#FFEEE2] relative overflow-hidden border-t border-luxury-taupe/15">
          <NationalTeams3D 
            teams={homepageSettings?.nationalTeams} 
            sectionHeadings={homepageSettings?.nationalTeamsSection}
          />
        </section>



        {/* 9. Minimalist Policies & Support Section */}
        <section className="bg-luxury-dark text-white border-t border-luxury-sand/10">
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-[calc(var(--pad-scale,1)*3rem)] md:py-[calc(var(--pad-scale,1)*3rem)] space-y-12 md:space-y-24">

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
                    href="https://chat.whatsapp.com/KWrRHklSqb47tIhSJ0EOl5"
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
                        <m.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 0.8 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs font-sans font-light text-white pt-2 leading-relaxed">
                            {faq.a}
                          </p>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>
      </div>
    </LazyMotion>
              
  );

}
