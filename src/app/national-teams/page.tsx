"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronRight, Sparkles, ChevronDown, ShieldAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useStore } from "@/context/StoreContext";

export default function NationalTeamsPage() {
  const { products, wishlist, toggleWishlist, setQuickAddProduct } = useStore();
  const [versionFilter, setVersionFilter] = useState<string>("player");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const team = params.get("team");
      if (team) {
        setSelectedTeam(team);
      }
    }
  }, []);

  const nationalTeamProducts = products.filter(p => p.club && p.club.toLowerCase() === "national team");

  const filteredProducts = nationalTeamProducts.filter(p => 
        (p.category.toLowerCase().includes(versionFilter.toLowerCase()) || 
        p.name.toLowerCase().includes(versionFilter.toLowerCase())) &&
        (!selectedTeam || p.name.toUpperCase().includes(selectedTeam.toUpperCase()))
      );

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTeam, versionFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen flex flex-col text-luxury-dark bg-[#FFEEE2] pt-40 selection:bg-luxury-taupe selection:text-luxury-ivory">
      
      {/* 1. Page Header Section */}
      <section className="w-full max-w-7xl mx-auto px-6 md:px-12 mb-8 relative z-10 flex justify-start">
        <div className="absolute right-[5%] top-[-20%] w-[350px] h-[350px] bg-luxury-cream/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="w-full  space-y-4 flex flex-col items-start text-left">
          <span className="text-[12px]  uppercase tracking-[0.3em] text-luxury-dark font-bold block">
            ACTIVE RELEASE
          </span>
          <h1 className="text-5xl md:text-8xl font-serif font-light text-luxury-dark tracking-tight leading-none">
            National <span className="italic font-medium text-luxury-dark">Teams</span>
          </h1>
        </div>
      </section>

    

      <section className="w-full max-w-7xl mx-auto px-6 md:px-12 flex justify-end md:justify-start">
        <div className="w-full relative flex justify-end md:justify-start pb-6 border-b border-luxury-taupe/15">
          <div className="relative flex items-center gap-3">
            <span className="text-[10px] md:text-xs uppercase tracking-widest font-semibold text-luxury-dark">
              Jersey Type:
            </span>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex justify-between items-center w-40 md:w-64 rounded-full border border-luxury-taupe/30 bg-white/40 px-4 py-2 md:px-6 md:py-3 text-[10px] md:text-xs uppercase tracking-widest font-semibold text-luxury-dark shadow-sm hover:bg-white focus:outline-none transition-colors duration-300"
            >
              {versionFilter === "player" ? "Player Version" : "Fan Version"}
              <ChevronDown className={`-mr-1 ml-2 h-4 w-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
          </div>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 md:left-0 z-10 mt-2 w-40 md:w-64 rounded-2xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden"
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      setVersionFilter("player");
                      setIsDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 md:px-6 md:py-3 text-[10px] md:text-xs uppercase tracking-widest font-semibold transition-colors duration-200 ${versionFilter === "player" ? "bg-luxury-dark text-luxury-ivory" : "text-luxury-dark hover:bg-luxury-taupe/10"}`}
                  >
                    Player Version
                  </button>
                  <button
                    onClick={() => {
                      setVersionFilter("fan");
                      setIsDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 md:px-6 md:py-3 text-[10px] md:text-xs uppercase tracking-widest font-semibold transition-colors duration-200 ${versionFilter === "fan" ? "bg-luxury-dark text-luxury-ivory" : "text-luxury-dark hover:bg-luxury-taupe/10"}`}
                  >
                    Fan Version
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 4. Products Grid */}
      <div className="w-full flex-grow bg-[#121212] pt-16 pb-24">
        <section className="max-w-7xl mx-auto px-6 md:px-12">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <ShieldAlert className="w-12 h-12 text-white/40 mx-auto" />
              <h3 className="text-xl font-serif text-white">No active items in this collection</h3>
              <p className="text-xs text-white/70 font-sans max-w-md mx-auto">
                We release items seasonally. Tap "All Versions" to check our active collections.
              </p>
            </div>
          ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 bg-[#121212] md:bg-transparent border-t border-[#121212] md:border-transparent">
            {paginatedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                whileHover={{ 
                  y: -12, 
                  boxShadow: "0 25px 50px -12px rgba(159, 126, 105, 0.15)"
                }}
                transition={{ duration: 0.4 }}
                className="bg-luxury-dark rounded-2xl border border-white/10 flex flex-col justify-between transition-colors duration-500 shadow-sm relative overflow-hidden group/card text-left"
              >
                {/* Image Container with zoom overlay */}
                <div className="relative w-full aspect-square bg-neutral-100 group">
                  <Link href={`/product/${product.id}`}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority={index < 4}
                    />
                    
                    {/* Overlay with subtle shadow */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 hidden md:block" />
                  </Link>

                  {/* Tags Container */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-20 pointer-events-none">
                    {product.visibility?.newArrival && (
                      <div className="bg-white text-black text-[8px] md:text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded shadow-sm w-max">
                        New Arrival
                      </div>
                    )}
                    {product.visibility?.bestSeller && (
                      <div className="bg-luxury-taupe text-white text-[8px] md:text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded shadow-sm w-max">
                        Best Seller
                      </div>
                    )}
                    {product.visibility?.featured && (
                      <div className="bg-black text-white text-[8px] md:text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded shadow-sm border border-white/20 w-max">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setQuickAddProduct(product);
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

                {/* Text Specifications */}
                <div className="p-4 md:p-5 md:pt-4 space-y-2 flex-grow flex flex-col justify-between">
                  <div>
                  <div>
                    <div className="flex justify-between items-start mt-1 md:mt-0">
                      <Link href={`/product/${product.id}`} className="block flex-1 min-w-0">
                        <h3 className="text-[14px] md:text-base font-serif text-white font-medium md:mt-1 leading-tight tracking-wide hover:text-luxury-ivory transition-colors duration-300 truncate md:whitespace-normal">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  <div className="flex justify-between items-end pb-1 border-b border-white/20 pt-1 md:pt-0">
                    <span className="font-serif text-base md:text-lg text-white font-medium">{product.priceStr}</span>
                    <Link
                      href={`/product/${product.id}`}
                      className="flex text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-semibold text-white/80 hover:text-white items-center gap-1 transition-colors duration-300"
                    >
                      Acquire Item <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-12">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-6 py-2 border border-luxury-taupe/30 text-white rounded-full disabled:opacity-50 hover:bg-white hover:text-black transition-colors"
              >
                Previous
              </button>
              <span className="text-white font-serif">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-6 py-2 border border-luxury-taupe/30 text-white rounded-full disabled:opacity-50 hover:bg-white hover:text-black transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
        )}
        </section>
      </div>

    </div>
  );
}
