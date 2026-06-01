"use client";

import React, { useState, useEffect } from 'react';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';
import { Search, Filter, Loader2, ArrowUpRight, Copy, CheckCircle2, ChevronRight, Truck, Package, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const dbService = new FirebaseDatabaseService();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = dbService.listenToAllOrders((fetchedOrders) => {
      setOrders(fetchedOrders);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await dbService.updateOrderStatus(orderId, newStatus);
      // Optimistic update for UI:
      const updatedOrders = orders.map(o => {
        if (o.id === orderId) {
          const newHistory = o.history.map((h: any) => {
            if (h.status === newStatus) return { ...h, completed: true, date: new Date().toISOString() };
            return h;
          });
          return { ...o, status: newStatus, history: newHistory };
        }
        return o;
      });
      setOrders(updatedOrders);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrders.find(o => o.id === orderId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New Order': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-black text-white rounded-md">New</span>;
      case 'Processing': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700 rounded-md">Processing</span>;
      case 'Packed': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700 rounded-md">Packed</span>;
      case 'Shipped': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-md">Shipped</span>;
      case 'Delivered': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-200 rounded-md">Delivered</span>;
      case 'Rejected (Out of Stock)': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 rounded-md">Rejected</span>;
      default: return <span>{status}</span>;
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black mb-1">Orders Management</h1>
          <p className="text-sm text-gray-500">Track, manage, and fulfill all customer orders.</p>
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
            <option value="All">All Statuses</option>
            <option value="New Order">New Order</option>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Rejected (Out of Stock)">Rejected (Out of Stock)</option>
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
                <th className="px-6 py-4 font-medium text-right">Action</th>
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
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-black">{order.id}</td>
                    <td className="px-6 py-4 text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.customerName}</td>
                    <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">{order.product}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">₹{order.amount}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} className="text-gray-400 hover:text-black">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer Overlay */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex justify-end"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-base font-bold text-black">{selectedOrder.id}</h2>
                  <p className="text-xs text-gray-500 mt-1">{selectedOrder.date}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-black rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-4 md:p-5 space-y-5 flex-1">
                
                {/* Workflow Status */}
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Order Workflow</h3>
                  <div className="relative">
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                    <ul className="space-y-2 relative">
                      {selectedOrder.history.map((step: any, idx: number) => (
                        <li key={step.status} className="flex gap-4 items-start">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                            step.completed ? 'bg-black text-white' : 'bg-gray-100 text-gray-300'
                          }`}>
                            {step.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${step.completed ? 'text-black' : 'text-gray-400'}`}>{step.status}</p>
                            {step.date && <p className="text-xs text-gray-500 mt-0.5">{new Date(step.date).toLocaleString()}</p>}
                          </div>
                          {idx === selectedOrder.history.findIndex((h:any) => !h.completed) - 1 && (
                            <button 
                              onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.history[idx+1].status)}
                              className="ml-auto text-xs font-bold bg-gray-100 hover:bg-black hover:text-white px-3 py-1.5 rounded transition-colors"
                            >
                              Mark {selectedOrder.history[idx+1].status}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                {/* Customer Details */}
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Details</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name</span>
                      <span className="font-medium text-black">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium text-black">{selectedOrder.shippingAddress?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium text-black">{selectedOrder.shippingAddress?.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Shipping Address</span>
                      <p className="font-medium text-black leading-relaxed">
                        {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                {/* Product Details */}
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Product Details</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="font-medium text-black text-xs mb-2">{item.name} <span className="text-gray-500 font-normal ml-1">(x{item.quantity})</span></p>
                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                          <div>
                            <span className="text-xs text-gray-500 block">Size</span>
                            <span className="font-medium text-black">{item.size}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Amount</span>
                            <span className="font-medium text-black">₹{item.price * item.quantity}</span>
                          </div>
                          {(item.customName || item.customNumber) && (
                            <>
                              <div>
                                <span className="text-xs text-gray-500 block">Custom Name</span>
                                <span className="font-medium text-black">{item.customName || "N/A"}</span>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 block">Custom Number</span>
                                <span className="font-medium text-black">{item.customNumber || "N/A"}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-[10px] text-gray-400 block mt-1">+ ₹199 Personalization Fee</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-2 pt-2 border-t border-gray-100">
                      <span className="text-xs font-bold text-gray-500">Total Order Amount</span>
                      <span className="text-sm font-bold text-black">₹{selectedOrder.amount || selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                {/* Payment & Tracking */}
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Payment & Tracking</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Payment Status</span>
                      <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded">
                        {selectedOrder.paymentId ? "PAID (Razorpay)" : "PENDING"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Razorpay ID</span>
                      <span className="font-mono text-xs font-medium text-black flex items-center gap-2">
                        {selectedOrder.paymentId || "N/A"} 
                        {selectedOrder.paymentId && (
                          <Copy 
                            className="w-3 h-3 text-gray-400 cursor-pointer hover:text-black" 
                            onClick={() => navigator.clipboard.writeText(selectedOrder.paymentId)}
                          />
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Tracking Status</span>
                      <span className="font-medium text-black flex items-center gap-1">
                        <Truck className="w-4 h-4 text-gray-400" /> {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-4 md:p-5 border-t border-gray-100 bg-white sticky bottom-0 z-10 flex flex-col gap-3">
                <div className="flex gap-3">
                  <button onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedOrder, null, 2))} className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-black text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors">
                    Copy Details
                  </button>
                  <button className="flex-1 py-2.5 px-4 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-900 transition-colors">
                    View Tracking
                  </button>
                </div>
                {selectedOrder.status !== 'Rejected (Out of Stock)' && (
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to reject this order? This will mark it as Out of Stock and initiate a refund process.")) {
                        updateOrderStatus(selectedOrder.id, 'Rejected (Out of Stock)');
                        setSelectedOrder({...selectedOrder, status: 'Rejected (Out of Stock)'});
                      }
                    }} 
                    className="w-full py-2.5 px-4 bg-red-50 text-red-600 border border-red-100 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Reject Order (Out of Stock / Unavailable)
                  </button>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
