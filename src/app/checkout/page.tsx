"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { dbService } from "@/backend";
import { ArrowLeft, ShieldCheck, CreditCard, Lock, Tag, XCircle } from "lucide-react";
import { State, City } from "country-state-city";
import { Coupon } from "@/backend/interfaces/db.interface";
import { calculateShipping, validateCoupon, calculateFinalTotal, evaluateCouponBenefit } from "@/utils/cartUtils";

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
  const { cart, getCartTotal, clearCart, updateQuantity } = useStore();
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
  const [saveAddress, setSaveAddress] = useState(false);

  // Delhivery Pincode State
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeServiceable, setPincodeServiceable] = useState<boolean | null>(null);
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [shippingCharge, setShippingCharge] = useState<number | null>(null);

  // User Profile Addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [showCoupons, setShowCoupons] = useState(false);


  useEffect(() => {
    dbService.getCoupons().then(coupons => {
      setAvailableCoupons(coupons.filter(c => c.isActive));
    }).catch(err => console.error("Error fetching available coupons:", err));



    if (user) {
      dbService.getUserProfile(user.uid).then((profile) => {
        if (profile) {
          if (profile.phone) setPhone(profile.phone || "");
          if (user.email) setEmail(user.email || "");
          
          if (profile.addresses && profile.addresses.length > 0) {
            setSavedAddresses(profile.addresses);
            const defaultAddress = profile.addresses.find((a: any) => a.isDefault) || profile.addresses[0];
            handleSelectAddress(defaultAddress);
          } else {
            if (user.displayName) {
              const parts = user.displayName.split(" ");
              setFirstName(parts[0] || "");
              setLastName(parts.slice(1).join(" ") || "");
            }
          }
        } else {
            if (user.email) setEmail(user.email || "");
            if (user.displayName) {
              const parts = user.displayName.split(" ");
              setFirstName(parts[0] || "");
              setLastName(parts.slice(1).join(" ") || "");
            }
        }
      }).catch(err => console.error("Error fetching profile for autofill:", err));
    }
  }, [user]);

  const handleSelectAddress = (addr: any) => {
    if (addr === 'new') {
      setSelectedAddressId('new');
      setFirstName("");
      setLastName("");
      setAddress("");
      setCity("");
      setState("");
      setStateCode("");
      setPincode("");
      setPincodeServiceable(null);
      setPincodeMessage("");
      return;
    }
    
    setSelectedAddressId(addr.id);
    if (addr.name) {
      const parts = addr.name.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }
    if (addr.street) setAddress(addr.street);
    if (addr.city) setCity(addr.city);
    if (addr.state) {
      setState(addr.state);
      const sObj = State.getStatesOfCountry("IN").find(s => s.name === addr.state);
      if (sObj) setStateCode(sObj.isoCode);
    }
    if (addr.zipCode) {
      setPincode(addr.zipCode);
      checkPincode(addr.zipCode); // auto-check when they select an address!
    }
    if (addr.phone) setPhone(addr.phone);
  };

  useEffect(() => {
    // If the user has a valid pincode and adds/removes items, re-check to get the correct weight-based price from Delhivery
    if (pincodeServiceable && pincode.length === 6) {
      checkPincode(pincode);
    }
  }, [cart]);

  const cartTotal = getCartTotal();
  // getCartTotal() already includes the personalization fee from StoreContext, 
  // so subTotal is simply the cartTotal.
  const subTotal = cartTotal;

  // --- Dynamic Shipping Evaluation ---
  useEffect(() => {
    if (state && city) {
      const totalJerseys = cart.reduce((acc, item) => acc + item.quantity, 0);
      const shipping = calculateShipping(state, totalJerseys);
      setShippingCharge(shipping);
    } else {
      setShippingCharge(null);
    }
  }, [state, city, cart]);
  // Reactive Coupon Validation
  useEffect(() => {
    if (appliedCoupon) {
      const validation = validateCoupon(appliedCoupon, subTotal, cart);
      if (!validation.valid) {
        setAppliedCoupon(null);
        setCouponError(validation.error || "Coupon removed because it's no longer valid for your cart.");
      }
    }
  }, [subTotal, cart, appliedCoupon]);

  // Calculate Totals using advanced Coupon benefit logic
  const discountAmount = appliedCoupon ? evaluateCouponBenefit(appliedCoupon, subTotal, cart, shippingCharge) : 0;
  const finalTotal = calculateFinalTotal(subTotal, shippingCharge, discountAmount);

  const handleApplyCoupon = async (overrideCode?: string) => {
    setCouponError("");
    const codeToApply = (overrideCode || couponCodeInput).trim();
    
    if (!codeToApply) {
      setCouponError("Please enter a coupon code");
      return;
    }
    
    setIsApplyingCoupon(true);
    try {
      const coupon = await dbService.getCouponByCode(codeToApply);
      if (!coupon) {
        setCouponError("Invalid coupon code");
      } else if (!coupon.isActive) {
        setCouponError("This coupon is currently disabled");
      } else if (coupon.minOrderValue && subTotal < coupon.minOrderValue) {
        setCouponError(`Minimum order value to use this coupon is ₹${coupon.minOrderValue}`);
      } else if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < new Date().getTime()) {
        setCouponError("This coupon has expired");
      } else {
        const validation = validateCoupon(coupon, subTotal, cart);
        if (!validation.valid) {
          setCouponError(validation.error || `This coupon is not valid for your current cart.`);
          setAppliedCoupon(null);
          return;
        } else {
          setAppliedCoupon(coupon);
          setCouponCodeInput("");
        }
      }
    } catch (err) {
      console.error(err);
      setCouponError("Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) newErrors.email = "Valid email required";
    if (!firstName.trim()) newErrors.firstName = "First name required";
    if (!address.trim()) newErrors.address = "Address required";
    if (!city.trim()) newErrors.city = "City required";
    if (!state.trim()) newErrors.state = "State required";
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) newErrors.pincode = "Valid 6-digit PIN code required";
    if (pincodeServiceable === false) newErrors.pincode = "Delivery not available at this pincode";
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) newErrors.phone = "Valid 10-digit phone number required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkPincode = async (code: string) => {
    if (code.length < 6) return false;
    setIsCheckingPincode(true);
    setPincodeMessage("");
    try {
      const totalJerseys = cart.reduce((acc, item) => acc + item.quantity, 0);
      const weight = Math.max(1, totalJerseys) * 500; // Assume 500g per jersey

      const res = await fetch(`/api/delhivery/pincode?pincode=${code}&weight=${weight}`);
      const data = await res.json();
      
      if (data.delivery_codes && data.delivery_codes.length > 0) {
        const pinData = data.delivery_codes[0].postal_code;
        
        // Auto-detect and fill area based on Pincode
        if (pinData.state_code) {
          const stateObj = indianStates.find(s => s.isoCode === pinData.state_code);
          if (stateObj) {
            setState(stateObj.name);
            setStateCode(stateObj.isoCode);
            
            const apiCity = pinData.district || pinData.city || "";
            if (apiCity) {
              // Capitalize first letter to match dropdown conventions if possible
              const formattedCity = apiCity.charAt(0).toUpperCase() + apiCity.slice(1).toLowerCase();
              setCity(formattedCity);
            }
          }
        }

        setPincodeServiceable(true);
        setPincodeMessage("Delivery available!");
        return true;
      } else {
        setPincodeServiceable(false);
        setPincodeMessage("Delivery not available at this pincode.");
        return false;
      }
    } catch (err) {
      console.error(err);
      setPincodeServiceable(null);
      setPincodeMessage("Error checking pincode");
      return false;
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const handlePayment = async () => {
    if (shippingCharge === null) {
      alert("Please select a valid State and City to calculate shipping before proceeding.");
      return;
    }

    if (!validateForm()) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    if (pincodeServiceable === null) {
      const serviceable = await checkPincode(pincode);
      if (!serviceable) {
        alert("Delivery is not available at the entered PIN Code.");
        return;
      }
    } else if (pincodeServiceable === false) {
       alert("Delivery is not available at the entered PIN Code.");
       return;
    }
    
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
        body: JSON.stringify({ amount: finalTotal }),
      }).then((t) => t.json());

      if (!data.id) {
        alert(data.error || "Server error. Please try again.");
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
              try {
                const customerName = `${firstName} ${lastName}`;
                const productName = cart.map((item: any) => item.name).join(", ");
                const finalAmount = finalTotal;
                const finalDate = new Date().toLocaleDateString();
                const userId = user ? user.uid : "GUEST";
                const rawPayload = {
                  items: cart,
                  totalAmount: finalAmount,
                  subTotal: subTotal,
                  shippingCharges: shippingCharge || 0,
                  discountAmount: discountAmount,
                  couponApplied: appliedCoupon ? appliedCoupon.code : null,
                  amount: finalAmount,
                  customerName: customerName,
                  product: productName,
                  date: finalDate,
                  shippingAddress: {
                    firstName: firstName || "", 
                    lastName: lastName || "", 
                    email: email || "", 
                    phone: phone || "", 
                    address: address || "", 
                    city: city || "", 
                    state: state || "", 
                    pincode: pincode || ""
                  },
                  paymentId: response.razorpay_payment_id || "UNKNOWN",
                  status: "New Order",
                  history: [{ status: "New Order", date: new Date().toISOString(), completed: true }]
                };

                const safePayload = JSON.parse(JSON.stringify(rawPayload));

                const createdOrderId = await dbService.createOrder(userId, safePayload);

                // Send confirmation email asynchronously (do not await)
                fetch("/api/emails/order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId: createdOrderId,
                    customerName: customerName,
                    email: email,
                    items: cart,
                    totalAmount: finalAmount,
                    shippingAddress: {
                      firstName,
                      lastName,
                      address,
                      city,
                      state,
                      pincode,
                      phone
                    }
                  })
                }).catch(err => console.error("Failed to trigger email API", err));

                if (user && saveAddress) {
                  try {
                    const profile = await dbService.getUserProfile(user.uid);
                    let addresses = profile?.addresses || [];
                    
                    // Unset previous defaults
                    addresses = addresses.map((a: any) => ({ ...a, isDefault: false }));
                    
                    if (selectedAddressId !== 'new') {
                      const addrIndex = addresses.findIndex((a: any) => a.id === selectedAddressId);
                      if (addrIndex !== -1) {
                        addresses[addrIndex] = {
                          ...addresses[addrIndex],
                          name: `${firstName} ${lastName}`,
                          street: address,
                          city: city,
                          state: state,
                          zipCode: pincode,
                          phone: phone,
                          isDefault: true
                        };
                      } else {
                        // Fallback if not found
                        addresses.push({
                          id: selectedAddressId,
                          label: "Home",
                          name: `${firstName} ${lastName}`,
                          street: address,
                          city: city,
                          state: state,
                          zipCode: pincode,
                          country: "India",
                          phone: phone,
                          isDefault: true
                        });
                      }
                    } else {
                      const newAddress = {
                        id: Math.random().toString(36).substring(2, 10),
                        label: addresses.length === 0 ? "Home" : "Other",
                        name: `${firstName} ${lastName}`,
                        street: address,
                        city: city,
                        state: state,
                        zipCode: pincode,
                        country: "India",
                        phone: phone,
                        isDefault: true
                      };
                      addresses.push(newAddress);
                    }
                    
                    await dbService.updateUserProfile(user.uid, { addresses });
                  } catch (err) {
                    console.error("Failed to auto-save address", err);
                  }
                }
                
                clearCart();
                router.push(`/track/${createdOrderId}`); 
              } catch (e: any) {
                console.error("Failed to save order to DB:", e);
                alert("Failed to save order to database: " + (e.message || "Unknown error"));
              }
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
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
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
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white selection:bg-white/20 selection:text-white pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        
        <div className="flex justify-between items-center mb-6">
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

        <div className="grid lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-7 space-y-8">
            
            {savedAddresses.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-serif text-white">Select Saved Address</h2>
                <div className="space-y-2 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`text-left p-3 rounded-lg border text-xs transition-colors flex flex-col gap-1 ${
                          selectedAddressId === addr.id 
                            ? 'border-white bg-white/10' 
                            : 'border-white/10 bg-[#141414] hover:border-white/30'
                        }`}
                      >
                        <span className="font-bold text-white flex items-center justify-between w-full">
                          {addr.label}
                          {addr.isDefault && <span className="bg-white text-black px-1.5 py-0.5 rounded text-[8px] uppercase tracking-widest">Default</span>}
                        </span>
                        <span className="text-white/70 truncate w-full">{addr.name}</span>
                        <span className="text-white/50 truncate w-full">{addr.street}, {addr.city}</span>
                        <span className="text-white/50 truncate w-full">{addr.state} - {addr.zipCode}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => handleSelectAddress('new')}
                      className={`text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-center ${
                        selectedAddressId === 'new' 
                          ? 'border-white bg-white/10' 
                          : 'border-white/10 bg-[#141414] hover:border-white/30 text-white/50'
                      }`}
                    >
                      <span className="font-bold uppercase tracking-widest">+ Use New Address</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-4">
              <h2 className="text-lg font-serif text-white">Contact Information</h2>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 border bg-[#141414] text-white text-xs focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-white/10 focus:border-white'}`}
                />
                <input
                  type="tel"
                  placeholder="Phone Number (for delivery updates)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-3 py-2 border bg-[#141414] text-white text-xs focus:outline-none transition-colors ${errors.phone ? 'border-red-500' : 'border-white/10 focus:border-white'}`}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-serif text-white">Shipping Address</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full px-3 py-2 border bg-[#141414] text-white text-xs focus:outline-none transition-colors ${errors.firstName ? 'border-red-500' : 'border-white/10 focus:border-white'}`}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 bg-[#141414] text-white text-xs focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <input
                type="text"
                placeholder="Complete Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full px-3 py-2 border bg-[#141414] text-white text-xs focus:outline-none transition-colors ${errors.address ? 'border-red-500' : 'border-white/10 focus:border-white'}`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={state}
                  onChange={(e) => {
                    const selectedStateName = e.target.value;
                    setState(selectedStateName);
                    const stateObj = indianStates.find(s => s.name === selectedStateName);
                    setStateCode(stateObj ? stateObj.isoCode : "");
                    setCity("");
                  }}
                  disabled={pincodeServiceable === true}
                  style={{ colorScheme: 'dark' }}
                  className={`w-full px-3 py-2 border bg-[#141414] text-white text-xs focus:outline-none transition-colors ${errors.state ? 'border-red-500' : 'border-white/10 focus:border-white'} ${pincodeServiceable === true ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="" disabled>Select State</option>
                  {indianStates.map((s) => (
                    <option key={s.isoCode} value={s.name}>{s.name}</option>
                  ))}
                </select>

                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!stateCode || pincodeServiceable === true}
                  style={{ colorScheme: 'dark' }}
                  className={`w-full px-3 py-2 border bg-[#141414] text-white text-xs focus:outline-none transition-colors ${errors.city ? 'border-red-500' : 'border-white/10 focus:border-white'} ${(!stateCode || pincodeServiceable === true) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="" disabled>{stateCode ? "Select City" : "Select State First"}</option>
                  {citiesOfState.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                  {/* Fallback option if auto-filled city is not in the list exactly as matched */}
                  {city && !citiesOfState.find(c => c.name === city) && (
                    <option value={city}>{city}</option>
                  )}
                </select>
                
                <div className="relative flex-col flex gap-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="PIN Code"
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value);
                        setPincodeServiceable(null);
                        setPincodeMessage("");
                      }}
                      className={`w-full px-3 py-2 border bg-[#141414] text-white text-xs focus:outline-none transition-colors pr-16 ${errors.pincode ? 'border-red-500' : 'border-white/10 focus:border-white'}`}
                    />
                    <button 
                      onClick={() => checkPincode(pincode)}
                      disabled={isCheckingPincode || pincode.length < 6}
                      className="absolute right-1 top-1 bottom-1 px-3 text-[10px] font-bold uppercase bg-white/10 hover:bg-white/20 rounded disabled:opacity-50 transition-colors"
                    >
                      {isCheckingPincode ? '...' : 'Check'}
                    </button>
                  </div>
                  {pincodeMessage && (
                    <p className={`text-[10px] ${pincodeServiceable ? 'text-green-400' : 'text-red-400'}`}>
                      {pincodeMessage}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-white/50 italic pt-1">
                Enter your PIN code and click "CHECK" to automatically locate and lock your State and City.
              </p>
              {user ? (
                <div className="flex items-center space-x-3 mt-5 p-3 border border-white/10 rounded-lg bg-white/5">
                  <input 
                    type="checkbox" 
                    id="saveAddress" 
                    checked={saveAddress} 
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="w-4 h-4 accent-white cursor-pointer rounded"
                  />
                  <label htmlFor="saveAddress" className="cursor-pointer select-none text-xs text-white/80 font-medium">Save this as a delivery address for future orders</label>
                </div>
              ) : (
                <div className="mt-5 p-3 border border-white/10 rounded-lg bg-white/5">
                  <p className="text-xs text-white/50 italic">Log in or create an account to save delivery addresses for future orders.</p>
                </div>
              )}
            </section>
            
            <section className="space-y-4 pt-4 border-t border-white/10">
              <h2 className="text-lg font-serif text-white flex items-center gap-2">
                Payment <Lock className="w-5 h-5 text-white/50" />
              </h2>
              <div className="bg-[#141414] p-5 border border-white/10 rounded-xl space-y-3">
                <p className="text-xs text-white/70 font-sans font-light leading-relaxed">
                  All transactions are secure and encrypted. Payments are processed securely via <span className="font-semibold text-white">Razorpay</span>.
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-white px-2 py-1 rounded-md flex items-center justify-center shadow-sm">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4 w-auto object-contain" />
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded-md flex items-center justify-center shadow-sm">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-4 w-auto object-contain" />
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded-md flex items-center justify-center shadow-sm">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-4 w-auto object-contain" />
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded-md flex items-center justify-center shadow-sm">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-4 w-auto object-contain" />
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded-md flex items-center justify-center shadow-sm">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d1/RuPay.svg" alt="RuPay" className="h-4 w-auto object-contain" />
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded-md flex items-center justify-center shadow-sm">
                      <img src="https://cdn.simpleicons.org/visa/1434CB" alt="Visa" className="h-4 w-auto object-contain" />
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded-md flex items-center justify-center shadow-sm">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 w-auto object-contain" />
                    </div>
                  </div>

                  <div className="flex gap-3 opacity-70 border-t border-white/10 pt-3 mt-1">
                    <ShieldCheck className="w-6 h-6 text-green-500" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-white">Razorpay Secure Checkout</span>
                      <span className="text-[8px] text-white/50 uppercase tracking-widest">100% Encrypted Payments</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-3 rounded-lg mt-2 border border-white/10">
                    <p className="text-[11px] text-white/80 leading-relaxed font-light">
                      <span className="font-semibold text-white">Notice:</span> If the jersey wouldn't be available due to any unforeseen condition (e.g. stock shortage), the refund process will be initiated automatically. 
                      <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="ml-1 underline text-white/50 hover:text-white transition-colors">
                        View Refund Policy
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          <div className="lg:col-span-5 relative">
            <div className="sticky top-20 bg-[#141414] p-5 border border-white/10 rounded-xl space-y-5 shadow-2xl">
              <h2 className="text-lg font-serif text-white">Order Summary</h2>
              
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="relative w-14 h-16 bg-black border border-white/10 rounded-lg overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                    </div>
                    <div className="flex-1 space-y-0.5 mt-0.5">
                      <h4 className="text-[11px] font-serif font-bold text-white leading-tight">{item.name}</h4>
                      <p className="text-[9px] text-white/50 font-sans uppercase font-semibold">Size: {item.size}</p>
                      {(item.customName || item.customNumber) && (
                        <div className="text-[8px] font-mono bg-black/50 border border-white/10 px-1.5 py-0.5 rounded text-white/70 inline-block mt-0.5">
                          PRINT: <span className="text-white font-bold">{item.customName || "NONE"}</span> #{item.customNumber || "00"} (+₹199)
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] text-white/50 font-sans uppercase font-semibold">QTY:</span>
                        <div className="flex items-center gap-1.5 bg-[#1a1a1a] rounded-md px-1.5 py-0.5 border border-white/10">
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, -1, item.customName, item.customNumber)}
                            className="text-white/50 hover:text-white transition-colors w-3 flex justify-center text-[10px]"
                          >
                            -
                          </button>
                          <span className="text-[10px] font-bold text-white min-w-[1ch] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, 1, item.customName, item.customNumber)}
                            className="text-white/50 hover:text-white transition-colors w-3 flex justify-center text-[10px]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-white mt-0.5 shrink-0">
                      ₹{((item.price + ((item.customName || item.customNumber) ? 199 : 0)) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <h3 className="text-xs font-serif text-white flex items-center gap-1.5"><Tag className="w-3 h-3 text-white/70" /> Discount Code</h3>
                
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-[#1f1f1f] border border-white/10 p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                        <Tag className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white uppercase tracking-wider">{appliedCoupon.code}</p>
                        <p className="text-[9px] text-green-400 font-semibold uppercase tracking-wider">Coupon Applied</p>
                      </div>
                    </div>
                    <button onClick={removeCoupon} className="text-white/40 hover:text-red-400 transition-colors">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Enter code" 
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-[#141414] border border-white/10 px-3 py-2 rounded-md text-xs text-white focus:outline-none focus:border-white transition-colors uppercase"
                      />
                      <button 
                        onClick={() => handleApplyCoupon()}
                        disabled={isApplyingCoupon || !couponCodeInput}
                        className="bg-white text-black px-4 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors disabled:opacity-50"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-red-400 text-[10px]">{couponError}</p>}
                      
                      {/* Available Coupons List */}
                      {availableCoupons.length > 0 && (
                        <div className="mt-2 space-y-2">
                          <button 
                            onClick={() => setShowCoupons(!showCoupons)}
                            className="text-[10px] text-white/50 hover:text-white uppercase tracking-widest font-semibold flex items-center gap-1 transition-colors"
                          >
                            View All Coupons {showCoupons ? '▲' : '▼'}
                          </button>
                          
                          {showCoupons && (
                            <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar border-t border-white/10 pt-2">
                              {availableCoupons.map(coupon => (
                                <button
                                  key={coupon.id}
                                  onClick={() => {
                                    setCouponCodeInput(coupon.code);
                                    handleApplyCoupon(coupon.code);
                                    setShowCoupons(false);
                                  }}
                                  className="px-3 py-2 border border-dashed border-white/20 bg-white/5 hover:bg-white/10 rounded-md text-[11px] text-white uppercase tracking-wider transition-all flex flex-col items-start gap-1 w-full text-left"
                                >
                                  <div className="flex items-center gap-2 w-full justify-between">
                                    <span className="font-bold tracking-widest">{coupon.code}</span>
                                    <span className="text-green-400 font-bold ml-3 bg-green-400/10 px-2 py-0.5 rounded text-[10px]">
                                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                    </span>
                                  </div>
                                  {coupon.minOrderValue ? (
                                    <span className="text-[9px] text-white/40 normal-case tracking-normal">
                                      Applicable on orders above ₹{coupon.minOrderValue}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-white/40 normal-case tracking-normal">
                                      Applicable on all orders
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-[11px] text-white/70 font-sans">
                    <span>Subtotal</span>
                    <span>₹{subTotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-[11px] text-green-400 font-sans">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[11px] text-white/70 font-sans">
                    <span>Shipping Charges</span>
                    {shippingCharge !== null ? (
                      <span>{shippingCharge === 0 ? <span className="text-green-400 font-bold text-[10px] tracking-widest">FREE SHIPPING</span> : `₹${shippingCharge.toFixed(2)}`}</span>
                    ) : (
                      <span className="text-white/50 uppercase tracking-widest font-semibold text-[9px]">Select State & City</span>
                    )}
                  </div>
                  <div className="flex justify-between items-end text-base font-serif font-bold text-white pt-3 border-t border-white/10">
                    <span>Total</span>
                    <div className="text-right flex items-center gap-2">
                      {appliedCoupon && (
                        <span className="text-xs text-white/40 line-through">₹{(subTotal + (shippingCharge || 0)).toFixed(2)}</span>
                      )}
                      <span>₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing || shippingCharge === null}
                  className="w-full py-3 bg-white text-black hover:bg-neutral-200 transition-all duration-300 text-[11px] uppercase tracking-[0.2em] font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? "Processing..." : `Pay ₹${finalTotal.toFixed(2)}`}
                  {!isProcessing && <ShieldCheck className="w-3 h-3" />}
                </button>
              
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}