"use client";

import React, { useState, useEffect } from 'react';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';
import { Product } from '@/data/mockData';
import { Package, TrendingUp, TrendingDown, ShoppingBag, AlertCircle, Bell, ArrowUpRight, Plus, UploadCloud, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]); // Mock for now until API is ready
  const [loading, setLoading] = useState(true);
  const dbService = new FirebaseDatabaseService();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const fetchedProducts = await dbService.getProducts();
      setProducts(fetchedProducts);
      
      const orders = await dbService.getAllOrders();
      setRecentOrders(orders.slice(0, 5));
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const inventoryValue = products.reduce((acc, p) => acc + p.price, 0);
  
  const lowStockProducts = products.filter(p => {
    if (p.inStock === false) return true;
    if (p.inventory) {
      const totalInventory = Object.values(p.inventory).reduce((sum, count) => sum + count, 0);
      return totalInventory < 5;
    }
    return false;
  }).slice(0, 5);

  const pendingOrdersCount = recentOrders.filter(o => o.status === "New Order" || o.status === "Processing").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New Order': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-black text-white rounded-md">New</span>;
      case 'Processing': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700 rounded-md">Processing</span>;
      case 'Shipped': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-md">Shipped</span>;
      case 'Delivered': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-400 border border-gray-200 rounded-md">Delivered</span>;
      default: return <span>{status}</span>;
    }
  };

  const notifications = [
    ...recentOrders.slice(0, 3).map(order => ({
      id: `notif-order-${order.id}`,
      type: 'order',
      title: 'New Order',
      message: `#${order.id.slice(-6).toUpperCase()} received from ${order.customerInfo?.name || 'Guest'}.`,
      time: new Date(order.createdAt).toLocaleDateString(),
      color: 'bg-black'
    })),
    ...lowStockProducts.slice(0, 2).map(product => ({
      id: `notif-stock-${product.id}`,
      type: 'alert',
      title: 'Inventory Alert',
      message: `${product.name} is running low.`,
      time: 'Action required',
      color: 'bg-red-500'
    }))
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black mb-1">Welcome Back, Admin</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/new" className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" /> Add Jersey
          </Link>
          <Link href="/admin/homepage" className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <LayoutTemplate className="w-4 h-4" /> Manage Homepage
          </Link>
        </div>
      </div>

      {/* 4 Premium Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-auto">
            <h3 className="text-3xl font-bold text-black">{loading ? '-' : products.length}</h3>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-gray-500">
              <TrendingUp className="w-3 h-3 text-black" />
              <span>+12 added this week</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-gray-500">Pending Orders</p>
            <ShoppingBag className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-auto">
            <h3 className="text-3xl font-bold text-black">{loading ? '-' : pendingOrdersCount}</h3>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-gray-500">
              <span className="text-black font-bold">Action required</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-gray-500">Inventory Value</p>
            <span className="w-5 h-5 flex items-center justify-center text-gray-400 font-serif">₹</span>
          </div>
          <div className="mt-auto">
            <h3 className="text-3xl font-bold text-black">
              {loading ? '-' : `₹${(inventoryValue / 1000).toFixed(1)}k`}
            </h3>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-gray-500">
              <TrendingUp className="w-3 h-3 text-black" />
              <span>+2.4% from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
            <AlertCircle className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-auto">
            <h3 className="text-3xl font-bold text-black">{loading ? '-' : lowStockProducts.length}</h3>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-gray-500">
              <TrendingDown className="w-3 h-3 text-black" />
              <span>Needs restocking soon</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (Recent Orders) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Orders Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-black">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs font-medium text-gray-500 hover:text-black flex items-center gap-1">
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 text-xs font-medium">
                  <tr>
                    <th className="px-5 py-3 font-medium">Order ID</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-black">{order.id.slice(-6).toUpperCase()}</td>
                      <td className="px-5 py-4 font-medium text-gray-700">{order.customerInfo?.name || "Guest"}</td>
                      <td className="px-5 py-4 font-medium text-gray-700">₹{order.totalAmount}</td>
                      <td className="px-5 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-gray-400">No recent orders</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-black">Low Stock Alerts</h2>
              <Link href="/admin/products" className="text-xs font-medium text-gray-500 hover:text-black flex items-center gap-1">
                Inventory <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 text-xs font-medium">
                  <tr>
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Stock</th>
                    <th className="px-5 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex-shrink-0 overflow-hidden">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-gray-400 m-auto mt-2" />
                            )}
                          </div>
                          <p className="font-medium text-gray-700 truncate max-w-[200px]">{p.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                          p.inStock === false ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                        }`}>
                          {p.inStock === false ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/admin/products/new?edit=${p.id}`} className="text-xs font-medium text-gray-500 hover:text-black underline underline-offset-2">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {lowStockProducts.length === 0 && !loading && (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-gray-400">All inventory levels are healthy.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Content (Notifications & Quick Actions) */}
        <div className="space-y-8">
          
          {/* Notifications Center */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-black flex items-center gap-2">
                <Bell className="w-4 h-4" /> Notifications
              </h2>
            </div>
            <div className="p-0">
              <ul className="divide-y divide-gray-50">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <li key={notif.id} className="p-4 flex gap-3 hover:bg-gray-50 transition-colors">
                      <div className={`w-2 h-2 mt-1.5 rounded-full ${notif.color} flex-shrink-0`}></div>
                      <div>
                        <p className="text-sm text-gray-700"><span className="font-medium text-black">{notif.title}</span> {notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-8 text-center text-gray-400 text-sm">
                    No new notifications
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-black">Quick Actions</h2>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              <Link href="/admin/products/new" className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors gap-2 text-gray-600 hover:text-black">
                <Plus className="w-5 h-5" />
                <span className="text-xs font-medium text-center">Add<br/>Jersey</span>
              </Link>
              <Link href="/admin/bulk-upload" className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors gap-2 text-gray-600 hover:text-black">
                <UploadCloud className="w-5 h-5" />
                <span className="text-xs font-medium text-center">Bulk<br/>Upload</span>
              </Link>
              <Link href="/admin/homepage" className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors gap-2 text-gray-600 hover:text-black">
                <LayoutTemplate className="w-5 h-5" />
                <span className="text-xs font-medium text-center">Manage<br/>Homepage</span>
              </Link>
              <Link href="/admin/orders" className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors gap-2 text-gray-600 hover:text-black">
                <ShoppingBag className="w-5 h-5" />
                <span className="text-xs font-medium text-center">View<br/>Orders</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
