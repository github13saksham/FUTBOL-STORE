"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authService } from '@/backend';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'selection' | 'email'>('selection');
  const [emailMode, setEmailMode] = useState<'login' | 'signup'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to home or account page
    if (user && !authLoading) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await authService.loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
      setLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await authService.loginWithApple();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Apple.");
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (emailMode === 'signup') {
        await authService.signupWithEmail(email, password, name);
      } else {
        await authService.loginWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4 pt-28 pb-12 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="w-full max-w-5xl mx-auto z-10 flex flex-col md:flex-row shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden bg-white border border-black/5">
        
        {/* Left Side - Logo Panel */}
        <div className="hidden md:flex md:w-1/2 relative bg-white items-center justify-center p-12 overflow-hidden border-r border-black/5">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01)_0%,rgba(0,0,0,0.03)_100%)]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 w-full max-w-[320px] aspect-square flex items-center justify-center"
          >
            <Image 
              src="/logo.png" 
              alt="The Futbol Store" 
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </div>

        {/* Right Side - Form Panel */}
        <div className="w-full md:w-1/2 bg-[#FAFAFA] p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative">
          <Link href="/" className="absolute top-8 right-8 text-[10px] uppercase tracking-widest font-semibold text-black/40 hover:text-black transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3 h-3" /> Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-sm mx-auto"
          >
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-3xl font-serif text-[#0F0F0F] mb-3">
                {authMode === 'selection' ? 'Welcome' : (emailMode === 'login' ? 'Sign In' : 'Create Account')}
              </h1>
              <p className="text-black/50 font-sans text-sm font-light">
                Secure access for a premium shopping experience.
              </p>
            </div>

            {authMode === 'selection' ? (
              <div className="space-y-4">
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-black/10 text-[#0F0F0F] py-3.5 rounded-lg hover:bg-black/5 transition-all duration-300 font-sans text-sm font-medium shadow-sm disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                <button
                  onClick={handleAppleAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-black text-white py-3.5 rounded-lg hover:bg-black/80 transition-all duration-300 font-sans text-sm font-medium shadow-sm disabled:opacity-50"
                >
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.84 1.5.05 2.78.8 3.59 2.07-3.11 1.9-2.6 5.46.36 6.61-.75 1.83-1.78 3.65-2.53 4.33zm-2.73-14.73c.6-1.53-.16-3.32-1.81-4.05-.59 1.69.41 3.46 1.81 4.05z" />
                  </svg>
                  Continue with Apple
                </button>

                <div className="flex items-center my-6">
                  <div className="flex-grow border-t border-black/10"></div>
                  <span className="px-4 text-[10px] uppercase tracking-widest text-black/40 font-semibold">Or</span>
                  <div className="flex-grow border-t border-black/10"></div>
                </div>

                <button
                  onClick={() => setAuthMode('email')}
                  className="w-full flex items-center justify-center gap-3 bg-[#FAFAFA] border border-black/10 text-black py-3.5 rounded-lg hover:bg-black/5 transition-all duration-300 font-sans text-sm font-medium shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  Continue with Email
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-5">
                <AnimatePresence mode="wait">
                  {emailMode === 'signup' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1">
                      <label className="block text-[11px] uppercase tracking-widest text-black/60 font-semibold mb-2">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <UserIcon className="h-4 w-4 text-black/40" />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-white border border-black/10 rounded-lg focus:border-black/30 focus:ring-1 focus:ring-black/10 focus:outline-none transition-all duration-300 font-sans text-[#0F0F0F] placeholder-black/30 text-sm shadow-sm"
                          placeholder="Lionel Messi"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                  <label className="block text-[11px] uppercase tracking-widest text-black/60 font-semibold mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-black/40" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-black/10 rounded-lg focus:border-black/30 focus:ring-1 focus:ring-black/10 focus:outline-none transition-all duration-300 font-sans text-[#0F0F0F] placeholder-black/30 text-sm shadow-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                  <label className="block text-[11px] uppercase tracking-widest text-black/60 font-semibold mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-black/40" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-black/10 rounded-lg focus:border-black/30 focus:ring-1 focus:ring-black/10 focus:outline-none transition-all duration-300 font-sans text-[#0F0F0F] placeholder-black/30 text-sm shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </motion.div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 bg-[#0F0F0F] text-white py-3.5 rounded-lg hover:bg-black/80 transition-all duration-300 group disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-md"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="font-sans text-sm font-medium">
                        {emailMode === 'login' ? 'Sign In' : 'Create Account'}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode(emailMode === 'login' ? 'signup' : 'login');
                      setError(null);
                    }}
                    className="text-xs text-black/60 hover:text-black transition-colors"
                  >
                    {emailMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('selection');
                      setError(null);
                    }}
                    className="text-black/50 font-medium text-xs hover:text-black transition-colors focus:outline-none flex items-center justify-center gap-1 mx-auto"
                  >
                    <ChevronLeft className="w-3 h-3" /> Back to options
                  </button>
                </div>
              </form>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[#D32F2F] text-xs font-sans mt-6 text-center bg-[#FFEBEE] border border-[#FFCDD2] py-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            
          </motion.div>
        </div>
      </div>
    </div>
  );
}
