"use client";

import React, { useState, useEffect } from 'react';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';
import { Product } from '@/data/mockData';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/backend/firebase/config';
import { 
  Sparkles, Search, Save, Loader2, Check, Percent, IndianRupee, 
  ArrowRight, ShieldAlert, Tag, Filter, CheckSquare, Square
} from 'lucide-react';

export default function DiwaliOfferPricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [festivalEnabled, setFestivalEnabled] = useState(false);
  const [togglingFestival, setTogglingFestival] = useState(false);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'player' | 'fan'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'club' | 'national'>('all');
  const [offerOnlyFilter, setOfferOnlyFilter] = useState(false);

  // Bulk edit values
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState<string>('25');
  const [bulkBadgeText, setBulkBadgeText] = useState<string>('DIWALI SPECIAL');

  // Modified products state tracking
  // Keyed by product.id -> partial Diwali fields
  const [itemsState, setItemsState] = useState<Record<string, {
    enabled: boolean;
    discountPrice: number;
    comparePrice: number;
    badgeText: string;
    dirty?: boolean;
  }>>({});

  const dbService = new FirebaseDatabaseService();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch festival global setting
      const settingsSnap = await getDoc(doc(db, 'settings', 'homepage'));
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setFestivalEnabled(data?.festival?.enabled !== false);
      } else {
        setFestivalEnabled(true);
      }

      // 2. Fetch products
      const prods = await dbService.getProducts();
      setProducts(prods || []);

      // 3. Initialize itemsState from product data
      const initialMap: Record<string, any> = {};
      (prods || []).forEach((p: Product) => {
        const d = p.diwaliOffer || {};
        const isEnabled = Boolean(d.enabled);
        const originalPrice = p.price || 999;
        const compPrice = d.comparePrice || p.comparePrice || Math.round(originalPrice * 1.4);
        const discPrice = d.discountPrice || Math.round(originalPrice * 0.8);
        const badge = d.badgeText || 'DIWALI SPECIAL';

        initialMap[p.id] = {
          enabled: isEnabled,
          discountPrice: discPrice,
          comparePrice: compPrice,
          badgeText: badge,
          dirty: false
        };
      });
      setItemsState(initialMap);
    } catch (e) {
      console.error("Failed to load diwali offer data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFestival = async () => {
    if (togglingFestival) return;
    setTogglingFestival(true);
    const newStatus = !festivalEnabled;
    try {
      await setDoc(doc(db, 'settings', 'homepage'), { festival: { enabled: newStatus } }, { merge: true });
      setFestivalEnabled(newStatus);
    } catch (e) {
      console.error("Failed to toggle Diwali Mode:", e);
      alert("Failed to toggle Diwali mode.");
    } finally {
      setTogglingFestival(false);
    }
  };

  const updateProductRow = (id: string, updates: Partial<{
    enabled: boolean;
    discountPrice: number;
    comparePrice: number;
    badgeText: string;
  }>) => {
    setItemsState(prev => {
      const current = prev[id] || {
        enabled: false,
        discountPrice: 799,
        comparePrice: 1299,
        badgeText: 'DIWALI SPECIAL'
      };
      return {
        ...prev,
        [id]: {
          ...current,
          ...updates,
          dirty: true
        }
      };
    });
  };

  // Bulk enable or disable currently filtered items
  const handleBulkToggle = (enable: boolean) => {
    const next = { ...itemsState };
    filteredProducts.forEach(p => {
      const current = next[p.id] || {
        enabled: false,
        discountPrice: p.price || 799,
        comparePrice: p.comparePrice || Math.round((p.price || 999) * 1.4),
        badgeText: bulkBadgeText || 'DIWALI SPECIAL'
      };
      next[p.id] = {
        ...current,
        enabled: enable,
        dirty: true
      };
    });
    setItemsState(next);
  };

  // Apply discount % to filtered products
  const handleApplyBulkDiscount = () => {
    const percent = parseFloat(bulkDiscountPercent);
    if (isNaN(percent) || percent <= 0 || percent >= 100) {
      alert("Please enter a valid discount percentage between 1 and 99.");
      return;
    }

    const next = { ...itemsState };
    filteredProducts.forEach(p => {
      const regularPrice = p.price || 999;
      // Actual MRP (compare price) is higher, discounted MRP is regular minus % or regular / (1 - %)
      const actualMRP = p.comparePrice && p.comparePrice > regularPrice ? p.comparePrice : Math.round(regularPrice * 1.35);
      const discountedMRP = Math.round(actualMRP * (1 - percent / 100));

      const current = next[p.id] || {
        enabled: true,
        discountPrice: discountedMRP,
        comparePrice: actualMRP,
        badgeText: bulkBadgeText
      };

      next[p.id] = {
        ...current,
        enabled: true,
        discountPrice: discountedMRP,
        comparePrice: actualMRP,
        badgeText: bulkBadgeText || current.badgeText || 'DIWALI SPECIAL',
        dirty: true
      };
    });
    setItemsState(next);
  };

  // Save changes to Firebase
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const dirtyEntries = Object.entries(itemsState).filter(([_, val]) => val.dirty);

      if (dirtyEntries.length === 0) {
        alert("No changes to save.");
        setSaving(false);
        return;
      }

      await Promise.all(
        dirtyEntries.map(([id, state]) =>
          dbService.updateProduct(id, {
            diwaliOffer: {
              enabled: state.enabled,
              discountPrice: Number(state.discountPrice) || 0,
              comparePrice: Number(state.comparePrice) || 0,
              badgeText: state.badgeText || 'DIWALI SPECIAL'
            }
          })
        )
      );

      // Revalidate cache
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag: 'products' })
        });
      } catch (e) {}

      // Mark all clean
      setItemsState(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          next[k] = { ...next[k], dirty: false };
        });
        return next;
      });

      alert(`Successfully updated ${dirtyEntries.length} jersey Diwali offer settings!`);
    } catch (e) {
      console.error("Failed to save diwali offers:", e);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Filtered list
  const filteredProducts = products.filter(p => {
    const state = itemsState[p.id];
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.club && p.club.toLowerCase().includes(searchQuery.toLowerCase()));

    const isNational = p.club?.toLowerCase() === 'national team';
    const matchesType = typeFilter === 'all' 
      ? true 
      : typeFilter === 'national' 
        ? isNational 
        : !isNational;

    const isPlayer = p.category?.toLowerCase().includes('player') || p.name.toLowerCase().includes('player');
    const isFan = p.category?.toLowerCase().includes('fan') || p.name.toLowerCase().includes('fan');
    const matchesCategory = categoryFilter === 'all' 
      ? true 
      : categoryFilter === 'player' 
        ? isPlayer 
        : isFan;

    const matchesOfferOnly = offerOnlyFilter ? Boolean(state?.enabled) : true;

    return matchesSearch && matchesType && matchesCategory && matchesOfferOnly;
  });

  const activeOfferCount = Object.values(itemsState).filter(s => s.enabled).length;
  const dirtyCount = Object.values(itemsState).filter(s => s.dirty).length;

  return (
    <div className="max-w-[1300px] mx-auto pb-24 px-4 sm:px-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-black">Diwali Offer Pricing & Catalog</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Easily manage actual MRP and discounted Diwali pricing for all jerseys in one consolidated list.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving || dirtyCount === 0}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all font-bold text-sm shadow-sm ${
            dirtyCount > 0 
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Publishing...' : `Save & Apply Changes ${dirtyCount > 0 ? `(${dirtyCount})` : ''}`}
        </button>
      </div>

      {/* 2. Global Master Switch Banner */}
      <section className="mb-8 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪔</span>
              <h2 className="text-lg font-bold text-gray-900">Diwali Festive Theme & Sale Master Toggle</h2>
              {festivalEnabled ? (
                <span className="px-2.5 py-0.5 text-xs font-black uppercase rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  LIVE ON SITE
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-black uppercase rounded-full bg-gray-200 text-gray-700">
                  DISABLED
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 max-w-3xl leading-relaxed">
              When toggled <strong>ON</strong>, the full Diwali festive theme (navbar firecracker bursts, floating diya garlands, lanterns, celebratory sparkles, and Diwali sale pricing/badges) turns live across the entire website. When switched <strong>OFF</strong>, the site instantly returns to its standard original appearance.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={festivalEnabled}
            onClick={handleToggleFestival}
            disabled={togglingFestival}
            className={`inline-flex shrink-0 items-center gap-3 rounded-xl px-5 py-3 text-sm font-black transition-all shadow-md ${
              festivalEnabled 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' 
                : 'bg-gray-900 hover:bg-black text-white'
            }`}
          >
            <span>{togglingFestival ? 'Updating...' : festivalEnabled ? 'Diwali Mode: ON' : 'Diwali Mode: OFF'}</span>
            <span className={`relative h-6 w-11 rounded-full transition-colors ${festivalEnabled ? 'bg-emerald-400' : 'bg-gray-600'}`}>
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${festivalEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </span>
          </button>
        </div>
      </section>

      {/* 3. Bulk Quick-Set Tools */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Quick Bulk Pricing & Offer Assignment
            </h3>
          </div>
          <span className="text-xs font-medium text-gray-500">
            Currently {activeOfferCount} of {products.length} jerseys have Diwali Offer enabled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold text-gray-700">Diwali Discount %</label>
            <div className="relative">
              <input
                type="number"
                min="5"
                max="80"
                value={bulkDiscountPercent}
                onChange={e => setBulkDiscountPercent(e.target.value)}
                placeholder="25"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-bold pl-8 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-bold">%</span>
            </div>
          </div>

          <div className="md:col-span-4 space-y-1">
            <label className="text-xs font-bold text-gray-700">Badge Tagline Text</label>
            <input
              type="text"
              value={bulkBadgeText}
              onChange={e => setBulkBadgeText(e.target.value)}
              placeholder="e.g. DIWALI SPECIAL or 30% OFF DIWALI"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleApplyBulkDiscount}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm whitespace-nowrap"
            >
              Apply Discount to Filtered ({filteredProducts.length})
            </button>
            <button
              type="button"
              onClick={() => handleBulkToggle(true)}
              className="bg-gray-900 hover:bg-black text-white px-3 py-2.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
            >
              Enable Filtered
            </button>
            <button
              type="button"
              onClick={() => handleBulkToggle(false)}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
            >
              Disable Filtered
            </button>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search jersey name, club, or team..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium bg-white focus:outline-none"
          >
            <option value="all">All Types (Club & National)</option>
            <option value="club">Club Jerseys Only</option>
            <option value="national">National Teams Only</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium bg-white focus:outline-none"
          >
            <option value="all">All Versions</option>
            <option value="player">Player Version Only</option>
            <option value="fan">Fan Version Only</option>
          </select>

          <button
            type="button"
            onClick={() => setOfferOnlyFilter(!offerOnlyFilter)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              offerOnlyFilter 
                ? 'bg-amber-100 border-amber-400 text-amber-900' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>Diwali Offer Active Only</span>
            {offerOnlyFilter && <Check className="w-3.5 h-3.5 text-amber-700" />}
          </button>
        </div>
      </div>

      {/* 5. Products List Table */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading catalog items and pricing...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 space-y-2">
          <ShieldAlert className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-sm font-semibold">No jerseys match your filters.</p>
          <button 
            onClick={() => { setSearchQuery(''); setTypeFilter('all'); setCategoryFilter('all'); setOfferOnlyFilter(false); }}
            className="text-xs text-amber-600 hover:underline font-bold"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4 w-12 text-center">Diwali Sale</th>
                  <th className="py-3 px-4">Jersey Product</th>
                  <th className="py-3 px-3">Standard Price</th>
                  <th className="py-3 px-3">Actual MRP (Strikethrough)</th>
                  <th className="py-3 px-3">Discounted Diwali Price</th>
                  <th className="py-3 px-3">Sale Badge Tagline</th>
                  <th className="py-3 px-4 text-center">Preview Offer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map(product => {
                  const state = itemsState[product.id] || {
                    enabled: false,
                    discountPrice: product.price || 799,
                    comparePrice: product.comparePrice || Math.round((product.price || 999) * 1.4),
                    badgeText: 'DIWALI SPECIAL'
                  };

                  const actualMRP = state.comparePrice || (product.comparePrice || Math.round((product.price || 999) * 1.4));
                  const discountPrice = state.discountPrice || product.price;
                  const discountPercent = actualMRP > discountPrice 
                    ? Math.round(((actualMRP - discountPrice) / actualMRP) * 100) 
                    : 0;

                  return (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-amber-50/40 transition-colors ${
                        state.enabled ? 'bg-amber-50/20' : ''
                      } ${state.dirty ? 'border-l-4 border-l-amber-500' : ''}`}
                    >
                      {/* 1. Toggle switch */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => updateProductRow(product.id, { enabled: !state.enabled })}
                          className={`p-1.5 rounded-lg transition-colors ${
                            state.enabled ? 'text-amber-700 bg-amber-100 hover:bg-amber-200' : 'text-gray-400 hover:text-gray-600'
                          }`}
                          title={state.enabled ? "Disable for Diwali Offer" : "Enable for Diwali Offer"}
                        >
                          {state.enabled ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </button>
                      </td>

                      {/* 2. Jersey Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-[240px]">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0 bg-neutral-100"
                          />
                          <div className="space-y-0.5">
                            <span className="font-bold text-gray-900 block leading-tight">
                              {product.name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                              <span>{product.club}</span>
                              <span>•</span>
                              <span className="uppercase">{product.category}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. Normal Current Price */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-gray-500 font-mono">
                          ₹{product.price}
                        </span>
                      </td>

                      {/* 4. Actual MRP (Strikethrough) */}
                      <td className="py-3 px-3">
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-2 text-gray-400 font-mono">₹</span>
                          <input
                            type="number"
                            value={state.comparePrice}
                            onChange={e => updateProductRow(product.id, { comparePrice: Number(e.target.value) })}
                            className="w-full border border-gray-300 rounded-lg py-1.5 pl-6 pr-2 text-xs font-mono font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="1499"
                          />
                        </div>
                      </td>

                      {/* 5. Discounted Diwali Price */}
                      <td className="py-3 px-3">
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-2 text-amber-700 font-mono font-bold">₹</span>
                          <input
                            type="number"
                            value={state.discountPrice}
                            onChange={e => updateProductRow(product.id, { discountPrice: Number(e.target.value) })}
                            className="w-full border border-amber-300 bg-amber-50/50 rounded-lg py-1.5 pl-6 pr-2 text-xs font-mono font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="999"
                          />
                        </div>
                      </td>

                      {/* 6. Sale Badge Tagline */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={state.badgeText}
                          onChange={e => updateProductRow(product.id, { badgeText: e.target.value })}
                          className="w-36 border border-gray-300 rounded-lg py-1.5 px-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          placeholder="DIWALI SPECIAL"
                        />
                      </td>

                      {/* 7. Live Preview */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {state.enabled ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-wider bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-sm mb-1">
                              {state.badgeText || 'DIWALI SPECIAL'}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="line-through text-gray-400 font-mono">₹{actualMRP}</span>
                              <span className="font-bold text-amber-800 font-mono">₹{discountPrice}</span>
                              <span className="font-bold text-emerald-700 text-[10px]">({discountPercent}% OFF)</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">Normal price</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
