"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { dbService } from "@/backend";
import { ArrowLeft, ShieldCheck, CreditCard, Lock } from "lucide-react";
import { State, City } from "country-state-city";

const initializeRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useStore();
  const { user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [stateCode, setStateCode] = useState("");
  
  const indianStates = State.getStatesOfCountry("IN");
  const citiesOfState = stateCode ? City.getCitiesOfState("IN", stateCode) : [];
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const cartTotal = getCartTotal();
  // We calculate +199 for items with personalization in the map loop, so getCartTotal() should ideally include it. 
  // If getCartTotal doesn't, we add it here manually.
  const personalizationTotal = cart.reduce((acc, item) => {
    return acc + ((item.customName || item.customNumber) ? 199 * item.quantity : 0);
  }, 0);
  const total = cartTotal + personalizationTotal;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email.includes("@")) newErrors.email = "Valid email required";
    if (!firstName) newErrors.firstName = "First name required";
    if (!address) newErrors.address = "Address required";
    if (!city) newErrors.city = "City required";
    if (!state) newErrors.state = "State required";
    if (pincode.length < 6) newErrors.pincode = "Valid PIN code required";
    if (phone.length < 10) newErrors.phone = "Valid phone number required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      const res = await initializeRazorpay();
      if (!res) {
        alert("Razorpay SDK Failed to load");
        setIsProcessing(false);
        return;
      }

      const data = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: total }),
      }).then((t) => t.json());

      if (!data.id) {
        alert("Server error. Please try again.");
        setIsProcessing(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        name: "Futbol Store",
        currency: data.currency,
        amount: data.amount,
        order_id: data.id,
        description: "Thank you for your purchase",
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }).then(t => t.json());
            
            if (verifyRes.message === "Payment verified successfully") {
              if (user) {
                try {
                  await dbService.createOrder(user.uid, {
                    items: cart,
                    totalAmount: total,
                    shippingAddress: {
                      firstName, lastName, email, phone, address, city, state, pincode
                    },
                    paymentId: response.razorpay_payment_id,
                    status: "PAID"
                  });
                } catch (e) {
                  console.error("Failed to save order to DB:", e);
                }
              }
              clearCart();
              router.push("/account"); 
            } else {
              alert("Payment Verification Failed!");
              setIsProcessing(false);
            }
          } catch (err) {
            console.error(err);
            alert("Payment Verification Error!");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#000000",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on("payment.failed", function (response: any) {
        alert("Payment Failed. " + response.error.description);
        setIsProcessing(false);
      });
      
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert("Error processing payment");
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center space-y-6 text-white">
        <h1 className="text-3xl font-serif">Your bag is empty.</h1>
        <button 
          onClick={() => router.push("/")}
          className="px-8 py-3 bg-white text-black hover:bg-neutral-200 text-xs uppercase tracking-widest font-semibold rounded-full transition-all duration-300"
        >
          Return to Boutique
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white selection:bg-white/20 selection:text-white pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Bag
          </button>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/50">
            Secure Checkout
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          
          <div className="lg:col-span-7 space-y-12">
            
            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-white">Contact Information</h2>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 border bg-[#141414] text-white text-sm focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-white/10 focus:border-white'}`}
                />
                <input
                  type="tel"
                  placeholder="Phone Number (for delivery updates)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-4 py-3 border bg-[#141414] text-white text-sm focus:outline-none transition-colors ${errors.phone ? 'border-red-500' : 'border-white/10 focus:border-white'}`}
                />
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-white">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full px-4 py-3 border bg-[#141414] text-white text-sm focus:outline-none transition-colors ${errors.firstName ? 'border-red-500' : 'border-white/10 focus:border-white'}`}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-white/10 bg-[#141414] text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <input
                type="text"
                placeholder="Complete Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full px-4 py-3 border bg-[#141414] text-white text-sm focus:outline-none transition-colors ${errors.address ? 'border-red-500' : 'border-white/10 focus:border-white'}`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select
                  value={stateCode}
                  onChange={(e) => {
                    const selectedStateCode = e.target.value;
                    setStateCode(selectedStateCode);
                    const stateObj = indianStates.find(s => s.isoCode === selectedStateCode);
                    setState(stateObj ? stateObj.name : "");
                    setCity("");
                  }}
                  style={{ colorScheme: 'dark' }}
                  className={`w-full px-4 py-3 border bg-[#141414] text-white text-sm focus:outline-none transition-colors ${errors.state ? 'border-red-500' : 'border-white/10 focus:border-white'}`}
                >
                  <option value="" disabled>Select State</option>
                  {indianStates.map((s) => (
                    <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                  ))}
                </select>

                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!stateCode}
                  style={{ colorScheme: 'dark' }}
                  className={`w-full px-4 py-3 border bg-[#141414] text-white text-sm focus:outline-none transition-colors ${errors.city ? 'border-red-500' : 'border-white/10 focus:border-white'} ${!stateCode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="" disabled>{stateCode ? "Select City" : "Select State First"}</option>
                  {citiesOfState.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className={`w-full px-4 py-3 border bg-[#141414] text-white text-sm focus:outline-none transition-colors ${errors.pincode ? 'border-red-500' : 'border-white/10 focus:border-white'}`}
                />
              </div>
            </section>
            
            <section className="space-y-6 pt-6 border-t border-white/10">
              <h2 className="text-2xl font-serif text-white flex items-center gap-3">
                Payment <Lock className="w-5 h-5 text-white/50" />
              </h2>
              <div className="bg-[#141414] p-6 border border-white/10 rounded-xl space-y-4">
                <p className="text-sm text-white/70 font-sans font-light leading-relaxed">
                  All transactions are secure and encrypted. Payments are processed securely via <span className="font-semibold text-white">Razorpay</span>.
                </p>
                <div className="flex gap-4 opacity-70">
                  <CreditCard className="w-8 h-8 text-white" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">Razorpay Secure</span>
                    <span className="text-[9px] text-white/50 uppercase tracking-widest">Cards, UPI, NetBanking</span>
                  </div>
                </div>
              </div>
            </section>

          </div>

          <div className="lg:col-span-5 relative">
            <div className="sticky top-32 bg-[#141414] p-8 border border-white/10 rounded-2xl space-y-8 shadow-2xl">
              <h2 className="text-2xl font-serif text-white">Order Summary</h2>
              
              <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="relative w-20 h-24 bg-black border border-white/10 rounded-lg overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center z-10 shadow-md">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1 mt-1">
                      <h4 className="text-xs font-serif font-bold text-white leading-tight">{item.name}</h4>
                      <p className="text-[10px] text-white/50 font-sans uppercase font-semibold">Size: {item.size}</p>
                      {(item.customName || item.customNumber) && (
                        <div className="text-[9px] font-mono bg-black/50 border border-white/10 px-2 py-0.5 rounded text-white/70 inline-block mt-1">
                          PRINT: <span className="text-white font-bold">{item.customName || "NONE"}</span> #{item.customNumber || "00"} (+₹199)
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-bold text-white mt-1 shrink-0">
                      ₹{((item.price + ((item.customName || item.customNumber) ? 199 : 0)) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between text-xs text-white/70 font-sans">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-white/70 font-sans">
                  <span>Shipping Charges</span>
                  <span className="text-white/50 uppercase tracking-widest font-semibold text-[9px]">Calculated at next step</span>
                </div>
                <div className="flex justify-between text-lg font-serif font-bold text-white pt-4 border-t border-white/10">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-4 bg-white text-black hover:bg-neutral-200 transition-all duration-300 text-xs uppercase tracking-[0.2em] font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isProcessing ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
                {!isProcessing && <ShieldCheck className="w-4 h-4" />}
              </button>
              
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}