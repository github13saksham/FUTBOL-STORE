"use client";

import React, { useState, useEffect } from 'react';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';
import { Coupon } from '@/backend/interfaces/db.interface';
import { Loader2, Plus, Trash2, Power, Search, Ticket } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Create Coupon Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Coupon>({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    isActive: true,
  });

  const dbService = new FirebaseDatabaseService();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const fetchedCoupons = await dbService.getCoupons();
      setCoupons(fetchedCoupons);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    setDeletingId(id);
    try {
      await dbService.deleteCoupon(id);
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete coupon:', error);
      alert('Failed to delete coupon.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const newActiveStatus = !coupon.isActive;
      await dbService.updateCoupon(coupon.id!, { isActive: newActiveStatus });
      setCoupons(coupons.map(c => c.id === coupon.id ? { ...c, isActive: newActiveStatus } : c));
    } catch (error) {
      console.error('Failed to toggle active status:', error);
      alert('Failed to update coupon.');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;

    setIsSubmitting(true);
    try {
      const exists = await dbService.getCouponByCode(newCoupon.code);
      if (exists) {
        alert("A coupon with this code already exists.");
        setIsSubmitting(false);
        return;
      }

      await dbService.addCoupon(newCoupon);
      await fetchCoupons();
      setIsModalOpen(false);
      setNewCoupon({
        code: '',
        discountType: 'percentage',
        discountValue: 10,
        isActive: true,
      });
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Failed to create coupon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black mb-1">Coupon Management</h1>
          <p className="text-gray-500 text-sm">Create and manage discount codes for your customers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search coupons..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm text-black focus:border-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No coupons found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Coupon Code</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Discount Type</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4 hidden md:table-cell">Min Order</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-10 h-10 relative bg-gray-100 rounded-md border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-black uppercase tracking-widest">{coupon.code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-gray-500 capitalize">
                      {coupon.discountType}
                    </td>
                    <td className="px-6 py-4 font-medium text-black">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-gray-500">
                      {coupon.minOrderValue ? `₹${coupon.minOrderValue}` : 'None'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                        coupon.isActive 
                          ? 'bg-black text-white' 
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleToggleActive(coupon)}
                          className={`${coupon.isActive ? 'text-gray-400 hover:text-red-500' : 'text-red-500 hover:text-black'} transition-colors`}
                          title="Toggle Status"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(coupon.id!)}
                          disabled={deletingId === coupon.id}
                          className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === coupon.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight text-black">Create New Coupon</h2>
            </div>
            
            <form onSubmit={handleCreateCoupon} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Coupon Code</label>
                <input 
                  type="text" 
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all uppercase"
                  placeholder="e.g. SUMMER2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Discount Type</label>
                  <select 
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value as any})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Discount Value</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({...newCoupon, discountValue: Number(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Min. Order Value (Optional)</label>
                <input 
                  type="number" 
                  min={0}
                  value={newCoupon.minOrderValue || ''}
                  onChange={(e) => setNewCoupon({...newCoupon, minOrderValue: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all"
                  placeholder="e.g. 999"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
