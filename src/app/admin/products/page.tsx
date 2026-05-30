"use client";

import React, { useState, useEffect } from 'react';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';
import { Product } from '@/data/mockData';
import { Loader2, Plus, Edit2, Trash2, Search, Power } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'national' | 'club'>('national');
  const [versionFilter, setVersionFilter] = useState<'player' | 'fan'>('player');

  const dbService = new FirebaseDatabaseService();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await dbService.getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setDeletingId(id);
    try {
      await dbService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStock = async (product: Product) => {
    try {
      const newStockStatus = product.inStock === false ? true : false;
      await dbService.updateProduct(product.id, { inStock: newStockStatus });
      setProducts(products.map(p => p.id === product.id ? { ...p, inStock: newStockStatus } : p));
    } catch (error) {
      console.error('Failed to toggle stock:', error);
      alert('Failed to toggle stock.');
    }
  };

  const filteredProducts = products.filter(p => {
    // Search Query
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.club && p.club.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    // Tab Filter
    const isNationalTeam = p.club && p.club.toLowerCase() === "national team";
    if (activeTab === 'national' && !isNationalTeam) return false;
    if (activeTab === 'club' && isNationalTeam) return false;

    // Version Filter
    const isPlayer = p.category.toLowerCase().includes('player') || p.name.toLowerCase().includes('player');
    const isFan = p.category.toLowerCase().includes('fan') || p.name.toLowerCase().includes('fan');
    
    if (versionFilter === 'player' && !isPlayer) return false;
    if (versionFilter === 'fan' && !isFan) return false;

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-luxury-dark mb-1">Products Inventory</h1>
          <p className="text-luxury-taupe text-sm">Manage your individual jerseys here.</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="flex items-center gap-2 bg-luxury-dark text-luxury-ivory px-5 py-2.5 rounded hover:bg-black transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" /> Add New Jersey
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-luxury-taupe/20 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('national')}
            className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'national' ? 'bg-white text-luxury-dark shadow-sm' : 'text-gray-500 hover:text-luxury-dark'}`}
          >
            National Teams
          </button>
          <button 
            onClick={() => setActiveTab('club')}
            className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'club' ? 'bg-white text-luxury-dark shadow-sm' : 'text-gray-500 hover:text-luxury-dark'}`}
          >
            Club Jerseys
          </button>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4 flex-1 md:justify-end">
          {/* Version Filter */}
          <select 
            value={versionFilter}
            onChange={(e) => setVersionFilter(e.target.value as any)}
            className="px-4 py-2 text-sm text-luxury-dark bg-white border border-gray-200 rounded-lg outline-none focus:border-luxury-taupe"
          >
            <option value="player">Player Version</option>
            <option value="fan">Fan Version</option>
          </select>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-luxury-taupe absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search jerseys..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none text-sm text-luxury-dark focus:border-luxury-taupe"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-luxury-taupe/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-luxury-taupe" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-luxury-taupe">
            <p>No products found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-luxury-taupe/20 text-xs uppercase tracking-wider text-luxury-taupe">
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Price</th>
                  <th className="p-4 font-medium hidden md:table-cell">Category</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-luxury-taupe/10 hover:bg-[#F8F9FA] transition-colors">
                    <td className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 relative bg-[#F3F4F6] rounded overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-luxury-taupe">No Img</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-luxury-dark">{product.name}</p>
                        <p className="text-xs text-luxury-taupe mt-0.5">{product.club}</p>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell text-sm text-luxury-dark">
                      ₹{product.price.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-luxury-taupe capitalize">
                      {product.category.replace('_', ' ')}
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest ${product.inStock !== false ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleStock(product)}
                          className={`${product.inStock !== false ? 'text-green-500 hover:text-red-500' : 'text-red-500 hover:text-green-500'} transition-colors`}
                          title="Toggle Stock"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <Link 
                          href={`/admin/products/new?edit=${product.id}`}
                          className="text-luxury-taupe hover:text-luxury-dark transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === product.id ? (
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
    </div>
  );
}
