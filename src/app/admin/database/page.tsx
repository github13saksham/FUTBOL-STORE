"use client";

import React, { useState } from 'react';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';
import { AlertCircle, Loader2, CheckCircle, Database } from 'lucide-react';

export default function DatabaseManagementPage() {
  const [clearStatus, setClearStatus] = useState<'idle' | 'confirm' | 'clearing' | 'success' | 'error'>('idle');
  const [confirmType, setConfirmType] = useState<'all' | 'national' | 'club'>('all');
  const [errorMessage, setErrorMessage] = useState('');

  const dbService = new FirebaseDatabaseService();

  const handleClearDatabase = async () => {
    setClearStatus('clearing');
    try {
      if (confirmType === 'all') {
        await dbService.clearDatabase();
      } else {
        await dbService.clearProductsBySection(confirmType);
      }
      setClearStatus('success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || 'Failed to clear database.');
      setClearStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-luxury-dark mb-2 flex items-center gap-3">
          <Database className="w-8 h-8" /> Database Management
        </h1>
        <p className="text-luxury-taupe text-sm">Manage your store's underlying data and perform bulk operations.</p>
      </div>

      <div className="bg-red-50 p-8 rounded-xl border border-red-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-bl-[100px] -z-0" />
        
        <h3 className="text-xl font-serif text-red-800 mb-3 relative z-10 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> Danger Zone
        </h3>
        <p className="text-sm text-red-800/80 mb-6 relative z-10">
          Wiping the database will permanently delete items from your live store. This cannot be undone!
        </p>
        
        <div className="relative z-10">
          {clearStatus === 'idle' && (
            <div className="flex flex-col gap-3 max-w-md">
              <button 
                onClick={() => { setConfirmType('national'); setClearStatus('confirm'); }}
                className="px-6 py-2.5 bg-white border border-red-300 text-red-600 text-sm font-bold rounded hover:bg-red-50 transition-colors text-left"
              >
                Clear National Teams Only
              </button>
              <button 
                onClick={() => { setConfirmType('club'); setClearStatus('confirm'); }}
                className="px-6 py-2.5 bg-white border border-red-300 text-red-600 text-sm font-bold rounded hover:bg-red-50 transition-colors text-left"
              >
                Clear Club Jerseys Only
              </button>
              <button 
                onClick={() => { setConfirmType('all'); setClearStatus('confirm'); }}
                className="px-6 py-2.5 bg-red-100 border border-red-400 text-red-700 text-sm font-bold rounded hover:bg-red-200 transition-colors text-left mt-2"
              >
                Wipe Entire Database
              </button>
            </div>
          )}

          {clearStatus === 'confirm' && (
            <div className="flex flex-col gap-3 bg-white p-6 rounded-lg shadow-sm border border-red-200 max-w-md">
              <span className="text-sm font-bold text-red-600">
                Are you absolutely sure you want to {
                  confirmType === 'all' ? 'wipe the ENTIRE database' : 
                  confirmType === 'national' ? 'clear all National Teams' : 'clear all Club Jerseys'
                }?
              </span>
              <div className="flex gap-3 mt-2">
                <button 
                  onClick={handleClearDatabase}
                  className="px-6 py-2 bg-red-600 text-white text-sm font-bold rounded shadow hover:bg-red-700 transition-colors flex-1"
                >
                  Yes, Delete
                </button>
                <button 
                  onClick={() => setClearStatus('idle')}
                  className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded hover:bg-gray-200 transition-colors flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {clearStatus === 'clearing' && (
            <div className="flex items-center gap-3 text-red-600 font-medium">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Deleting...</span>
            </div>
          )}

          {clearStatus === 'success' && (
            <div className="flex items-center gap-3 text-green-600 font-medium bg-green-50 p-4 rounded-lg border border-green-200 inline-flex">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Operation successful! Reloading...</span>
            </div>
          )}

          {clearStatus === 'error' && (
            <div className="text-red-600 text-sm font-medium mt-2 bg-red-50 p-4 rounded-lg border border-red-200 inline-block">
              Error: {errorMessage}
              <button onClick={() => setClearStatus('idle')} className="ml-4 underline font-bold">Try Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
