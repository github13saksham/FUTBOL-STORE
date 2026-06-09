"use client";

import React, { useState, useEffect } from 'react';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';
import { Search, Loader2, ArrowUpRight, CheckCircle2, Copy, Package, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShipmentsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Payload preview state
  const [demoPayload, setDemoPayload] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
  const dbService = new FirebaseDatabaseService();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = dbService.listenToAllOrders((fetchedOrders) => {
      const activeOrders = fetchedOrders.filter(o => 
        !['Shipped', 'Delivered', 'Completed', 'Rejected (Out of Stock)'].includes(o.status)
      );
      setOrders(activeOrders);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Check for payload sent from Orders page
  useEffect(() => {
    const data = localStorage.getItem('demoShipmentPayload');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.payload && parsed.orderId) {
          setDemoPayload(parsed.payload);
          // Set a minimal order object just enough to satisfy the drawer's requirements
          setSelectedOrder({ id: parsed.orderId });
        }
      } catch (e) {
        console.error("Failed to parse demo payload");
      }
    }
  }, []);

  const copyToClipboard = () => {
    if (demoPayload) {
      navigator.clipboard.writeText(JSON.stringify(demoPayload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeDrawer = () => {
    setSelectedOrder(null);
    setDemoPayload(null);
    localStorage.removeItem('demoShipmentPayload');
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New Order': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-black text-white rounded-md">New</span>;
      case 'Processing': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700 rounded-md">Processing</span>;
      case 'Packed': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700 rounded-md">Packed</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black mb-1">Shipment Verification</h1>
          <p className="text-sm text-gray-500">View generated Delhivery payloads to verify details before shipping.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-black/5"
          >
            <option value="All">All Active</option>
            <option value="New Order">New Order</option>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 text-xs font-medium">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-black">{order.id}</td>
                    <td className="px-6 py-4 text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.customerName}</td>
                    <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">{order.product}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">₹{order.amount}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {selectedOrder?.id === order.id && demoPayload ? (
                        <span className="text-green-500 text-xs font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Previewing
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Configure in Orders</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">No active orders available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Overlay for Payload */}
      <AnimatePresence>
        {selectedOrder && demoPayload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex justify-end"
            onClick={closeDrawer}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <h2 className="text-base font-bold text-black">Delhivery JSON Payload Preview</h2>
                    <p className="text-xs text-gray-500 mt-1">Order: {selectedOrder.id}</p>
                  </div>
                </div>
                <button onClick={closeDrawer} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-black rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 md:p-5 flex-1 bg-gray-50 flex flex-col gap-4">
                
                {/* JSON Viewer */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                  <div className="flex justify-between items-center p-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm">JSON Data</h3>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 text-xs text-gray-500 hover:text-black transition-colors bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                    >
                      {copied ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <pre className="text-xs text-gray-800 font-mono whitespace-pre-wrap word-break">
                      {JSON.stringify(demoPayload, null, 2)}
                    </pre>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
