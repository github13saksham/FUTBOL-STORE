"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FirebaseAuthService } from '@/backend/firebase/auth.service';
import { auth } from '@/backend/firebase/config';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const authService = new FirebaseAuthService();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Authenticate with Firebase first
      await authService.loginWithEmail(email, password);
      
      // 2. Get the Firebase ID token
      const idToken = await auth.currentUser?.getIdToken();
      
      if (!idToken) {
        throw new Error("Failed to retrieve authentication token.");
      }

      // 3. Send token to our Next.js backend to set the session cookie
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-dark px-4 py-12 relative overflow-hidden">
      {/* Cinematic Background Spotlights */}
      <div className="absolute right-[10%] top-[15%] w-[500px] h-[500px] bg-luxury-taupe/15 rounded-full blur-[100px] z-0 animate-pulse-subtle" />
      <div className="absolute left-[-5%] bottom-[-5%] w-[400px] h-[400px] bg-luxury-sage/20 rounded-full blur-[80px] z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-[#141414] rounded-2xl border border-luxury-sand/10 shadow-2xl relative z-10 p-8 sm:p-10"
      >
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-luxury-sand/20 shadow-[0_0_30px_rgba(205,164,145,0.1)]">
            <Shield className="w-8 h-8 text-luxury-ivory" />
          </div>
          <h1 className="text-3xl font-serif text-white tracking-wide">Admin Portal</h1>
          <p className="text-xs text-luxury-ivory/60 mt-3 uppercase tracking-widest font-sans">Restricted Access Area</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/30 rounded text-red-200 text-sm text-center font-sans">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-ivory/80 font-bold block ml-1">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-luxury-ivory/50" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-luxury-sand/20 rounded-xl text-white placeholder-luxury-ivory/30 outline-none focus:border-luxury-ivory focus:bg-black/70 transition-all font-sans text-sm"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-ivory/80 font-bold block ml-1">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-luxury-ivory/50" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-luxury-sand/20 rounded-xl text-white placeholder-luxury-ivory/30 outline-none focus:border-luxury-ivory focus:bg-black/70 transition-all font-sans text-sm"
                  placeholder="Enter access code"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-luxury-sand text-black hover:bg-white text-xs uppercase tracking-widest font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Authenticate'}
          </button>

          <div className="pt-6 mt-6 border-t border-luxury-sand/10 text-center">
            <Link href="/" className="text-[10px] uppercase tracking-widest text-luxury-ivory/50 hover:text-luxury-ivory transition-colors">
              &larr; Return to Storefront
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
