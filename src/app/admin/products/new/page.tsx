"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';
import { Product } from '@/data/mockData';
import { Loader2, ArrowLeft, Save, Upload, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';

function SingleProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');
  
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const dbService = new FirebaseDatabaseService();

  const [formData, setFormData] = useState<any>({
    id: '',
    name: '',
    club: '',
    color: '',
    category: 'Player Version', // Re-mapped to Version
    price: 0,
    priceStr: '₹0',
    comparePrice: 0,
    image: '',
    desc: '',
    inventory: { S: 0, M: 0, L: 0, XL: 0 },
    lowStockThreshold: 5,
    visibility: {
      active: true,
      featured: false,
      bestSeller: false,
      newArrival: true
    }
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (editId) {
      fetchProductForEdit(editId);
    }
  }, [editId]);

  const fetchProductForEdit = async (id: string) => {
    try {
      const product = await dbService.getProductById(id);
      if (product) {
        setFormData({
          ...product,
          inventory: product.inventory || { S: 0, M: 0, L: 0, XL: 0 },
          lowStockThreshold: (product as any).lowStockThreshold || 5,
          comparePrice: (product as any).comparePrice || 0,
          visibility: (product as any).visibility || {
            active: true,
            featured: false,
            bestSeller: false,
            newArrival: false
          }
        });
      } else {
        setError('Product not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'price') {
      const priceNum = Number(value);
      setFormData((prev: any) => ({ 
        ...prev, 
        price: priceNum,
        priceStr: `₹${priceNum.toLocaleString('en-IN')}`
      }));
    } else if (name === 'comparePrice' || name === 'lowStockThreshold') {
      setFormData((prev: any) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleInventoryChange = (size: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [size]: Number(value)
      }
    }));
  };

  const handleToggle = (key: string) => {
    setFormData((prev: any) => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [key]: !prev.visibility[key]
      }
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await dbService.uploadProductImage(file);
      setFormData((prev: any) => ({ ...prev, image: url }));
    } catch (err: any) {
      console.error("Failed to upload image:", err);
      setError("Failed to upload image. " + (err.message || ''));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Calculate total stock
    const totalStock = Object.values(formData.inventory).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
    const inStock = totalStock > 0;

    const dataToSave = {
      ...formData,
      inStock
    };

    try {
      if (editId) {
        await dbService.updateProduct(editId, dataToSave);
      } else {
        const slug = formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'product';
        const randomCode = Math.random().toString(36).substring(2, 6);
        const newId = `${slug}-${randomCode}`;
        
        await dbService.addProduct({ ...dataToSave, id: newId, createdAt: new Date().toISOString() });
      }
      router.push('/admin/products');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Calculate total stock for badge
  const totalStock = Object.values(formData.inventory).reduce((sum: any, val: any) => sum + val, 0) as number;
  let stockBadge = { label: 'In Stock', color: 'bg-black text-white' };
  if (totalStock === 0) {
    stockBadge = { label: 'Out of Stock', color: 'bg-red-50 text-red-600 border-red-100' };
  } else if (totalStock <= formData.lowStockThreshold) {
    stockBadge = { label: 'Low Stock', color: 'bg-orange-50 text-orange-600 border-orange-100' };
  }

  return (
    <div className="max-w-[1000px] mx-auto pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/admin/products"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-black hover:border-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">
            {editId ? 'Edit Jersey' : 'Add New Jersey'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
              <h2 className="text-base font-bold text-black border-b border-gray-100 pb-3">Basic Information</h2>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Product Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  value={formData.name || ''} 
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                  placeholder="e.g. Real Madrid Home Player Version 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Team / Club</label>
                  <input 
                    type="text" 
                    name="club" 
                    required
                    value={formData.club || ''} 
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                    placeholder="e.g. Real Madrid"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Product Version</label>
                  <select 
                    name="category" 
                    value={formData.category || 'Player Version'} 
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                  >
                    <option value="Player Version">Player Version</option>
                    <option value="Fan Version">Fan Version</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  name="desc" 
                  value={formData.desc || ''} 
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                  placeholder="Engineered for pure matchday performance..."
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-black">Pricing & Inventory</h2>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${stockBadge.color}`}>
                  {stockBadge.label} ({totalStock})
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Selling Price (₹)</label>
                  <input 
                    type="number" 
                    name="price" 
                    required
                    value={formData.price || ''} 
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Compare Price (₹)</label>
                  <input 
                    type="number" 
                    name="comparePrice" 
                    value={formData.comparePrice || ''} 
                    onChange={handleChange}
                    placeholder="e.g. 999"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Stock per Size</label>
                <div className="grid grid-cols-4 gap-3">
                  {['S', 'M', 'L', 'XL'].map((size) => (
                    <div key={size}>
                      <span className="block text-xs text-center text-gray-500 mb-1 font-medium">{size}</span>
                      <input 
                        type="number" 
                        min="0"
                        value={formData.inventory?.[size] || 0}
                        onChange={(e) => handleInventoryChange(size, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm text-center text-black outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Low Stock Threshold</label>
                <input 
                  type="number" 
                  name="lowStockThreshold" 
                  value={formData.lowStockThreshold || 5} 
                  onChange={handleChange}
                  className="w-full md:w-1/2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Notify when total stock reaches this amount.</p>
              </div>

            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Image */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-black border-b border-gray-100 pb-3">Product Image</h2>
              
              <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                {formData.image ? (
                  <div className="relative w-full h-40">
                    <img src={formData.image} alt="Product" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <span className="text-white text-xs font-bold uppercase tracking-wider">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 font-medium text-center">
                      Upload Image
                    </span>
                  </>
                )}
                
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {uploadingImage && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-black" />
                  </div>
                )}
              </div>

              <div className="relative pt-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <div className="relative flex justify-center"><span className="bg-white px-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">OR URL</span></div>
              </div>

              <input 
                type="text" 
                name="image" 
                value={formData.image || ''} 
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Visibility */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-black border-b border-gray-100 pb-3">Homepage Visibility</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Active On Website</span>
                  <button type="button" onClick={() => handleToggle('active')} className="text-black">
                    {formData.visibility.active ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Featured Product</span>
                  <button type="button" onClick={() => handleToggle('featured')} className="text-black">
                    {formData.visibility.featured ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Best Seller</span>
                  <button type="button" onClick={() => handleToggle('bestSeller')} className="text-black">
                    {formData.visibility.bestSeller ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">New Arrival</span>
                  <button type="button" onClick={() => handleToggle('newArrival')} className="text-black">
                    {formData.visibility.newArrival ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t border-gray-200 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
          <Link 
            href="/admin/products"
            className="px-6 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 px-8 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors text-sm disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editId ? 'Save Changes' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SingleProductFormPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <SingleProductForm />
    </Suspense>
  );
}
