"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Instagram, Send, X, Shield, FileText, RefreshCw, Truck, User, HelpCircle
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { POLICIES_DATA } from "@/data/mockData";

export default function Footer() {
  const { activePolicy, setActivePolicy } = useStore();
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const pathname = usePathname();
  const isAccountPage = pathname?.startsWith("/account");
  const isAdminPage = pathname?.startsWith("/admin");
  const shouldHideFooter = isAccountPage || isAdminPage;

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    setActiveFaq(null);
  }, [activePolicy]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmailInput("");
      }, 4000);
    }
  };

  return (
    <>
      {!shouldHideFooter && (
        <footer className="bg-luxury-dark text-luxury-ivory pt-12 pb-12 relative overflow-hidden">
          {/* Global Policy Cards (Shown on all pages except Account) */}
          <div className="max-w-7xl mx-auto px-4 md:px-12 pb-12 md:pb-24 border-b border-white/5 mb-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              <div className="p-4 md:p-8 rounded-2xl border border-luxury-sand/10 bg-[#141414] space-y-2 md:space-y-4">
                <Truck className="w-5 h-5 md:w-6 md:h-6 text-white" />
                <h4 className="text-[9px] md:text-xs uppercase tracking-widest text-white font-bold">PAN INDIA SHIPPING</h4>
                <p className="text-[9px] md:text-xs text-white/70 md:text-white leading-relaxed font-sans font-light">
                  We deliver across India with secure packaging and reliable tracking updates.
                </p>
              </div>
              <div className="p-4 md:p-8 rounded-2xl border border-luxury-sand/10 bg-[#141414] space-y-2 md:space-y-4">
                <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-white" />
                <h4 className="text-[9px] md:text-xs uppercase tracking-widest text-white font-bold">Easy Returns</h4>
                <p className="text-[9px] md:text-xs text-white/70 md:text-white leading-relaxed font-sans font-light">
                  Returns are accepted exclusively for damaged or incorrect items within 24 hours of delivery. Customized jerseys are non-returnable.
                </p>
              </div>
              <div className="p-4 md:p-8 rounded-2xl border border-luxury-sand/10 bg-[#141414] space-y-2 md:space-y-4">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
                <h4 className="text-[9px] md:text-xs uppercase tracking-widest text-white font-bold">Certified Authenticity</h4>
                <p className="text-[9px] md:text-xs text-white/70 md:text-white leading-relaxed font-sans font-light">
                  Every drop represents certified authenticity, with official tag arrays and embedded security holos.
                </p>
              </div>
              <div className="p-4 md:p-8 rounded-2xl border border-luxury-sand/10 bg-[#141414] space-y-2 md:space-y-4">
                <HelpCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                <h4 className="text-[9px] md:text-xs uppercase tracking-widest text-white font-bold">Customer Support</h4>
                <p className="text-[9px] md:text-xs text-white/70 md:text-white leading-relaxed font-sans font-light">
                  Our support team is active to assist you with sizing, custom inquiries, and tracking via Instagram DM or thefutbolstore.in@gmail.com.
                </p>
              </div>
            </div>
          </div>

          {/* Main Footer Links */}
          <div className="hidden md:grid max-w-7xl mx-auto px-6 md:px-12 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pb-4">
          
          {/* Logo column */}
          <div className="col-span-2 flex flex-col items-start space-y-4">
            <div className="flex flex-col items-start">
              <h2 className="text-xl md:text-xl font-serif text-luxury-ivory tracking-widest font-light">
                THE FÚTBOL STORE
              </h2>
              <span className="text-[9px] uppercase tracking-[0.15em] text-luxury-ivory font-bold mt-1.5">
                IT'S ALL ABOUT THE QUALITY
              </span>
            </div>
            <p className="text-[11px] text-luxury-ivory font-sans font-light leading-relaxed max-w-xs">
              A high-fashion luxury collective dedicated to authentic football jersey reproductions, player-specification garments, and off-pitch lifestyle goods. Worn with pride, crafted to last.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-widest text-luxury-ivory font-bold">COLLECTIONS</h4>
            <ul className="text-xs text-luxury-ivory space-y-2 font-sans font-light">
              <li><Link href="/" className="hover:text-luxury-ivory transition-colors duration-300 cursor-pointer block">Home</Link></li>
              <li><Link href="/clubs" className="hover:text-luxury-ivory transition-colors duration-300 cursor-pointer block">Clubs</Link></li>
              <li><Link href="/national-teams" className="hover:text-luxury-ivory transition-colors duration-300 cursor-pointer block">National Teams</Link></li>
              <li><Link href="/national-teams" className="hover:text-luxury-ivory transition-colors duration-300 cursor-pointer block">WC Jerseys</Link></li>
              <li><Link href="/about-us" className="hover:text-luxury-ivory transition-colors duration-300 cursor-pointer block">About Us</Link></li>
            </ul>
          </div>

          {/* Links Column 2: Policies */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-widest text-luxury-ivory font-bold">POLICIES</h4>
            <ul className="text-xs text-luxury-ivory space-y-2 font-sans font-light">
              <li 
                onClick={() => setActivePolicy("privacy-policy")} 
                className="hover:text-luxury-ivory transition-colors duration-300 cursor-pointer"
              >
                Privacy Policy
              </li>
              <li 
                onClick={() => setActivePolicy("terms-of-service")} 
                className="hover:text-luxury-ivory transition-colors duration-300 cursor-pointer"
              >
                Terms of Service
              </li>
              <li 
                onClick={() => setActivePolicy("return-policy")} 
                className="hover:text-luxury-ivory transition-colors duration-300 cursor-pointer"
              >
                Return Policy
              </li>
              <li 
                onClick={() => setActivePolicy("shipping-policy")} 
                className="hover:text-luxury-ivory transition-colors duration-300 cursor-pointer"
              >
                Shipping Policy
              </li>
              <li 
                onClick={() => setActivePolicy("faqs")} 
                className="hover:text-luxury-ivory transition-colors duration-300 cursor-pointer"
              >
                FAQs
              </li>
            </ul>
          </div>

          {/* Links Column 4 */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-widest text-luxury-ivory font-bold">CONTACTS</h4>
            <div className="flex gap-4 pt-1">
              <a 
                href="mailto:thefutbolstore.in@gmail.com" 
                className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 hover:border-red-500 hover:bg-red-500 hover:text-luxury-ivory text-red-400 flex items-center justify-center transition-all duration-300 animate-pulse-subtle"
                aria-label="Email support"
                title="thefutbolstore.in@gmail.com"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a 
                href="https://www.instagram.com/the_futbolstore?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-pink-500/10 border border-pink-500/20 hover:border-transparent hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-luxury-ivory text-pink-400 flex items-center justify-center transition-all duration-300"
                aria-label="Instagram page"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://chat.whatsapp.com/KWrRHklSqb47tIhSJ0EOl5" 
                target="The Futbol Store" 
                rel="Community Link"
                className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-500 hover:text-luxury-ivory text-emerald-400 flex items-center justify-center transition-all duration-300"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Centered copyright line */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 mt-8 border-t border-white/5 text-center">
          <span className="text-[9px] uppercase tracking-[0.2em] text-luxury-ivory font-bold">
            © 2026 THE FÚTBOL STORE INC.
          </span>
        </div>
      </footer>
      )}

      {/* C. Policy Premium Modal Overlay */}
      <AnimatePresence>
        {activePolicy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePolicy(null)}
            className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex justify-center items-center p-4 md:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] bg-[#111] border border-white/20 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative"
            >
              {/* Close Button */}
              <button 
                onClick={() => setActivePolicy(null)}
                className="absolute top-6 right-6 text-luxury-ivory hover:text-luxury-ivory p-2 transition-all duration-300 hover:rotate-90 z-20"
                aria-label="Close Policy"
              >
                <X className="w-6 h-6 stroke-[1.5px]" />
              </button>

              {/* Main Content Area */}
              <div 
                className="flex-grow p-6 md:p-10 overflow-y-auto no-scrollbar bg-[#111] overscroll-contain [&::-webkit-scrollbar]:hidden" 
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                data-lenis-prevent
              >
                {POLICIES_DATA[activePolicy as keyof typeof POLICIES_DATA] && (
                  <motion.div 
                    key={activePolicy}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2 pr-12">
                      <div className="flex items-center gap-2 text-luxury-ivory mb-2">
                        {activePolicy === "privacy-policy" && <Shield className="w-4 h-4" />}
                        {activePolicy === "terms-of-service" && <FileText className="w-4 h-4" />}
                        {activePolicy === "return-policy" && <RefreshCw className="w-4 h-4" />}
                        {activePolicy === "shipping-policy" && <Truck className="w-4 h-4" />}
                        {activePolicy === "faqs" && <HelpCircle className="w-4 h-4" />}
                        {activePolicy === "accessibility-statement" && <User className="w-4 h-4" />}
                        <span className="text-[9px] uppercase tracking-[0.25em] font-bold">Our Policies</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-serif text-luxury-ivory tracking-widest font-light">
                        {POLICIES_DATA[activePolicy as keyof typeof POLICIES_DATA].title.toUpperCase()}
                      </h2>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-luxury-ivory font-bold">
                        {POLICIES_DATA[activePolicy as keyof typeof POLICIES_DATA].subtitle}
                      </p>
                    </div>

                    <div className="h-[1px] bg-luxury-sand/15 w-full my-6" />

                    <div className="space-y-8 pr-2">
                      {activePolicy === "faqs" ? (
                        <div className="space-y-4">
                          {POLICIES_DATA["faqs"].sections.map((section, sIdx) => (
                            <div key={sIdx} className="border-b border-luxury-sand/10 pb-4">
                              <button
                                onClick={() => setActiveFaq(activeFaq === sIdx ? null : sIdx)}
                                className="w-full flex justify-between items-center text-left py-2 font-serif text-base text-luxury-ivory hover:text-luxury-ivory transition-colors duration-300"
                              >
                                <span>{section.title}</span>
                                <span className="text-lg text-luxury-ivory font-mono ml-4">
                                  {activeFaq === sIdx ? "—" : "+"}
                                </span>
                              </button>
                              <AnimatePresence initial={false}>
                                {activeFaq === sIdx && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 0.8 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="overflow-hidden"
                                  >
                                    <p className="text-xs font-sans font-light text-luxury-ivory pt-2 leading-relaxed whitespace-pre-line">
                                      {section.content}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      ) : (
                        POLICIES_DATA[activePolicy as keyof typeof POLICIES_DATA].sections.map((section, sIdx) => (
                          <div key={sIdx} className="space-y-3">
                            <h4 className="text-[11px] uppercase tracking-[0.15em] text-luxury-ivory font-bold flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-luxury-sand block" />
                              {section.title}
                            </h4>
                            <p className="text-[12px] text-luxury-ivory leading-relaxed font-sans font-light whitespace-pre-line">
                              {section.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
