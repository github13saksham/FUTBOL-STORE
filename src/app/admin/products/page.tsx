"use client";

import React, { useState, useEffect } from 'react';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';
import { Product } from '@/data/mockData';
import { Loader2, Plus, Edit2, Trash2, Search, Power, Package } from 'lucide-react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'national' | 'club'>('club');
  const [versionFilter, setVersionFilter] = useState<'player' | 'fan'>('player');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

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

  // Sort by Uploaded
  if (sortOrder === 'oldest') {
    // Products are sorted newest-first by default from the DB.
    // Reverse to show oldest first.
    filteredProducts.reverse();
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black mb-1">Products Inventory</h1>
          <p className="text-gray-500 text-sm">Manage your individual jerseys, stock, and pricing.</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" /> Add Jersey
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('club')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'club' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
          >
            Club Teams
          </button>
          <button 
            onClick={() => setActiveTab('national')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'national' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
          >
            National Teams
          </button>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 flex-1 md:justify-end">
          {/* Version Filter */}
          <select 
            value={versionFilter}
            onChange={(e) => setVersionFilter(e.target.value as any)}
            className="px-4 py-2 text-sm text-black bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-300"
          >
            <option value="player">Player Version</option>
            <option value="fan">Fan Version</option>
          </select>

          {/* Sort Filter */}
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-4 py-2 text-sm text-black bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-300"
          >
            <option value="newest">New Uploaded</option>
            <option value="oldest">Past Uploaded</option>
          </select>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search jerseys..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm text-black focus:border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Price</th>
                  <th className="px-6 py-4 hidden md:table-cell">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-12 h-12 relative bg-gray-100 rounded-md border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-black max-w-[300px] truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{product.club}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell font-medium text-black">
                      ₹{product.price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-gray-500 capitalize">
                      {product.category.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                        product.inStock !== false 
                          ? 'bg-black text-white' 
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleToggleStock(product)}
                          className={`${product.inStock !== false ? 'text-gray-400 hover:text-red-500' : 'text-red-500 hover:text-black'} transition-colors`}
                          title="Toggle Stock"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <Link 
                          href={`/admin/products/new?edit=${product.id}`}
                          className="text-gray-400 hover:text-black transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
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
