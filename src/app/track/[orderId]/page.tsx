"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { dbService } from "@/backend";
import { ArrowLeft, CheckCircle2, Circle, Truck, Package, PackageCheck, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TrackShipmentPage() {
  const { orderId } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrackingInfo() {
      if (!orderId) return;
      try {
        setLoading(true);
        // 1. Fetch Order from Firebase
        const orderData = await dbService.getOrderById(orderId as string);
        if (!orderData) {
          setError("Order not found.");
          setLoading(false);
          return;
        }
        setOrder(orderData);

        // 2. Fetch Tracking from Delhivery if AWB exists
        const awb = orderData.delhiveryAwb || orderData.awb;
        if (awb) {
          const res = await fetch(`/api/delhivery/track?awb=${awb}`);
          const data = await res.json();
          if (data && data.ShipmentData && data.ShipmentData.length > 0) {
            setTrackingData(data.ShipmentData[0].Shipment);
          } else {
            console.log("No shipment data found from Delhivery API for AWB:", awb);
          }
        }
      } catch (err) {
        console.error("Tracking Error:", err);
        setError("Failed to load tracking information.");
      } finally {
        setLoading(false);
      }
    }
    fetchTrackingInfo();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-white flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center">
          <Truck className="w-8 h-8 mb-4 text-luxury-dark" />
          <p className="text-xs uppercase tracking-widest text-white/50">Loading Tracking Info...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-white flex flex-col items-center justify-center space-y-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h1 className="text-2xl font-serif">Tracking Unavailable</h1>
        <p className="text-sm text-white/60">{error}</p>
        <button 
          onClick={() => router.back()}
          className="px-6 py-2 bg-white text-black text-xs uppercase tracking-widest font-bold rounded-full hover:bg-neutral-200 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }


  if (order.status === "Rejected (Out of Stock)" || order.status?.toLowerCase().includes("cancel") || order.status?.toLowerCase().includes("reject")) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#0B0B0C] text-white flex flex-col items-center justify-center space-y-6 font-sans">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <h1 className="text-3xl font-serif">Order Cancelled</h1>
          <p className="text-sm text-white/60 max-w-md text-center">
            This order has been cancelled or rejected by the seller. If you have already paid, a refund will be processed shortly.
          </p>
          <button 
            onClick={() => router.back()}
            className="px-8 py-3 bg-white text-black text-xs uppercase tracking-widest font-bold rounded-full hover:bg-neutral-200 transition-colors mt-4"
          >
            Go Back
          </button>
        </div>
      </>
    );
  }

  const mainItem = order.items && order.items.length > 0 ? order.items[0] : null;

  // Determine current active step based on order and tracking data
  // Steps: 0: Order Placed, 1: Shipped, 2: In Transit, 3: Delivered
  let currentStep = 0;
  let currentStatusText = "Your order has been placed successfully.";
  let deliveryDate = "Estimated delivery varies.";

  if (trackingData) {
    const statusType = trackingData.Status?.StatusType?.toLowerCase() || "";
    const statusStr = trackingData.Status?.Status?.toLowerCase() || "";
    
    if (statusType === "dl" || statusStr.includes("delivered")) {
      currentStep = 3;
      currentStatusText = "Your package has been delivered.";
      deliveryDate = trackingData.Status?.StatusDateTime || "Recently";
    } else if (statusStr.includes("transit") || statusType === "ud" || trackingData.Scans?.length > 1) {
      currentStep = 2;
      currentStatusText = "Your package is currently in transit.";
      deliveryDate = trackingData.ExpectedDeliveryDate ? new Date(trackingData.ExpectedDeliveryDate).toLocaleDateString() : "Pending";
    } else if (statusStr.includes("dispatched") || statusStr.includes("manifested") || statusStr.includes("picked up") || trackingData.Scans?.length > 0) {
      currentStep = 1;
      currentStatusText = "Your package has been shipped and is with the courier.";
      deliveryDate = trackingData.ExpectedDeliveryDate ? new Date(trackingData.ExpectedDeliveryDate).toLocaleDateString() : "Pending";
    }
  } else if (order.status !== "New Order" && (order.delhiveryAwb || order.awb)) {
    currentStep = 1;
    currentStatusText = "AWB Generated. Waiting for courier pickup.";
  }

  // Generate Steps Array
  const steps = [
    {
      title: "Order Placed",
      description: "We've received your order.",
      icon: <Package className="w-4 h-4" />,
      date: new Date(order.createdAt).toLocaleDateString(),
    },
    {
      title: "Shipped",
      description: "Handed over to delivery partner.",
      icon: <Truck className="w-4 h-4" />,
      date: currentStep >= 1 && trackingData ? (trackingData.PickUpDate ? new Date(trackingData.PickUpDate).toLocaleDateString() : "Pending") : "",
    },
    {
      title: "In Transit",
      description: trackingData && currentStep >= 2 ? (trackingData.Status?.Instructions || "On the way to your city.") : "On the way to your city.",
      icon: <Truck className="w-4 h-4" />,
      date: currentStep >= 2 ? "Updated" : "",
    },
    {
      title: "Delivered",
      description: "Package delivered to your address.",
      icon: <PackageCheck className="w-4 h-4" />,
      date: currentStep === 3 ? (trackingData?.Status?.StatusDateTime || "Delivered") : "",
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0B0B0C] text-white selection:bg-white/20 selection:text-white pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors duration-300 mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">Order Details & Tracking</h1>
          <p className="text-xs font-sans text-white/50 uppercase tracking-widest mb-10">
            Order #{order.id} {order.awb && `| AWB: ${order.awb}`}
          </p>

          <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-dark/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Order Items List */}
            <div className="mb-10 pb-8 border-b border-white/10 relative z-10">
              <h3 className="text-sm uppercase tracking-widest text-white/50 font-bold mb-6">Items Ordered</h3>
              <div className="space-y-6">
                {order.items && order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-24 h-24 bg-black rounded-xl overflow-hidden border border-white/5 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-base font-serif font-bold text-white mb-1">{item.name}</h2>
                      <p className="text-xs text-white/50 font-sans uppercase tracking-widest mb-1">
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                      {item.personalisation && (
                        <p className="text-[10px] text-[#cda491] uppercase tracking-widest">
                          {item.personalisation.name} - {item.personalisation.number}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-base font-serif font-bold text-white">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary & Address */}
            <div className="grid md:grid-cols-2 gap-10 mb-10 pb-8 border-b border-white/10 relative z-10">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-white/50 font-bold mb-4">Shipping Address</h3>
                {order.shippingAddress ? (
                  <div className="text-xs text-white/80 leading-relaxed font-sans">
                    <p className="font-bold text-white text-sm mb-1">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                    <p className="mt-2 text-white/50">Phone: {order.shippingAddress.phone}</p>
                    <p className="text-white/50">Email: {order.shippingAddress.email}</p>
                  </div>
                ) : (
                  <p className="text-xs text-white/50">No address provided.</p>
                )}
              </div>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <h3 className="text-sm uppercase tracking-widest text-white/50 font-bold mb-4">Payment Summary</h3>
                <div className="space-y-3 text-xs text-white/80">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{order.subTotal || order.totalAmount}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount {order.appliedCoupon && `(${order.appliedCoupon})`}</span>
                      <span>-₹{order.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{order.shippingCharges === 0 ? "Free" : `₹${order.shippingCharges || 0}`}</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                    <span>Total Paid</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Section Header */}
            <div className="mb-6 relative z-10 flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-widest text-white/50 font-bold">Tracking Timeline</h3>
              <div className="inline-block bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                <p className="text-[10px] text-white/60 uppercase tracking-widest mb-1 text-right">Status</p>
                <p className="text-sm font-semibold text-green-400">{currentStatusText}</p>
              </div>
            </div>

            {/* Vertical Timeline Stepper */}
            <div className="relative pl-4 md:pl-8 py-4 z-10">
              
              {/* Vertical Line Background */}
              <div className="absolute top-8 bottom-8 left-[31px] md:left-[47px] w-0.5 bg-white/10" />
              
              {/* Vertical Line Fill */}
              <div 
                className="absolute top-8 left-[31px] md:left-[47px] w-0.5 bg-green-500 transition-all duration-1000 ease-out"
                style={{ height: `calc(${(currentStep / (steps.length - 1)) * 100}% - 32px)` }}
              />

              <div className="space-y-12">
                {steps.map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isActive = index === currentStep;

                  return (
                    <div key={index} className="relative flex items-start group">
                      
                      {/* Step Circle */}
                      <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-[#141414] transition-colors duration-500 mr-6 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                           style={{ 
                             borderColor: isCompleted ? '#22c55e' : 'rgba(255,255,255,0.2)',
                             color: isCompleted ? '#22c55e' : 'rgba(255,255,255,0.3)'
                           }}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5 fill-green-500/20 text-green-500" /> : <Circle className="w-3 h-3" />}
                        
                        {isActive && (
                          <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-30" />
                        )}
                      </div>

                      {/* Step Content on Right Hand Side */}
                      <div className={`flex flex-col pt-1 transition-opacity duration-500 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          {step.title}
                          {isCompleted && step.icon}
                        </h3>
                        <p className="text-xs text-white/60 font-sans mt-1 max-w-sm leading-relaxed">
                          {step.description}
                        </p>
                        {step.date && (
                          <span className="text-[10px] text-white/40 mt-2 uppercase tracking-widest font-mono">
                            {step.date}
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Extra Scan Details (Optional for debugging or detailed view) */}
            {trackingData && trackingData.Scans && trackingData.Scans.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/10 z-10 relative">
                <h4 className="text-xs uppercase tracking-widest text-white/50 mb-4 font-bold">Detailed Activity</h4>
                <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {trackingData.Scans.map((scan: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start border-l-2 border-white/5 pl-4 ml-1">
                      <div>
                        <p className="text-xs text-white font-semibold">{scan.ScanDetail.Scan || scan.ScanDetail.Instructions}</p>
                        <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono mt-1">
                          {scan.ScanDetail.ScannedLocation} • {scan.ScanDetail.ScanDateTime}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
   
    </>
  );
}
