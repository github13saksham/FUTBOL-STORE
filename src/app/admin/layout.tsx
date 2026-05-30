"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, UploadCloud, ArrowLeft, Database, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Bulk Upload', href: '/admin/bulk-upload', icon: UploadCloud },
    { name: 'Database', href: '/admin/database', icon: Database },
  ];

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row font-sans pt-[60px] md:pt-0">
      
      {/* Mobile Header (Shows only on small screens) */}
      <div className="md:hidden bg-luxury-dark text-luxury-ivory p-4 flex justify-between items-center fixed top-0 left-0 w-full z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-serif">TFS Admin</h1>
        </div>
        <Link href="/" className="text-xs uppercase tracking-widest text-luxury-taupe flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Store
        </Link>
      </div>

      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-white border-r border-luxury-taupe/20 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-luxury-taupe/20">
          <h1 className="text-2xl font-serif text-luxury-dark tracking-wide">TFS Admin</h1>
          <p className="text-xs text-luxury-taupe mt-1 uppercase tracking-widest">Management Panel</p>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-luxury-dark text-luxury-ivory shadow-md' 
                        : 'text-luxury-dark/70 hover:bg-[#F3F4F6] hover:text-luxury-dark'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>



        <div className="p-6 border-t border-luxury-taupe/20 space-y-3 flex-shrink-0">
          <button 
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              window.location.href = '/admin/login';
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
          >
            Logout Admin
          </button>
          <Link href="/" className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-luxury-dark rounded-lg transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute top-0 left-0 h-full w-64 bg-white flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 flex justify-between items-center border-b border-luxury-taupe/20">
                <h1 className="text-xl font-serif text-luxury-dark tracking-wide">TFS Admin</h1>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-luxury-dark" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-2 px-4">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link 
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? 'bg-luxury-dark text-luxury-ivory shadow-md' 
                              : 'text-luxury-dark/70 hover:bg-[#F3F4F6] hover:text-luxury-dark'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="p-4 border-t border-luxury-taupe/20 space-y-3 flex-shrink-0">
                <button 
                  onClick={async () => {
                    await fetch('/api/admin/logout', { method: 'POST' });
                    window.location.href = '/admin/login';
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                >
                  Logout Admin
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 p-6 pt-10 md:p-10 md:pt-16 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
