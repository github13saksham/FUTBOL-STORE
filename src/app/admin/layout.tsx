"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ArrowLeft, Menu, X, ShoppingBag, LayoutTemplate, LogOut, Ticket, Database, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    
    const dbService = new FirebaseDatabaseService();
    const unsubscribe = dbService.listenToAllOrders((orders) => {
      const count = orders.filter((o: any) => o.status === 'New Order').length;
      setNewOrderCount(count);
    });
    
    return () => unsubscribe();
  }, [pathname]);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, badge: newOrderCount > 0 ? newOrderCount : undefined },
    { name: 'Products', href: '/admin/products', icon: Package, alert: true }, // Mock alert for low stock
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Homepage Manager', href: '/admin/homepage', icon: LayoutTemplate },
    { name: 'Database', href: '/admin/database', icon: Database },
  ];

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  const NavContent = () => (
    <>
      <div className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-black text-white font-medium' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-black font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-black' : 'bg-black text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.alert && !item.badge && (
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-100 space-y-2 flex-shrink-0">
        <Link href="/" className="flex items-center gap-3 w-full py-2.5 px-3 text-gray-500 hover:bg-gray-100 hover:text-black rounded-lg transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full py-2.5 px-3 text-gray-500 hover:bg-gray-100 hover:text-black rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout Admin
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row font-sans pt-[60px] md:pt-0 selection:bg-black selection:text-white">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center fixed top-0 left-0 w-full z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="text-black">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold tracking-tight text-black">THE FÚTBOL STORE</h1>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">FS</span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-black">THE FÚTBOL STORE</h1>
          </div>
        </div>
        <NavContent />
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute top-0 left-0 h-full w-64 bg-white flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">FS</span>
                  </div>
                  <h1 className="text-sm font-bold tracking-tight text-black">TFS ADMIN</h1>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <NavContent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="h-full min-h-screen p-4 md:p-8 lg:p-10"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
