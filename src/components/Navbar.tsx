"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
  Search, Heart, ShoppingBag, User, Plus, Minus, X,
  ChevronRight, Check, Menu
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const [navbarSolid, setNavbarSolid] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const {
    products,
    cart,
    wishlist,
    searchOpen,
    wishlistOpen,
    cartOpen,
    sizeGuideOpen,
    quickAddProduct,
    selectedSize,
    setSelectedSize,
    setQuickAddProduct,
    setSearchOpen,
    setWishlistOpen,
    setCartOpen,
    setSizeGuideOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleWishlist,
    getCartTotal,
    setActivePolicy
  } = useStore();

  const { user } = useAuth();

  // Monitor scroll for navbar blurring / solid background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavbarSolid(true);
      } else {
        setNavbarSolid(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else if (!searchOpen) {
      setSearchQuery(""); // Clear search when modal closes
    }
  }, [searchOpen]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const escapedQuery = searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const queryRegex = new RegExp(`\\b${escapedQuery}`, 'i');

  const searchResults = searchQuery.trim() === "" 
    ? [] 
    : products.filter(p => 
        queryRegex.test(p.name) || 
        (p.club && queryRegex.test(p.club)) ||
        queryRegex.test(p.category)
      );

  return (
    <>
      {/* 1. Transparent Luxury Navbar (Desktop) & Clean Header (Mobile) */}
      <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 bg-white ${
        navbarSolid ? "shadow-sm" : ""
      }`}>
        <div className="py-2 md:py-2 px-4 md:px-12 flex justify-between items-center w-full relative min-h-[100px] md:min-h-[120px]">
          {/* Left Side: Hamburger (Mobile) */}
          <div className="flex items-center w-[100px] xl:hidden">
            <button 
              className="text-luxury-dark hover:text-luxury-taupe transition-colors duration-300"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-6 h-6 stroke-[1.5px]" />
            </button>
          </div>
            
          {/* Center: Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 xl:relative xl:left-0 xl:top-0 xl:-translate-x-0 xl:-translate-y-0 flex items-center justify-center">
            <Link href="/" className="relative flex items-center justify-center cursor-pointer">
              <Image
                src="/logo.png"
                alt="The Futbol Store Logo"
                height={200}
                width={300}
                quality={100}
                unoptimized
                className="object-contain w-[128px] h-[80px] md:w-[180px] md:h-[100px] hover:scale-105 transition-transform duration-300"
                priority
              />
            </Link>
          </div>

          {/* Center Links (Desktop only) */}
          <ul className="hidden xl:flex items-center gap-8 text-[11px] uppercase tracking-[0.25em] font-medium text-luxury-dark">
            <li>
              <Link href="/" className="hover:text-luxury-dark cursor-pointer transition-colors duration-300 relative group py-2 block">
                Home
                <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-luxury-taupe transition-transform duration-300 origin-left ${
                  pathname === "/" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`} />
              </Link>
            </li>
            <li>
              <Link href="/clubs" className="hover:text-luxury-dark cursor-pointer transition-colors duration-300 relative group py-2 block">
                Clubs
                <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-luxury-taupe transition-transform duration-300 origin-left ${
                  pathname === "/clubs" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`} />
              </Link>
            </li>
            <li>
              <Link href="/national-teams" className="hover:text-luxury-dark cursor-pointer transition-colors duration-300 relative group py-2 block">
                National Teams
                <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-luxury-taupe transition-transform duration-300 origin-left ${
                  pathname === "/national-teams" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`} />
              </Link>
            </li>
            <li>
              <Link href="/about-us" className="hover:text-luxury-dark cursor-pointer transition-colors duration-300 relative group py-2 block">
                About Us
                <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-luxury-taupe transition-transform duration-300 origin-left ${
                  pathname === "/about-us" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`} />
              </Link>
            </li>
          </ul>

          {/* Right Side: Minimal Icons */}
          <div className="flex items-center gap-4 md:gap-6 text-luxury-dark">
            <button
              onClick={() => setSearchOpen(true)}
              className="hover:text-luxury-dark p-1 transition-colors duration-300 relative block"
              aria-label="Open Search"
            >
              <Search className="w-5 h-5 stroke-[1.5px]" />
            </button>

            <button
              onClick={() => setWishlistOpen(true)}
              className="hover:text-luxury-dark p-1 transition-colors duration-300 relative"
              aria-label="Open Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.5px]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-luxury-taupe text-luxury-dark text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCartOpen(true)}
              className="hover:text-luxury-dark p-1 transition-colors duration-300 relative"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5px]" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-luxury-dark text-luxury-ivory text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>

            <Link href={user ? "/account" : "/login"} className="hover:text-luxury-ivory p-1 transition-colors duration-300 hidden md:block" aria-label="User Account">
              {user?.photoURL && !imgError ? (
                <div className="w-6 h-6 rounded-full overflow-hidden relative border border-luxury-sand/30 hover:border-luxury-ivory transition-colors">
                  <Image 
                    src={user.photoURL} 
                    alt="Profile" 
                    fill 
                    className="object-cover" 
                    onError={() => setImgError(true)}
                  />
                </div>
              ) : (
                <User className="w-5 h-5 stroke-[1.5px]" />
              )}
            </Link>
          </div>
        </div>

      </nav>

      {/* 2. Fixed Bottom Navigation Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-neutral-900 flex justify-around items-center py-2 px-4 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.5)]">
        <Link href="/" className="flex flex-col items-center gap-1 text-white/80 hover:text-white">
          <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/clubs" className="flex flex-col items-center gap-1 text-white/80 hover:text-white">
          <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          <span className="text-[10px] font-medium">Clubs</span>
        </Link>
        <Link href="/national-teams" className="flex flex-col items-center gap-1 text-white/80 hover:text-white">
          <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[10px] font-medium">Nations</span>
        </Link>
        <Link href={user ? "/account" : "/login"} className="flex flex-col items-center gap-1 text-white/80 hover:text-white">
          <User className="w-5 h-5 stroke-[1.5px] opacity-80" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>

      {/* ==================================================== */}
      {/* OVERLAY MODULES & DRAWERS (E-commerce Interactions) */}
      {/* ==================================================== */}
      <LazyMotion features={domAnimation}>
      {/* A0. Mobile Menu Drawer (Myntra Style) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50 xl:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Sliding Drawer */}
            <m.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-[101] w-[80%] max-w-[320px] bg-white shadow-2xl xl:hidden overflow-y-auto flex flex-col"
            >

              {/* Categories */}
              <div className="py-2 pt-6">
                <Link href="/clubs" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <span className="font-bold text-gray-800 text-[15px]">Clubs</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link href="/national-teams" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <span className="font-bold text-gray-800 text-[15px]">National Teams</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link href="/about-us" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <span className="font-bold text-gray-800 text-[15px]">About Us</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>

              {/* Secondary Links */}
              <div className="py-4 bg-gray-50 flex-grow">
                {user ? (
                  <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-5 py-3 text-[14px] text-gray-600 hover:text-luxury-dark">
                    My Account
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-5 py-3 text-[14px] text-gray-600 hover:text-luxury-dark">
                    Login / Register
                  </Link>
                )}
                <button onClick={() => { setMobileMenuOpen(false); window.location.href = "mailto:thefutbolstore.in@gmail.com"; }} className="w-full text-left flex items-center px-5 py-3 text-[14px] text-gray-600 hover:text-luxury-dark">Contact Us</button>
                <button onClick={() => { setMobileMenuOpen(false); setActivePolicy("privacy-policy"); }} className="w-full text-left flex items-center px-5 py-3 text-[14px] text-gray-600 hover:text-luxury-dark">Privacy Policy</button>
                <button onClick={() => { setMobileMenuOpen(false); setActivePolicy("terms-of-service"); }} className="w-full text-left flex items-center px-5 py-3 text-[14px] text-gray-600 hover:text-luxury-dark">Terms of Service</button>
                <button onClick={() => { setMobileMenuOpen(false); setActivePolicy("return-policy"); }} className="w-full text-left flex items-center px-5 py-3 text-[14px] text-gray-600 hover:text-luxury-dark">Return Policy</button>
                <button onClick={() => { setMobileMenuOpen(false); setActivePolicy("shipping-policy"); }} className="w-full text-left flex items-center px-5 py-3 text-[14px] text-gray-600 hover:text-luxury-dark">Shipping Policy</button>
                <button onClick={() => { setMobileMenuOpen(false); setActivePolicy("faqs"); }} className="w-full text-left flex items-center px-5 py-3 text-[14px] text-gray-600 hover:text-luxury-dark">FAQs</button>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* A. Search Fullscreen Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] h-screen w-screen overflow-hidden bg-luxury-dark/95 backdrop-blur-lg flex flex-col justify-start items-center p-6 md:px-12 pt-24 pb-0"
          >
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-8 right-8 text-luxury-ivory hover:text-luxury-ivory p-2 transition-colors duration-300"
              aria-label="Close Search"
            >
              <X className="w-8 h-8 stroke-[1.5px]" />
            </button>

            <div className="w-full max-w-5xl flex-grow flex flex-col space-y-8 mt-8 min-h-0 overflow-hidden">
              <span className="text-xs uppercase tracking-[0.3em] text-luxury-ivory font-bold block text-center flex-shrink-0">Search Store</span>

              <div className="flex items-center border-b-2 border-white/35 py-4 w-full flex-shrink-0">
                <Search className="w-6 h-6 text-luxury-ivory mr-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH BY CLUB, PLAYER EDITION OR RETRO YEAR..."
                  className="bg-transparent border-none text-luxury-ivory font-serif text-lg md:text-2xl placeholder-luxury-sand/25 w-full uppercase focus:outline-none tracking-wider"
                />
              </div>

              {searchQuery.trim() === "" ? null : (
                <div data-lenis-prevent className="w-full flex-grow overflow-y-auto mt-4 pb-24 min-h-0 pr-4 no-scrollbar overscroll-contain">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <Search className="w-12 h-12 text-white/40 mx-auto" />
                      <h3 className="text-xl font-serif text-white">No items found</h3>
                      <p className="text-xs text-white/70 font-sans max-w-md mx-auto">
                        We couldn't find anything matching "{searchQuery}". Try a different term.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                      {searchResults.map((product) => (
                        <m.div
                          key={product.id}
                          whileHover={{ 
                            y: -12, 
                            boxShadow: "0 25px 50px -12px rgba(159, 126, 105, 0.15)"
                          }}
                          transition={{ duration: 0.4 }}
                          className="bg-luxury-dark rounded-2xl border border-white/10 flex flex-col justify-between transition-colors duration-500 shadow-sm relative overflow-hidden group/card text-left"
                        >
                          <div className="relative w-full aspect-square bg-neutral-100 group">
                            <Link href={`/product/${product.id}`} onClick={() => setSearchOpen(false)}>
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                style={{ objectFit: "cover" }}
                                className="transition-transform duration-[1000ms] ease-out scale-100 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 hidden md:block" />
                            </Link>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setQuickAddProduct(product);
                                setSearchOpen(false);
                              }}
                              className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-luxury-dark text-luxury-ivory hover:bg-luxury-taupe hover:text-luxury-dark text-[10px] tracking-widest uppercase font-semibold rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 backdrop-blur-md z-10"
                            >
                              Quick Add
                            </button>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleWishlist(product.id);
                              }}
                              className="absolute top-3 right-3 md:top-4 md:right-4 p-2 md:p-2.5 bg-luxury-ivory/80 backdrop-blur-md rounded-full text-luxury-dark hover:text-luxury-dark transition-colors duration-300 shadow-sm z-10"
                              aria-label="Add to Wishlist"
                            >
                              <Heart className={`w-4 h-4 transition-colors duration-300 ${wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "hover:text-red-500"}`} />
                            </button>
                          </div>

                          <div className="p-4 md:p-5 md:pt-4 space-y-2 flex-grow flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mt-1">
                                <Link href={`/product/${product.id}`} onClick={() => setSearchOpen(false)} className="block flex-1 min-w-0">
                                  <h3 className="text-[14px] md:text-base font-serif text-white font-medium leading-tight tracking-wide hover:text-luxury-ivory transition-colors duration-300 truncate md:whitespace-normal">
                                    {product.name}
                                  </h3>
                                </Link>
                              </div>
                            </div>

                            <div className="flex justify-between items-end pb-1 border-b border-white/20 pt-1 md:pt-0">
                              <span className="font-serif text-base md:text-lg text-white font-medium">
                                {product.priceStr}
                              </span>
                              <Link
                                href={`/product/${product.id}`}
                                onClick={() => setSearchOpen(false)}
                                className="text-[8px] uppercase tracking-[0.2em] font-semibold text-white/80 hover:text-white flex items-center gap-1 transition-colors duration-300"
                              >
                                Acquire Item <ChevronRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </m.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* B. Wishlist Drawer */}
      <AnimatePresence>
         {wishlistOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setWishlistOpen(false)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end"
            data-lenis-prevent
          >
            <m.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md h-full bg-white p-8 flex flex-col justify-between shadow-2xl relative"
            >
              <button
                onClick={() => setWishlistOpen(false)}
                className="absolute top-8 right-8 text-luxury-dark hover:text-luxury-dark p-2 transition-colors duration-300"
                aria-label="Close Wishlist"
              >
                <X className="w-6 h-6 stroke-[1.5px]" />
              </button>

              <div className="space-y-8 flex-grow">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-luxury-dark font-bold">Top Picks</span>
                  <h3 className="text-3xl font-serif mt-1 text-luxury-dark">My Wishlist</h3>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <Heart className="w-12 h-12 text-luxury-dark mx-auto" />
                    <p className="text-xs uppercase tracking-widest text-luxury-dark font-semibold">Your wishlist is empty</p>
                    <p className="text-[11px] text-luxury-dark font-light font-sans max-w-[240px] mx-auto leading-relaxed">
                      Add premium jerseys to build your collection.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 overflow-y-auto no-scrollbar max-h-[60vh] pr-2">
                    {products.filter(item => wishlist.includes(item.id)).map((item) => (
                      <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-luxury-taupe/10 bg-white/40 justify-between items-center">
                        <div className="flex gap-4 items-center">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                          </div>
                          <div>
                            <h4 className="text-xs font-serif font-bold text-luxury-dark leading-tight">{item.name}</h4>
                            <span className="text-[10px] text-luxury-dark font-serif font-semibold mt-1 block">{item.priceStr}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            addToCart(item, "M");
                            toggleWishlist(item.id);
                          }}
                          className="px-3 py-1.5 bg-luxury-dark hover:bg-luxury-taupe text-luxury-ivory hover:text-luxury-ivory text-[9px] uppercase tracking-widest font-semibold rounded-full transition-all duration-300"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setWishlistOpen(false)}
                className="w-full py-4 border border-luxury-dark text-luxury-dark hover:bg-luxury-dark hover:text-luxury-ivory text-xs uppercase tracking-widest font-semibold rounded-full transition-all duration-300"
              >
                Continue Browsing
              </button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* C. Slide-out Cart Drawer */}
      <AnimatePresence>
         {cartOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end"
            data-lenis-prevent
          >
            <m.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md h-full bg-white p-8 flex flex-col justify-between shadow-2xl relative"
            >
              <button
                onClick={() => setCartOpen(false)}
                className="absolute top-8 right-8 text-luxury-dark hover:text-luxury-dark p-2 transition-colors duration-300"
                aria-label="Close Cart"
              >
                <X className="w-6 h-6 stroke-[1.5px]" />
              </button>

              <div className="space-y-8 flex-grow flex flex-col justify-start">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-luxury-dark font-bold">Your Cart</span>
                  <h3 className="text-3xl font-serif mt-1 text-luxury-dark">Shopping Bag</h3>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-4 my-auto">
                    <ShoppingBag className="w-12 h-12 text-luxury-dark mx-auto" />
                    <p className="text-xs uppercase tracking-widest text-luxury-dark font-semibold">Your bag is empty</p>
                    <p className="text-[11px] text-luxury-dark font-bold font-sans max-w-[240px] mx-auto leading-relaxed">
                     Oops! Your dream jersey is waiting for you.
Browse our collection and bring home your next matchday essential.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 overflow-y-auto no-scrollbar max-h-[55vh] pr-2 flex-grow">
                    {cart.map((item, idx) => (
                      <div key={`${item.id}-${item.size}-${item.customName || ""}-${item.customNumber || ""}-${idx}`} className="flex gap-4 p-4 rounded-xl border border-luxury-taupe/10 bg-white/40 justify-between items-center">
                        <div className="flex gap-4 items-center">
                          <div className="relative w-16 h-20 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-serif font-bold text-luxury-dark leading-tight">{item.name}</h4>
                            <div className="flex gap-2 text-[10px] font-sans text-luxury-dark uppercase font-semibold">
                              <span>Size: {item.size}</span>
                              <span>•</span>
                              <span>₹{(item.price + ((item.customName || item.customNumber) ? 199 : 0)).toFixed(2)}</span>
                            </div>

                            {/* Personalization details */}
                            {(item.customName || item.customNumber) && (
                              <div className="text-[9px] font-mono bg-luxury-dark/5 border border-luxury-taupe/15 px-2 py-0.5 rounded text-luxury-dark mt-1 select-none leading-none">
                                PRINT: <span className="text-luxury-dark font-bold">{item.customName || "NONE"}</span> #{item.customNumber || "00"} (+₹199)
                              </div>
                            )}

                            {/* Quantity controls */}
                            <div className="flex items-center border border-luxury-taupe/20 rounded-full w-20 justify-between px-2 py-0.5 mt-1 bg-white/60">
                              <button onClick={() => updateQuantity(item.id, item.size, -1, item.customName, item.customNumber)} className="text-luxury-dark hover:text-luxury-dark" aria-label="Decrease quantity">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-[10px] font-mono font-bold text-luxury-dark">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.size, 1, item.customName, item.customNumber)} className="text-luxury-dark hover:text-luxury-dark" aria-label="Increase quantity">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, item.size, item.customName, item.customNumber)}
                          className="p-1 hover:text-red-700 text-luxury-dark transition-colors duration-300"
                          aria-label="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="pt-6 border-t border-luxury-taupe/15 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-luxury-dark font-sans font-light uppercase tracking-wider">Subtotal</span>
                    <span className="text-lg font-serif font-bold text-luxury-dark">₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-luxury-dark font-sans font-light leading-snug">
                    {cart.reduce((s, i) => s + i.quantity, 0) >= 4 ? (
                      <span className="text-green-600 font-semibold tracking-wide block mb-1">Eligible for FREE SHIPPING!</span>
                    ) : (
                      <span className="text-luxury-taupe font-semibold tracking-wide block mb-1">
                        Add {4 - cart.reduce((s, i) => s + i.quantity, 0)} more jersey(s) for FREE SHIPPING.
                      </span>
                    )}
                    Shipping charges will be calculated at checkout.
                  </p>
                  <Link
                    href="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="w-full block text-center py-4 bg-luxury-dark text-luxury-ivory hover:bg-luxury-taupe hover:text-luxury-ivory text-xs uppercase tracking-widest font-semibold rounded-full transition-all duration-300"
                  >
                    Checkout
                  </Link>
                </div>
              )}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* D. Quick Add Sizing Overlay Drawer */}
      <AnimatePresence>
        {quickAddProduct && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickAddProduct(null)}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white p-8 rounded-2xl border border-luxury-taupe/20 shadow-2xl relative"
            >
              <button
                onClick={() => setQuickAddProduct(null)}
                className="absolute top-6 right-6 text-luxury-dark hover:text-luxury-dark p-1 transition-colors duration-300"
                aria-label="Close"
              >
                <X className="w-5 h-5 stroke-[1.5px]" />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-luxury-dark font-bold block">Size Selection</span>
                  <h3 className="text-2xl font-serif text-luxury-dark mt-1 leading-tight">{quickAddProduct.name}</h3>
                  <span className="text-base font-serif text-luxury-dark font-bold mt-1 block">{quickAddProduct.priceStr}</span>
                </div>

                <p className="text-xs text-luxury-dark font-sans leading-relaxed font-light">
                  Our Player Version fits slim and athletic. Select a size up for a relaxed fit, or consult the size drawer.
                </p>

                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-luxury-dark font-bold block">Available Standard Sizes</span>
                  <div className="grid grid-cols-5 gap-2">
                    {["S", "M", "L", "XL", "2XL"].map((size) => {
                      const isOutOfStock = (quickAddProduct.inventory?.[size] || 0) <= 0;
                      return (
                      <button
                        key={size}
                        disabled={isOutOfStock}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 rounded-lg border text-xs font-bold font-mono transition-all duration-300 relative overflow-hidden ${
                          isOutOfStock
                            ? "border-gray-200 bg-gray-50 text-gray-400 opacity-60 cursor-not-allowed"
                            : selectedSize === size
                            ? "bg-luxury-dark text-luxury-ivory border-luxury-dark shadow-md"
                            : "border-luxury-taupe/20 bg-white/40 hover:bg-white hover:border-luxury-taupe text-luxury-dark"
                        }`}
                      >
                        {size}
                        {isOutOfStock && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[1.5px] bg-red-500 rotate-45 transform origin-center"></div>
                          </span>
                        )}
                      </button>
                    )})}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => addToCart(quickAddProduct, selectedSize)}
                    disabled={quickAddProduct.inStock === false}
                    className={`flex-grow py-4 text-xs uppercase tracking-widest font-semibold rounded-full transition-all duration-300 ${
                      quickAddProduct.inStock === false
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-luxury-dark text-luxury-ivory hover:bg-luxury-taupe hover:text-luxury-ivory"
                    }`}
                  >
                    {quickAddProduct.inStock === false ? "OUT OF STOCK" : `Add Size ${selectedSize} to Cart`}
                  </button>
                  <button
                    onClick={() => {
                      setQuickAddProduct(null);
                      setSizeGuideOpen(true);
                    }}
                    className="px-6 py-4 border border-luxury-dark/20 text-luxury-dark hover:bg-white rounded-full text-xs font-semibold"
                  >
                    Guide
                  </button>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* E. Sizing Guide Modal */}
      <AnimatePresence>
         {sizeGuideOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSizeGuideOpen(false)}
            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            data-lenis-prevent
          >
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-luxury-dark p-5 md:p-8 rounded-2xl md:rounded-3xl border border-luxury-sand/10 shadow-2xl relative"
            >
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 text-luxury-ivory hover:text-luxury-ivory/80 p-1 transition-colors duration-300 z-10 bg-luxury-dark/50 rounded-full backdrop-blur-md"
                aria-label="Close"
              >
                <X className="w-5 h-5 stroke-[1.5px]" />
              </button>

              <div className="space-y-5 md:space-y-6">
                <div>
                  <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-luxury-ivory/80 font-bold block">📏 Size Chart</span>
                  <h3 className="text-2xl md:text-3xl font-serif text-luxury-ivory mt-1">Jersey Specifications</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 border border-luxury-sand/10 p-3 rounded-lg flex flex-col md:flex-row gap-3 items-start md:items-center justify-between text-[11px] md:text-xs text-luxury-ivory/80 font-medium">
                    <span className="leading-relaxed">NOTE: Player version has a slimmer, athletic fit compared to the standard Fan version.</span>
                    <span className="bg-[#1a1a1a] px-3 py-1 rounded-full border border-luxury-sand/10 text-luxury-ivory whitespace-nowrap">Size in inches & cm</span>
                  </div>

                  {/* Sizing Table */}
                  <div className="overflow-x-auto border border-luxury-sand/10 rounded-xl bg-white/5 backdrop-blur-sm scrollbar-thin scrollbar-thumb-luxury-sand/20 scrollbar-track-transparent pb-1">
                    <table className="w-full min-w-[650px] text-center border-collapse text-[10px] md:text-xs whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-luxury-sand/10 bg-luxury-dark/40 text-luxury-ivory uppercase tracking-wider font-bold">
                          <th className="p-3 border-r border-luxury-sand/10 align-middle" rowSpan={2}>Size</th>
                          <th className="p-3 border-r border-luxury-sand/10 border-b border-luxury-sand/10" colSpan={2}>Height (inches)</th>
                          <th className="p-3 border-r border-luxury-sand/10 border-b border-luxury-sand/10" colSpan={2}>Height (in cm)</th>
                          <th className="p-3 border-r border-luxury-sand/10 border-b border-luxury-sand/10" colSpan={2}>Chest (inches)</th>
                          <th className="p-3 border-b border-luxury-sand/10" colSpan={2}>Chest (in cm)</th>
                        </tr>
                        <tr className="border-b border-luxury-sand/10 bg-luxury-dark/20 text-luxury-ivory tracking-widest text-[10px] uppercase font-semibold">
                          <th className="p-2 border-r border-luxury-sand/10">Fan</th>
                          <th className="p-2 border-r border-luxury-sand/10">Player</th>
                          <th className="p-2 border-r border-luxury-sand/10">Fan</th>
                          <th className="p-2 border-r border-luxury-sand/10">Player</th>
                          <th className="p-2 border-r border-luxury-sand/10">Fan</th>
                          <th className="p-2 border-r border-luxury-sand/10">Player</th>
                          <th className="p-2 border-r border-luxury-sand/10">Fan</th>
                          <th className="p-2">Player</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 text-luxury-ivory font-mono">
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-bold border-r border-luxury-sand/10 font-sans">S</td>
                          <td className="p-3 border-r border-luxury-sand/10">67-69</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">67-69</td>
                          <td className="p-3 border-r border-luxury-sand/10">170-175</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">170-175</td>
                          <td className="p-3 border-r border-luxury-sand/10">38-40</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">36-38</td>
                          <td className="p-3 border-r border-luxury-sand/10">96-101</td>
                          <td className="p-3 text-luxury-ivory">91-96</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-bold border-r border-luxury-sand/10 font-sans">M</td>
                          <td className="p-3 border-r border-luxury-sand/10">69-71</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">69-71</td>
                          <td className="p-3 border-r border-luxury-sand/10">175-180</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">175-180</td>
                          <td className="p-3 border-r border-luxury-sand/10">40-42</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">38-40</td>
                          <td className="p-3 border-r border-luxury-sand/10">101-106</td>
                          <td className="p-3 text-luxury-ivory">96-101</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-bold border-r border-luxury-sand/10 font-sans">L</td>
                          <td className="p-3 border-r border-luxury-sand/10">71-73</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">71-73</td>
                          <td className="p-3 border-r border-luxury-sand/10">180-185</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">180-185</td>
                          <td className="p-3 border-r border-luxury-sand/10">42-44</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">40-42</td>
                          <td className="p-3 border-r border-luxury-sand/10">106-111</td>
                          <td className="p-3 text-luxury-ivory">101-106</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-bold border-r border-luxury-sand/10 font-sans">XL</td>
                          <td className="p-3 border-r border-luxury-sand/10">73-75</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">73-75</td>
                          <td className="p-3 border-r border-luxury-sand/10">185-190</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">185-190</td>
                          <td className="p-3 border-r border-luxury-sand/10">44-46</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">42-44</td>
                          <td className="p-3 border-r border-luxury-sand/10">111-116</td>
                          <td className="p-3 text-luxury-ivory">106-111</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-bold border-r border-luxury-sand/10 font-sans">XXL</td>
                          <td className="p-3 border-r border-luxury-sand/10">75-77</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">75-77</td>
                          <td className="p-3 border-r border-luxury-sand/10">190-195</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">190-195</td>
                          <td className="p-3 border-r border-luxury-sand/10">46-48</td>
                          <td className="p-3 border-r border-luxury-sand/10 text-luxury-ivory">44-46</td>
                          <td className="p-3 border-r border-luxury-sand/10">116-121</td>
                          <td className="p-3 text-luxury-ivory">111-116</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end items-center pt-4 border-t border-luxury-sand/10">
                  <button
                    onClick={() => setSizeGuideOpen(false)}
                    className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-[#0B0B0C] text-[10px] tracking-widest uppercase font-bold rounded-full transition-all duration-300"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
      </LazyMotion>
    </>
  );
}
