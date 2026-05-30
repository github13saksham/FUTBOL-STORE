"use client";

import React, { useState, useEffect } from 'react';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';
import { Product, Club } from '@/data/mockData';
import { Package, ShieldAlert, AlertTriangle, Clock, AlertCircle, ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const dbService = new FirebaseDatabaseService();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [fetchedProducts, fetchedClubs] = await Promise.all([
        dbService.getProducts(),
        dbService.getClubs()
      ]);
      setProducts(fetchedProducts);
      setClubs(fetchedClubs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const outOfStockCount = products.filter(p => p.inStock === false).length;
  const nationalCount = products.filter(p => p.club && p.club.toLowerCase().includes('national')).length;
  const clubCount = products.filter(p => !p.club || !p.club.toLowerCase().includes('national')).length;
  const recentProducts = [...products].reverse().slice(0, 5);
  const lowStockProducts = products.filter(p => {
    if (p.inStock === false) return true;
    if (p.inventory) {
      const totalInventory = Object.values(p.inventory).reduce((sum, count) => sum + count, 0);
      return totalInventory < 5;
    }
    return false;
  }).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-luxury-dark via-gray-800 to-black rounded-2xl p-8 text-luxury-ivory shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-serif mb-2 tracking-wide">Command Center</h1>
            <p className="text-luxury-taupe text-sm">Monitor your premium inventory, track metrics, and manage operations.</p>
          </div>
          <Link 
            href="/admin/products/new"
            className="mt-4 md:mt-0 px-6 py-2.5 bg-white text-black font-bold uppercase tracking-widest text-xs rounded hover:bg-gray-200 transition-colors shadow-lg"
          >
            + Add Jersey
          </Link>
        </div>
      </div>

      {/* Advanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-luxury-taupe/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+Active</span>
          </div>
          <div>
            <h3 className="text-4xl font-serif text-luxury-dark mb-1">{loading ? '-' : products.length}</h3>
            <p className="text-xs uppercase tracking-widest text-luxury-taupe font-bold">Total Products</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-luxury-taupe/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-serif text-luxury-dark mb-1">{loading ? '-' : nationalCount}</h3>
            <p className="text-xs uppercase tracking-widest text-luxury-taupe font-bold">National Jerseys</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-luxury-taupe/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-serif text-luxury-dark mb-1">{loading ? '-' : clubCount}</h3>
            <p className="text-xs uppercase tracking-widest text-luxury-taupe font-bold">Club Jerseys</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-luxury-taupe/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-serif text-luxury-dark mb-1">
              {loading ? '-' : `₹${products.reduce((acc, p) => acc + p.price, 0).toLocaleString()}`}
            </h3>
            <p className="text-xs uppercase tracking-widest text-luxury-taupe font-bold">Total Inventory Value</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-luxury-taupe/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            {outOfStockCount > 0 && (
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">{outOfStockCount} critical</span>
            )}
          </div>
          <div>
            <h3 className="text-4xl font-serif text-luxury-dark mb-1">{loading ? '-' : outOfStockCount}</h3>
            <p className="text-xs uppercase tracking-widest text-luxury-taupe font-bold">Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-luxury-taupe/10 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-luxury-taupe/10 flex items-center justify-between">
            <h3 className="font-serif text-lg text-luxury-dark flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" /> Action Required (Low Stock)
            </h3>
            <Link href="/admin/products" className="text-xs uppercase tracking-widest text-luxury-taupe hover:text-luxury-dark font-bold">View All</Link>
          </div>
          <div className="p-0 flex-1">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-luxury-taupe" /></div>
            ) : lowStockProducts.length > 0 ? (
              <ul className="divide-y divide-luxury-taupe/10">
                {lowStockProducts.map(p => (
                  <li key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-luxury-dark truncate max-w-[200px]">{p.name}</p>
                        <p className="text-xs text-red-500 font-bold uppercase tracking-wider">{p.inStock === false ? 'Out of Stock' : 'Low Inventory'}</p>
                      </div>
                    </div>
                    <Link href={`/admin/products/new?edit=${p.id}`} className="text-xs font-bold bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">Edit</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-sm text-gray-400">All inventory levels are healthy.</div>
            )}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white rounded-2xl border border-luxury-taupe/10 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-luxury-taupe/10 flex items-center justify-between">
            <h3 className="font-serif text-lg text-luxury-dark flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" /> Recently Added
            </h3>
            <Link href="/admin/products" className="text-xs uppercase tracking-widest text-luxury-taupe hover:text-luxury-dark font-bold">View Catalog</Link>
          </div>
          <div className="p-0 flex-1">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-luxury-taupe" /></div>
            ) : recentProducts.length > 0 ? (
              <ul className="divide-y divide-luxury-taupe/10">
                {recentProducts.map(p => (
                  <li key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-luxury-dark truncate max-w-[200px]">{p.name}</p>
                        <p className="text-xs text-luxury-taupe uppercase tracking-wider">{p.club}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-luxury-dark">₹{p.price}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-sm text-gray-400">No products uploaded yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
