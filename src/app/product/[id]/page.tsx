"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, ShoppingBag, Ruler, Check, ChevronRight,
  ArrowRight, ShieldCheck, Truck, RefreshCw, Sparkles, ArrowLeft,
  Minus, Plus, Shield, CreditCard, ChevronDown
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { Product, BEST_SELLERS, CLUB_PRODUCTS } from "@/data/mockData";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const {
    products,
    isLoadingData,
    cart,
    wishlist,
    toggleWishlist,
    addToCart,
    setSizeGuideOpen
  } = useStore();

  // Find product
  const product = products.find((p) => p.id === id) || [...BEST_SELLERS, ...CLUB_PRODUCTS].find((p) => p.id === id);

  if (isLoadingData) {
    return (
      <div className="min-h-screen text-luxury-ivory bg-[#0B0B0C] flex flex-col items-center justify-center pt-32 px-6">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Fallback if product not found
  if (!product) {
    return (
      <div className="min-h-screen text-luxury-ivory bg-[#0B0B0C] flex flex-col items-center justify-center pt-32 px-6">
        <h2 className="text-3xl font-serif font-light mb-4 text-white">Vault Allocation Issue</h2>
        <p className="text-sm font-sans mb-8 text-white/70">This jersey is currently locked or does not exist in our collections.</p>
        <Link
          href="/"
          className="px-8 py-3 bg-luxury-dark text-luxury-ivory rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-white hover:text-black transition-colors duration-300"
        >
          Return to Collections
        </Link>
      </div>
    );
  }

  // Local state for product custom settings
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [showPersonalisation, setShowPersonalisation] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>("");
  const [customNumber, setCustomNumber] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  
  // Pincode checker state
  const [pincode, setPincode] = useState<string>("");
  const [pincodeStatus, setPincodeStatus] = useState<{ type: "success" | "error" | null, msg: string }>({ type: null, msg: "" });

  // Accordion state
  const [activeTab, setActiveTab] = useState<string | null>("specs");

  // Filter recommendations (excluding current product) and ensure diversity
  const recommendations = useMemo(() => {
    if (!product || products.length === 0) return [];
    
    const getPrefix = (name: string) => {
      const w = name.toUpperCase().split(' ');
      if (['REAL', 'MANCHESTER', 'AC', 'FC', 'PARIS'].includes(w[0]) && w.length > 1) {
        return w[0] + ' ' + w[1];
      }
      return w[0];
    };
    
    // Deterministic pseudo-random sort to prevent hydration mismatch
    const hashString = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
      return hash;
    };

    const pool = products.filter(p => p.id !== product.id);
    const shuffled = [...pool].sort((a, b) => hashString(a.id + product.id) - hashString(b.id + product.id));
    
    const res: typeof products = [];
    const used = new Set<string>();
    
    // First pass: try to get completely unique teams
    for (const p of shuffled) {
      if (res.length >= 3) break;
      const pre = getPrefix(p.name);
      if (!used.has(pre)) {
        used.add(pre);
        res.push(p);
      }
    }
    
    // Second pass: fill remaining slots if needed
    for (const p of shuffled) {
      if (res.length >= 3) break;
      if (!res.find(r => r.id === p.id)) {
        res.push(p);
      }
    }
    
    return res;
  }, [products, product]);

  const handleAddToCart = () => {
    // Add to cart with custom options
    const printName = showPersonalisation && customName.trim() ? customName.toUpperCase() : undefined;
    const printNumber = showPersonalisation && customNumber.trim() ? customNumber : undefined;
    addToCart(product, selectedSize, printName, printNumber, quantity);
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeStatus({ type: "error", msg: "Invalid Indian Pincode. Must be 6 digits." });
      return;
    }

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    const formattedDate = deliveryDate.toLocaleDateString('en-IN', dateOptions);

    setPincodeStatus({
      type: "success",
      msg: `Your Estimated delivery date is: ${formattedDate}.`
    });
  };

  return (
    <div className="min-h-screen text-luxury-ivory bg-[#0B0B0C] pt-32 pb-24 selection:bg-white selection:text-black">
      {/* 1. Breadcrumbs / Return Link */}
      <nav className="max-w-6xl mx-auto px-6 md:px-12 mb-8 flex justify-between items-center text-[10px] uppercase tracking-widest font-semibold text-white/90">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 hover:text-white transition-colors duration-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return
        </button>
        <div className="flex gap-1 items-center">
          <span>Collections</span>
          <ChevronRight className="w-3 h-3 text-white/50" />
          <span>{product.category.split(" ")[0]}</span>
        </div>
      </nav>

      {/* 2. Main Visual Layout Container */}
      <main className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="grid md:grid-cols-12 gap-10 items-start">
          
          {/* A. Product Image Card Showcase (Left on Desktop, Top on Mobile) */}
          <div className="md:col-span-7 flex justify-center w-full">
            <motion.div
              initial={{ opacity: 1, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative w-full aspect-square bg-[#141415] rounded-3xl overflow-hidden border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center p-8"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                style={{ objectFit: "contain" }}
                className="p-8 object-center"
                quality={100}
                priority
              />

              {/* Wishlist Icon */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 p-2.5 bg-luxury-ivory/80 backdrop-blur-md rounded-full text-luxury-dark hover:text-white transition-colors duration-300 shadow-sm z-10"
                aria-label="Add to wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${wishlist.includes(product.id) ? "fill-white text-white" : ""}`} />
              </button>
            </motion.div>
          </div>

          {/* B. Details & Cart Actions Block (Right on Desktop, Bottom on Mobile) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Stock Urgency Alert Indicator */}
            {product.inStock === false && (
              <div className="inline-block bg-red-900/80 border border-red-500/50 text-red-100 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded mb-2">
                Out of Stock
              </div>
            )}

            {/* Title & Price */}
            <div className="space-y-1 text-left">
              <h1 className="text-2xl md:text-3xl font-serif font-medium text-white tracking-wide uppercase leading-tight">
                {product.name}
              </h1>
              <span className="text-xl font-serif font-semibold text-white block">
                ₹{product.price.toFixed(0)}
              </span>
            </div>

            {/* Size Selection Grid */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-semibold text-white/50">
                <span className="flex items-center gap-1">
                  size
                </span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-[#cda491] hover:text-white font-bold tracking-widest text-xs flex items-center gap-1.5 transition-colors duration-300"
                >
                  <span className="text-sm">📏</span> Size Chart
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {["S", "M", "L", "XL", "2XL"].map((size) => {
                  const isOutOfStock = product.inventory?.[size] === 0;
                  
                  return (
                    <div key={size} className="flex flex-col items-center gap-1">
                      <button
                        disabled={isOutOfStock}
                        onClick={() => setSelectedSize(size)}
                        className={`w-full h-9 flex items-center justify-center rounded font-bold font-mono text-xs transition-all duration-300 border relative overflow-hidden ${
                          isOutOfStock
                            ? "border-white/10 text-white/30 cursor-not-allowed bg-transparent"
                            : selectedSize === size
                            ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            : "bg-transparent text-white border-white/30 hover:border-white"
                        }`}
                      >
                        {size}
                        {isOutOfStock && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[1px] bg-red-500 rotate-45 transform origin-center"></div>
                          </span>
                        )}
                      </button>
                    
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expandable Add Personalisation Button */}
            <div className="space-y-2 relative">
             
              
              <button
                onClick={() => setShowPersonalisation(!showPersonalisation)}
                className="w-full flex justify-between items-center h-10 px-5 rounded border border-white/30 hover:border-white transition-colors duration-300 text-xs font-semibold"
              >
                <span>ADD PERSONALISATION</span>
                <motion.div
                  animate={{ rotate: showPersonalisation ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight className={`w-4 h-4 ${showPersonalisation ? "text-white" : "text-white/50"}`} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {showPersonalisation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden relative z-10"
                  >
                    <div className="p-5 border   rounded-lg space-y-4 mt-2 ">
                      <div className="space-y-1">
                        <p className="text-[10px] text-white/80 uppercase tracking-widest font-semibold leading-relaxed">
                          Personalise your jersey with your preferred name and number for just Rs. 199.
                        </p>
                        <p className="text-[9px] text-red-400 font-medium">
                          Please enter your details carefully before placing your order.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-semibold text-white/40 block">Name</label>
                          <input
                            type="text"
                            maxLength={12}
                            placeholder="Enter Name"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                            className="w-full px-3 py-1.5 border border-white/10 rounded text-xs bg-black/50 uppercase font-semibold text-white placeholder-white/20 focus:outline-none focus:border-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-semibold text-white/40 block">Number</label>
                          <input
                            type="text"
                            maxLength={2}
                            placeholder="10"
                            value={customNumber}
                            onChange={(e) => setCustomNumber(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-3 py-1.5 border border-white/10 rounded text-xs bg-black/50 text-center font-bold text-white placeholder-white/20 focus:outline-none focus:border-white"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quantity Selector & Action CTA Button */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center border border-white/10 rounded h-10 px-4 justify-between w-28 bg-white/5 backdrop-blur-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                  className="text-white/50 hover:text-white transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="text-white/50 hover:text-white transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.inStock === false}
                className={`group flex-grow flex items-center justify-between h-10 px-5 rounded text-xs uppercase tracking-widest font-bold transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] ${
                  product.inStock === false
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed shadow-none"
                    : "bg-white hover:bg-neutral-200 text-[#0B0B0C]"
                }`}
              >
                <span className="flex-grow text-center">{product.inStock === false ? "OUT OF STOCK" : "Add to Bag"}</span>
                {product.inStock !== false && (
                  <span className="p-2 border border-[#0B0B0C]/20 rounded flex items-center justify-center bg-[#0B0B0C]/5 group-hover:bg-[#0B0B0C]/10 transition-colors">
                    <ShoppingBag className="w-4 h-4 stroke-[2px]" />
                  </span>
                )}
              </button>
            </div>

            {/* Delivery/Pincode Checker Section */}
            <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-white/90">
                <Truck className="w-4 h-4 text-white" />
                <span>PLEASE ENTER YOUR PIN CODE TO CHECK ESTIMATE DELIVERY TIME</span>
              </div>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode (e.g. 110001)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  className="flex-grow px-3 py-1.5 border border-white/10 rounded text-xs bg-black/50 font-mono text-white placeholder-white/30 focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white text-[#0B0B0C] hover:bg-neutral-200 rounded text-xs uppercase font-bold transition-all"
                >
                  Check
                </button>
              </form>
              {pincodeStatus.type && (
                <div className={`text-[10px] leading-relaxed p-2 rounded ${pincodeStatus.type === "success" ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" : "bg-red-500/10 text-red-700 border border-red-500/20"}`}>
                  {pincodeStatus.msg}
                </div>
              )}
            </div>

            {/* Dynamic Product Specification Tabs Accordions */}
            <div className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden divide-y divide-white/10">
              
              {/* Tab 1: specifications */}
              <div>
                <button
                  onClick={() => setActiveTab(activeTab === "specs" ? null : "specs")}
                  className="w-full flex justify-between items-center py-3 px-4 text-[10px] uppercase font-bold tracking-wider text-white bg-transparent hover:bg-white/5 transition-all text-left"
                >
                  <span>Product Description</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeTab === "specs" ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {activeTab === "specs" && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-black/20"
                    >
                      <p className="text-xs text-white/60 leading-relaxed font-sans font-light p-4 whitespace-pre-line border-t border-white/10">
                        {product.desc}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tab 2: Prepaid Payment Info */}
              <div>
                <button
                  onClick={() => setActiveTab(activeTab === "payments" ? null : "payments")}
                  className="w-full flex justify-between items-center py-3 px-4 text-[10px] uppercase font-bold tracking-wider text-white bg-transparent hover:bg-white/5 transition-all text-left"
                >
                  <span>Payment & Dispatch Policy</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeTab === "payments" ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {activeTab === "payments" && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-black/20"
                    >
                      <div className="text-xs text-white/60 leading-relaxed font-sans font-light p-4 space-y-2 border-t border-white/10">
                        <div className="flex gap-2 items-start text-red-400 bg-red-500/10 p-2.5 rounded border border-red-500/20">
                          <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[9px] uppercase tracking-widest block">COD is Strictly Unavailable</span>
                            <span>Cash on Delivery is not supported. We only accept secure pre-paid methods (UPI, Card, Wallets) to protect customized name & number jersey allocations.</span>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center text-white/70 pt-1">
                          <CreditCard className="w-4 h-4 text-white" />
                          <span>100% encrypted, secure prepaid payment gateways active.</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>
        </div>

        {/* C. Exclusive Pairings recommended collection */}
        <div className="border-t border-white/10 pt-12 space-y-6">
          <div className="text-left">
           
            <h2 className="text-xl font-serif text-white mt-0.5  font-light leading-none">
              You May Also Like
            </h2>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory no-scrollbar">
            {recommendations.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.id}`}
                className="w-[55%] sm:w-[45%] md:w-auto shrink-0 snap-start bg-luxury-dark rounded-2xl border border-white/10 flex flex-col justify-between transition-colors duration-500 shadow-sm relative overflow-hidden group"
              >
                {/* Image Display */}
                <div className="relative w-full aspect-square bg-neutral-100 group-hover:bg-neutral-200 transition-colors">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 hidden md:block" />
                </div>

                {/* Specifications */}
                <div className="p-4 md:p-5 md:pt-4 space-y-2 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mt-1">
                      <div className="block flex-1 min-w-0">
                        <h3 className="text-[14px] md:text-base font-serif text-white font-medium leading-tight tracking-wide group-hover:text-luxury-ivory transition-colors duration-300 truncate md:whitespace-normal">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end pb-1 border-b border-white/20 pt-1 md:pt-0">
                    <span className="font-serif text-base md:text-lg text-white font-medium">
                      ₹{item.price.toFixed(2)}
                    </span>
                    <span className="flex text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-semibold text-white/80 group-hover:text-white items-center gap-1 transition-colors duration-300">
                      View Item <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>

    </div>
  );
}
