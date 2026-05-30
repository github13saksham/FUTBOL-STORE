"use client";

import React, { useState } from 'react';
import { uploadMockData } from '@/utils/uploadMockData';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function SeedDatabasePage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    setStatus('loading');
    setMessage('Uploading products and clubs to Firestore...');
    
    try {
      await uploadMockData();
      setStatus('success');
      setMessage('Successfully uploaded all data to your real Firebase database!');
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setMessage(error.message || 'An error occurred during upload.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-ivory pt-24 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-luxury-taupe/20 text-center">
        <h1 className="text-2xl font-serif text-luxury-dark mb-4">Database Setup</h1>
        <p className="text-luxury-taupe font-sans text-sm mb-8">
          Click the button below to push all your mock products and clubs directly into your live Firebase Firestore database.
        </p>

        {status === 'idle' && (
          <button
            onClick={handleUpload}
            className="w-full bg-luxury-charcoal text-luxury-ivory py-3 rounded hover:bg-luxury-dark transition-colors font-sans uppercase tracking-widest text-xs font-bold"
          >
            Push Data to Firebase
          </button>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center text-luxury-dark">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm font-sans">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center text-green-600">
            <CheckCircle className="w-12 h-12 mb-4" />
            <p className="text-sm font-sans text-luxury-dark">{message}</p>
            <p className="text-xs text-luxury-taupe mt-4">You can now safely delete this page.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center text-red-600">
            <AlertCircle className="w-12 h-12 mb-4" />
            <p className="text-sm font-sans">{message}</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-6 border border-luxury-taupe px-6 py-2 rounded text-xs uppercase text-luxury-dark"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
