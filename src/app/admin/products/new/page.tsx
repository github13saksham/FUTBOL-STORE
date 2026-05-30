"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';
import { Product } from '@/data/mockData';
import { Loader2, ArrowLeft, Save, Upload } from 'lucide-react';
import Link from 'next/link';

function SingleProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');
  
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const dbService = new FirebaseDatabaseService();

  const [formData, setFormData] = useState<Partial<Product>>({
    id: '',
    name: '',
    club: '',
    color: 'White',
    category: 'home',
    price: 0,
    priceStr: '₹0',
    image: '',
    desc: '',
    inventory: { S: 0, M: 0, L: 0, XL: 0 }
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
        // Ensure inventory exists for backwards compatibility
        setFormData({
          ...product,
          inventory: product.inventory || { S: 0, M: 0, L: 0, XL: 0 }
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
    const { name, value } = e.target;
    
    if (name === 'price') {
      const priceNum = Number(value);
      setFormData(prev => ({ 
        ...prev, 
        price: priceNum,
        priceStr: `₹${priceNum.toLocaleString('en-IN')}`
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInventoryChange = (size: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [size]: Number(value)
      }
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await dbService.uploadProductImage(file);
      setFormData(prev => ({ ...prev, image: url }));
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

    try {
      if (editId) {
        await dbService.updateProduct(editId, formData);
      } else {
        // Generate a descriptive ID from the product name
        const slug = formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'product';
        const randomCode = Math.random().toString(36).substring(2, 6);
        const newId = `${slug}-${randomCode}`;
        
        const newProduct = { inStock: true, ...formData, id: newId } as Product;
        await dbService.addProduct(newProduct);
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
        <Loader2 className="w-8 h-8 animate-spin text-luxury-taupe" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <Link 
        href="/admin/products"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-luxury-taupe hover:text-luxury-dark transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-3 h-3" /> Back to Products
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-serif text-luxury-dark mb-1">
          {editId ? 'Edit Jersey' : 'Add New Jersey'}
        </h1>
        <p className="text-luxury-taupe text-sm">Fill in the details carefully. This will instantly update the live store.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-luxury-taupe/20 shadow-sm p-6 sm:p-8">
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded border border-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-2">Product Name</label>
            <input 
              type="text" 
              name="name" 
              required
              value={formData.name || ''} 
              onChange={handleChange}
              className="w-full border border-luxury-taupe/30 rounded p-3 text-sm outline-none focus:border-luxury-dark transition-colors"
              placeholder="e.g. Real Madrid Home Kit 24/25"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-2">Club/Team</label>
            <input 
              type="text" 
              name="club" 
              required
              value={formData.club || ''} 
              onChange={handleChange}
              className="w-full border border-luxury-taupe/30 rounded p-3 text-sm outline-none focus:border-luxury-dark transition-colors"
              placeholder="e.g. Real Madrid"
            />
          </div>



          <div>
            <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-2">Selling Price (₹)</label>
            <input 
              type="number" 
              name="price" 
              required
              value={formData.price || ''} 
              onChange={handleChange}
              className="w-full border border-luxury-taupe/30 rounded p-3 text-sm outline-none focus:border-luxury-dark transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-2">Category</label>
            <select 
              name="category" 
              value={formData.category || 'home'} 
              onChange={handleChange}
              className="w-full border border-luxury-taupe/30 rounded p-3 text-sm outline-none focus:border-luxury-dark transition-colors"
            >
              <option value="home">Home Kit</option>
              <option value="away">Away Kit</option>
              <option value="third">Third Kit</option>
              <option value="retro">Retro Kit</option>
            </select>
          </div>

          <div className="md:col-span-2 pt-4 border-t border-luxury-taupe/10">
            <h3 className="text-sm font-serif text-luxury-dark mb-4">Product Image</h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-2">Upload from PC</label>
                <div className="relative border-2 border-dashed border-luxury-taupe/30 rounded p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadingImage ? (
                    <Loader2 className="w-6 h-6 animate-spin text-luxury-dark mb-2" />
                  ) : (
                    <Upload className="w-6 h-6 text-luxury-taupe mb-2" />
                  )}
                  <span className="text-sm text-luxury-dark font-medium">
                    {uploadingImage ? 'Uploading...' : 'Click to select an image'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center text-luxury-taupe text-xs uppercase tracking-widest font-bold">OR</div>

              <div className="flex-1">
                <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-2">Image URL</label>
                <input 
                  type="text" 
                  name="image" 
                  value={formData.image || ''} 
                  onChange={handleChange}
                  className="w-full border border-luxury-taupe/30 rounded p-3 text-sm outline-none focus:border-luxury-dark transition-colors"
                  placeholder="https://example.com/jersey.jpg"
                />
                <p className="text-xs text-luxury-taupe mt-2">Paste a direct link if you don't want to upload a file.</p>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 pt-4 border-t border-luxury-taupe/10">
            <h3 className="text-sm font-serif text-luxury-dark mb-4">Inventory Tracking</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <div key={size}>
                  <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-2">Size {size}</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.inventory?.[size] || 0}
                    onChange={(e) => handleInventoryChange(size, e.target.value)}
                    className="w-full border border-luxury-taupe/30 rounded p-3 text-sm outline-none focus:border-luxury-dark transition-colors"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-luxury-taupe mt-3">Set the stock level for each size available. 0 means out of stock.</p>
          </div>

          <div className="md:col-span-2 pt-4 border-t border-luxury-taupe/10">
            <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-2">Description</label>
            <textarea 
              name="desc" 
              value={formData.desc || ''} 
              onChange={handleChange}
              rows={4}
              className="w-full border border-luxury-taupe/30 rounded p-3 text-sm outline-none focus:border-luxury-dark transition-colors"
              placeholder="Product description..."
            />
          </div>
        </div>

        <div className="pt-6 border-t border-luxury-taupe/20 flex justify-end gap-4">
          <Link 
            href="/admin/products"
            className="px-6 py-3 border border-luxury-taupe text-luxury-dark font-medium rounded hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-luxury-dark text-luxury-ivory font-medium rounded hover:bg-black transition-colors text-sm disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editId ? 'Save Changes' : 'Create Jersey'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SingleProductFormPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-luxury-taupe" />
      </div>
    }>
      <SingleProductForm />
    </Suspense>
  );
}
